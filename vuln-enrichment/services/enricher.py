from clients.osv_client import get_vulnerabilities
from clients.nvd_client import get_nvd_details
from services.deduplicator import deduplicate_vulnerabilities

nvd_cache = {}


def enrich_component(component, sbom_id):
    purl = component["purl"]

    print(f"\nScanning {component['name']}...")

    vulnerabilities = get_vulnerabilities(purl)

    print(f"OSV returned {len(vulnerabilities)} vulnerabilities")

    enriched_vulnerabilities = []

    for vuln in vulnerabilities:
        aliases = vuln.get("aliases", [])
        cve_id = next((a for a in aliases if a.startswith("CVE-")), None)

        severity = "UNKNOWN"
        cvss_score = None

        if cve_id:
            if cve_id in nvd_cache:
                nvd_data = nvd_cache[cve_id]
            else:
                print(f"Fetching NVD data for {cve_id}")
                nvd_data = get_nvd_details(cve_id)
                nvd_cache[cve_id] = nvd_data

            if nvd_data:
                severity = nvd_data.get("severity", "UNKNOWN")
                cvss_score = nvd_data.get("cvss_score")

        clean_vuln = {
            "sbom_id":sbom_id,
            "cve_id": cve_id,
            "summary": vuln.get("summary"),
            "severity": severity,
            "cvss_score": cvss_score,
            "published": vuln.get("published"),
        }

        enriched_vulnerabilities.append(clean_vuln)

    print(f"Before deduplication: {len(enriched_vulnerabilities)} vulnerabilities")

    enriched_vulnerabilities = deduplicate_vulnerabilities(enriched_vulnerabilities)

    print(f"After deduplication: {len(enriched_vulnerabilities)} vulnerabilities")

    return {
        "sbom_id":sbom_id,
        "name": component["name"],
        "version": component["version"],
        "purl": component["purl"],
        "vulnerabilities": enriched_vulnerabilities,
    }