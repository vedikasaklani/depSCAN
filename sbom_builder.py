# ============================================================
# sbom_builder.py
# Member 2 — SBOM Builder
#
# INPUT CONTRACT with Member 1:
# Member 1 passes a list of dicts. Each dict must have:
#   - name       (str)  e.g. "django"
#   - version    (str)  e.g. "4.2.1"
#   - ecosystem  (str)  e.g. "pypi", "npm", "maven"
#   - supplier   (str)  e.g. "Django Software Foundation" or "NOASSERTION"
#   - license    (str)  e.g. "MIT" or "NOASSERTION"
#   - deps       (list) e.g. [1, 2]  — index numbers of dependencies
# ============================================================

from cyclonedx.model.bom import Bom
from cyclonedx.model.component import Component, ComponentType
from cyclonedx.model.contact import OrganizationalContact, OrganizationalEntity
from cyclonedx.model.dependency import Dependency
from cyclonedx.model.bom_ref import BomRef
from cyclonedx.output.json import JsonV1Dot6
from packageurl import PackageURL
from datetime import datetime, timezone
import json
import requests
import os


# ─────────────────────────────────────────────────────────────
# FUNCTION 1 — Build CycloneDX 1.6 SBOM
# ─────────────────────────────────────────────────────────────

def build_cyclonedx_sbom(project_name: str, components_data: list) -> str:
    """
    Takes project name + component list from Member 1.
    Returns a CycloneDX 1.6 JSON string.
    """

    # Create a blank SBOM document
    bom = Bom()

    # NTIA Element 6 — Who generated this SBOM?
    bom.metadata.authors = [
        OrganizationalContact(name="sbomgen-tool")
    ]

    # NTIA Element 7 — Timestamp (must be UTC)
    bom.metadata.timestamp = datetime.now(timezone.utc)

    # The root component — your project itself
    bom.metadata.component = Component(
        type=ComponentType.APPLICATION,
        name=project_name,
        bom_ref=BomRef(value=f"pkg:generic/{project_name}"),
    )

    # NTIA Elements 1–4 — Loop through every component
    for comp in components_data:

        # Build the PURL — universal barcode for this package
        purl = PackageURL(
            type=comp["ecosystem"],
            name=comp["name"],
            version=comp["version"],
        )

        # Supplier — use NOASSERTION if unknown, never leave blank
        supplier = OrganizationalEntity(
            name=comp.get("supplier", "NOASSERTION")
        )

        # Build the component object
        component = Component(
            type=ComponentType.LIBRARY,
            name=comp["name"],               # NTIA Element 2
            version=comp["version"],         # NTIA Element 3
            purl=purl,                       # NTIA Element 4
            supplier=supplier,               # NTIA Element 1
            bom_ref=BomRef(value=str(purl)),
            licenses=[comp.get("license", "NOASSERTION")],
        )

        bom.components.add(component)
        
    # NTIA Element 5 — Dependency relationships
    for i, comp in enumerate(components_data):
        purl_str = str(PackageURL(
            type=comp["ecosystem"],
            name=comp["name"],
            version=comp["version"],
        ))

        dep_deps = []
        for j in comp.get("deps", []):
            dep_comp = components_data[j]
            dep_purl_str = str(PackageURL(
                type=dep_comp["ecosystem"],
                name=dep_comp["name"],
                version=dep_comp["version"],
            ))
            dep_deps.append(Dependency(ref=BomRef(value=dep_purl_str)))

        bom.dependencies.add(Dependency(
            ref=BomRef(value=purl_str),
            dependencies=dep_deps,
        ))

    # Root project dependency entry
    all_top_level = [
        Dependency(ref=BomRef(value=str(PackageURL(
            type=c["ecosystem"], name=c["name"], version=c["version"]
        ))))
        for c in components_data
    ]
    bom.dependencies.add(Dependency(
        ref=BomRef(value=f"pkg:generic/{project_name}"),
        dependencies=all_top_level,
    ))



    # Convert to JSON string and return
    outputter = JsonV1Dot6(bom)
    return outputter.output_as_string()


# ─────────────────────────────────────────────────────────────
# FUNCTION 2 — Build SPDX 2.3 SBOM
# ─────────────────────────────────────────────────────────────

def build_spdx_sbom(project_name: str, components_data: list) -> str:
    """
    Takes project name + component list from Member 1.
    Returns an SPDX 2.3 JSON string.
    """
    import uuid

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    spdx_doc = {
        "spdxVersion": "SPDX-2.3",
        "dataLicense": "CC0-1.0",
        "SPDXID": "SPDXRef-DOCUMENT",
        "name": project_name,
        "documentNamespace": f"https://example.org/sbomgen/{project_name}-{uuid.uuid4()}",
        "creationInfo": {
            "created": now,
            "creators": ["Tool: sbomgen-tool"]
        },
        "packages": [],
        "relationships": []
    }

    # Root package
    spdx_doc["packages"].append({
        "SPDXID": "SPDXRef-Package-root",
        "name": project_name,
        "versionInfo": "NOASSERTION",
        "downloadLocation": "NOASSERTION",
        "filesAnalyzed": False,
        "supplier": "NOASSERTION",
    })

    for i, comp in enumerate(components_data):
        spdx_id = f"SPDXRef-Package-{comp['name'].replace('-', '').replace('.', '')}-{i}"
        purl = f"pkg:{comp['ecosystem']}/{comp['name']}@{comp['version']}"

        spdx_doc["packages"].append({
            "SPDXID": spdx_id,
            "name": comp["name"],
            "versionInfo": comp["version"],
            "supplier": f"Organization: {comp.get('supplier', 'NOASSERTION')}",
            "downloadLocation": "NOASSERTION",
            "filesAnalyzed": False,
            "externalRefs": [{
                "referenceCategory": "PACKAGE-MANAGER",
                "referenceType": "purl",
                "referenceLocator": purl
            }],
            "licenseConcluded": comp.get("license", "NOASSERTION"),
            "licenseDeclared": comp.get("license", "NOASSERTION"),
            "copyrightText": "NOASSERTION"
        })

        spdx_doc["relationships"].append({
            "spdxElementId": "SPDXRef-Package-root",
            "relationshipType": "DEPENDS_ON",
            "relatedSpdxElement": spdx_id
        })

    return json.dumps(spdx_doc, indent=2)


# ─────────────────────────────────────────────────────────────
# FUNCTION 3 — Validate NTIA Compliance
# ─────────────────────────────────────────────────────────────

def validate_ntia_compliance(sbom_json_string: str):
    """
    Checks all 7 NTIA minimum elements.
    Returns (True, []) if compliant, or (False, [list of problems]).
    """
    sbom = json.loads(sbom_json_string)
    violations = []

    if not sbom.get("metadata", {}).get("timestamp"):
        violations.append("MISSING: timestamp (NTIA Element 7)")

    if not sbom.get("metadata", {}).get("authors"):
        violations.append("MISSING: authors (NTIA Element 6)")

    for comp in sbom.get("components", []):
        name = comp.get("name", "<unnamed>")
        if not comp.get("supplier", {}).get("name"):
            violations.append(f"MISSING: supplier for '{name}' (NTIA Element 1)")
        if not comp.get("name"):
            violations.append(f"MISSING: name for a component (NTIA Element 2)")
        if not comp.get("version"):
            violations.append(f"MISSING: version for '{name}' (NTIA Element 3)")
        if not comp.get("purl"):
            violations.append(f"MISSING: purl for '{name}' (NTIA Element 4)")

    if not sbom.get("dependencies"):
        violations.append("MISSING: dependencies block (NTIA Element 5)")

    return (len(violations) == 0, violations)


# ─────────────────────────────────────────────────────────────
# FUNCTION 4 — Output the SBOM (file / terminal / API)
# ─────────────────────────────────────────────────────────────

def output_sbom(sbom_json, mode="file", output_path="sbom.cdx.json",
                api_url=None, api_key=None, project_name=None):
    """
    mode = "file"   → saves to a .json file
    mode = "stdout" → prints to terminal
    mode = "api"    → POSTs to backend API
    """

    if mode == "file":
        with open(output_path, "w") as f:
            f.write(sbom_json)
        print(f"SBOM saved to {output_path}")

    elif mode == "stdout":
        print(sbom_json)

    elif mode == "api":
        if not api_url or not api_key:
            raise ValueError("api_url and api_key required for API mode")

        response = requests.post(
            f"{api_url}/sbom/upload",
            json={"sbom": sbom_json, "project": project_name},
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 202:
            print("SBOM uploaded. Enrichment in progress...")
        elif response.status_code == 422:
            print("SBOM rejected — compliance issues:")
            for v in response.json().get("violations", []):
                print(f"  {v}")
        else:
            print(f"Upload failed: {response.status_code}")


# ─────────────────────────────────────────────────────────────
# FUNCTION 5 — Main Entry Point (Member 1 calls this)
# ─────────────────────────────────────────────────────────────

def build_and_output_sbom(
    project_name: str,
    components_data: list,
    format: str = "cyclonedx",
    mode: str = "file",
    output_path: str = "sbom.cdx.json",
    api_url: str = None,
    api_key: str = None,
):
    """
    THE main function. Member 1 calls this when they finish parsing.

    Example usage:
        from sbom_builder import build_and_output_sbom
        build_and_output_sbom("my-project", components, format="cyclonedx", mode="file")
    """

    print(f"\nBuilding {format.upper()} SBOM for '{project_name}'...")

    # Build
    if format == "cyclonedx":
        sbom_json = build_cyclonedx_sbom(project_name, components_data)
    elif format == "spdx":
        sbom_json = build_spdx_sbom(project_name, components_data)
    else:
        raise ValueError(f"Unknown format: {format}")

    # Validate
    if format == "cyclonedx":
        ok, violations = validate_ntia_compliance(sbom_json)
        if ok:
            print("NTIA compliance: ALL 7 ELEMENTS PRESENT")
        else:
            print("NTIA compliance issues:")
            for v in violations:
                print(f"  {v}")

    # Output
    output_sbom(sbom_json, mode, output_path, api_url, api_key, project_name)

    return sbom_json
# ─────────────────────────────────────────────────────────────
# FUNCTION 6 — Convert to Frontend Format (for Pakhi/Vedika)
# ─────────────────────────────────────────────────────────────

def build_frontend_format(project_name: str, components_data: list, vulnerabilities: list = []) -> str:
    """
    Converts component data into the format Pakhi/Vedika's frontend expects.
    """

    # Count vulnerabilities per component
    def get_severity(comp_name):
        for v in vulnerabilities:
            if v.get("component") == comp_name:
                return v.get("severity", "none")
        return "none"

    def get_status(comp_name):
        for v in vulnerabilities:
            if v.get("component") == comp_name:
                return "fail"
        return "pass"

    # Build components list in frontend format
    frontend_components = []
    for comp in components_data:
        frontend_components.append({
            "name": comp["name"],
            "version": comp["version"],
            "supplier": { "name": comp.get("supplier", "NOASSERTION") },
            "purl": f"pkg:{comp['ecosystem']}/{comp['name']}@{comp['version']}",
            "licenses": [{ "license": { "id": comp.get("license", "NOASSERTION") } }],
            "author": comp.get("supplier", "NOASSERTION"),
            "status": get_status(comp["name"]),
            "severity": get_severity(comp["name"])
        })

    # Count deps
    total_deps = sum(len(comp.get("deps", [])) for comp in components_data)

    # Calculate compliance score
    # Based on how many components pass NTIA checks
    passing = sum(1 for c in components_data if c.get("supplier") and c.get("license"))
    compliance_pct = int((passing / len(components_data)) * 100) if components_data else 0

    frontend_doc = {
        "projectMeta": {
            "projectName": project_name,
            "author": "sbomgen-tool",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "complianceScore": compliance_pct,
            "compliancePercentage": compliance_pct,
            "totalComponents": len(components_data),
            "totalDependencies": total_deps,
            "totalVulnerabilities": len(vulnerabilities)
        },
        "components": frontend_components
    }

    return json.dumps(frontend_doc, indent=2)
