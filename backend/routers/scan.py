from fastapi import APIRouter
from backend.database import db
from datetime import datetime

import sys
import tempfile
import subprocess
import requests
import json

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


router = APIRouter(prefix="/scan", tags=["Scan"])


@router.post("/")
def start_scan(data: dict):

    project_name: str = data["project_name"]
    repo_url: str = data["repo_url"]

    scan_job = {
        "project_name": project_name,
        "repo_url": repo_url,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat()
    }

    result = db.scan_jobs.insert_one(scan_job)
    scan_id = str(result.inserted_id)

    try:
        temp_dir = tempfile.mkdtemp()

        print("BASE_DIR =", BASE_DIR)
        print("TEMP_DIR =", temp_dir)

        # Clone repository
        subprocess.run(
            ["git", "clone", repo_url, temp_dir],
            check=True
        )

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "cloned", "local_path": temp_dir}}
        )

        # File paths (unique per scan to avoid collisions between scans)
        scanner_output = BASE_DIR / f"parsed_components_{scan_id}.json"
        sbom_output = BASE_DIR / f"sbom_{scan_id}.cdx.json"

        # Run the real CLI scanner
        subprocess.run(
            [
                sys.executable, "-m", "sbomgen.cli",
                "scan", temp_dir,
                "--output", str(scanner_output)
            ],
            check=True,
            cwd=BASE_DIR
        )

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "scanned"}}
        )

        # Build SBOM using the real builder script
        subprocess.run(
            [
                sys.executable, "sbom_builder.py",
                "--input", str(scanner_output),
                "--output", str(sbom_output),
                "--project", project_name
            ],
            check=True,
            cwd=BASE_DIR
        )

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "sbom_generated"}}
        )

        # Upload SBOM to backend store
        with open(sbom_output, "r") as f:
            sbom_data = json.load(f)

        response = requests.post(
            "http://127.0.0.1:8000/sbom/upload",
            json=sbom_data
        )
        print(response.status_code)
        print(response.text)
        response.raise_for_status()

        upload_result = response.json()
        sbom_id = upload_result["id"]

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "uploaded", "sbom_id": sbom_id}}
        )

        # --- Vulnerability enrichment (OSV + NVD) ---
        print("\nStarting vulnerability enrichment...")

        enrichment_root = str(BASE_DIR / "vuln-enrichment")
        if enrichment_root not in sys.path:
            sys.path.insert(0, enrichment_root)

        from services.enricher import enrich_component

        components = list(db.components.find({"sbom_id": sbom_id}, {"_id": 0}))
        db.vulns.delete_many({"sbom_id": sbom_id})

        vuln_count = 0
        for component in components:
            if not component.get("purl"):
                print(f"Skipping {component.get('name')}: missing purl")
                continue

            enriched = enrich_component(component, sbom_id)

            for vuln in enriched.get("vulnerabilities", []):
                db.vulns.insert_one({
                    "sbom_id": sbom_id,
                    "component_name": component.get("name"),
                    "component_version": component.get("version"),
                    "purl": component.get("purl"),
                    "cve_id": vuln.get("cve_id"),
                    "severity": vuln.get("severity"),
                    "cvss_score": vuln.get("cvss_score"),
                    "summary": vuln.get("summary"),
                })
                vuln_count += 1

        print(f"\nEnrichment completed. Stored {vuln_count} vulnerabilities.")

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "completed"}}
        )

        return {
            "scan_id": scan_id,
            "sbom_id": sbom_id,
            "status": "completed",
            "vulnerabilities_found": vuln_count
        }

    except Exception as e:

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )

        raise e