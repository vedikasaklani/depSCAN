from database.mongo_client import (
    components_collection,
    vulns_collection
)

from services.enricher import enrich_component

# Get all components from DB
components = list(
    components_collection.find()
)

print(f"Found {len(components)} components")

for component in components:
    name = component.get("name", "<unknown>")
    print(f"\nScanning {name}...")

    purl = component.get("purl")
    if not purl:
        print(f"Skipping {name}: missing purl")
        continue

    enriched = enrich_component(component)

    vulnerabilities = enriched.get(
        "vulnerabilities",
        []
    )

    for vuln in vulnerabilities:

        vuln_document = {

            "sbom_id": component.get(
                "sbom_id"
            ),

            "component_name": component.get(
                "name"
            ),

            "component_version": component.get(
                "version"
            ),

            "purl": component.get(
                "purl"
            ),

            "cve_id": vuln.get(
                "cve_id"
            ),

            "severity": vuln.get(
                "severity"
            ),

            "cvss_score": vuln.get(
                "cvss_score"
            ),

            "summary": vuln.get(
                "summary"
            )
        }

        # Insert into MongoDB
        vulns_collection.insert_one(
            vuln_document
        )

        print(
            f"Stored "
            f"{vuln.get('cve_id')}"
        )

print("\nEnrichment completed.")
