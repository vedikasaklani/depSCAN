from fastapi import APIRouter
from database import db
from datetime import datetime

import tempfile
import subprocess
import requests
import json

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


router = APIRouter(prefix="/scan", tags=["Scan"])
@router.post("/")
def start_scan(data: dict):

    project_name = data.get("project_name")
    repo_url = data.get("repo_url")

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
            {
                "$set": {
                    "status": "cloned",
                    "local_path": temp_dir
                }
            }
        )

        # File paths
        scanner_output = BASE_DIR / "parsed_components.json"
        sbom_output = BASE_DIR / "sbom.cdx.json"

        # Run scanner
        subprocess.run(
            [
                "python",
                "-m",
                "sbomgen.cli",
                "scan",
                temp_dir,
                "--output",
                str(scanner_output)
            ],
            check=True,
            cwd=BASE_DIR
        )

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "scanned"}}
        )

        # Build SBOM
        subprocess.run(
            [
                "python",
                "sbom_builder.py",
                "--input",
                str(scanner_output),
                "--output",
                str(sbom_output),
                "--project",
                project_name
            ],
            check=True,
            cwd=BASE_DIR
        )

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "sbom_generated"}}
        )

        # Upload SBOM
        with open(sbom_output, "r") as f:
            sbom_data = json.load(f)

        response = requests.post(
            "http://127.0.0.1:8000/sbom/upload",
            json=sbom_data
        )

        response.raise_for_status()

        upload_result = response.json()

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {
                "$set": {
                    "status": "completed",
                    "sbom_id": upload_result["id"]
                }
            }
        )

        return {
            "scan_id": scan_id,
            "sbom_id": upload_result["id"],
            "status": "completed"
        }

    except Exception as e:

        db.scan_jobs.update_one(
            {"_id": result.inserted_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(e)
                }
            }
        )

        raise e