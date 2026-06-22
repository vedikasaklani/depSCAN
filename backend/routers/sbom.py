from datetime import datetime

from fastapi import APIRouter, HTTPException

from backend.database import db

router = APIRouter(prefix="/sbom", tags=["SBOM"])


@router.post("/upload")
def upload_sbom(data: dict):
    return store_sbom_document(data)


def store_sbom_document(data: dict):

    data["uploaded_at"] = datetime.utcnow().isoformat()

    project_name = (
        data.get("metadata", {})
        .get("component", {})
        .get("name")
    )

    if not project_name:
        raise HTTPException(status_code=400, detail="SBOM metadata.component.name is required")

    data["project"] = project_name


    project = db.projects.find_one(
        {"name": project_name}
    )

    if not project:
        db.projects.insert_one({
            "name": project_name,
            "created_at": datetime.utcnow().isoformat()
        })
    result = db.sboms.insert_one(data)
    scan_id = str(result.inserted_id)

    db.sboms.update_one(
        {"_id": result.inserted_id},
        {"$set": {"sbom_id": scan_id}}
)

    components = data.get("components", [])

    for comp in components:

            db.components.insert_one({
                "sbom_id": scan_id,
                "name": comp.get("name"),
                "version": comp.get("version"),
                "purl": comp.get("purl"),
                "supplier": (
                    comp.get("supplier", {})
                    .get("name")
                ),
                "license": (
                    comp["licenses"][0]
                    .get("license", {})
                    .get("id")
                    if comp.get("licenses")
                    else None
                )
            })

    #added today
    dependencies = data.get("dependencies", [])

    for dep in dependencies:

        parent = dep.get("ref")

        for child in dep.get("dependsOn", []):

            db.dependency_edges.insert_one({
                "sbom_id": scan_id,
                "parent": parent,
                "child": child
            })

    return {
        "status": "stored",
        "id": scan_id,
        "sbom_id": scan_id,
        "project": project_name,
        "components_stored": len(components),
        "dependencies_stored": len(dependencies),
        "uploaded_at": data["uploaded_at"]
    }

@router.get("/all")
def get_all_sboms():

    scans = []

    for sbom in db.sboms.find():

        scans.append({
            "sbom_id": str(sbom.get("sbom_id", sbom["_id"])),
            "project": sbom.get("project"),
            "uploaded_at": sbom.get("uploaded_at")
        })

    return scans
    


@router.get("/components/{sbom_id}")
def get_components(sbom_id: str):

    return list(
        db.components.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

@router.get("/dependencies/{sbom_id}")
def get_dependencies(sbom_id: str):

    return list(
        db.dependency_edges.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )


@router.get("/project/{project_name}/history")
def get_history(project_name: str):

    data = list(
        db.sboms.find(
            {"project": project_name},
            {"_id": 0}
        )
    )

    normalized = []

    for item in data:
        scan_id = item.get("sbom_id") or item.get("serialNumber")
        if not scan_id:
            continue

        normalized.append({
            "sbom_id": scan_id,

            "project": (
                item.get("project")
                or item.get("metadata", {})
                      .get("component", {})
                      .get("name")
                or project_name
            ),

            "uploaded_at": (
                item.get("uploaded_at")
                or item.get("metadata", {})
                      .get("timestamp")
            )
        })

    return normalized


@router.get("/package/{package_name}")
def get_package(package_name: str):

    component = db.components.find_one(
        {"name": package_name},
        {"_id": 0}
    )

    if not component:
        return {"message": "Package not found"}

    return component


@router.get("/summary/{sbom_id}")
def get_summary(sbom_id: str):

    sbom = db.sboms.find_one(
        {"sbom_id": sbom_id}
    )

    if not sbom:
        return {"message": "SBOM not found"}

    components = list(
        db.components.find(
            {"sbom_id": sbom_id}
        )
    )

    vulns = list(
        db.vulns.find(
            {"sbom_id": sbom_id}
        )
    )

    critical = sum(
        1 for v in vulns
        if v.get("severity", "").upper() == "CRITICAL"
    )

    high = sum(
        1 for v in vulns
        if v.get("severity", "").upper() == "HIGH"
    )

    medium = sum(
        1 for v in vulns
        if v.get("severity", "").upper() == "MEDIUM"
    )

    low = sum(
        1 for v in vulns
        if v.get("severity", "").upper() == "LOW"
    )

    dependencies = list(
        db.dependency_edges.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

    def has_supplier(component):
        supplier = component.get("supplier")
        return bool(supplier and str(supplier).strip()) or supplier == "NOASSERTION"

    def has_pinned_version(version):
        return isinstance(version, str) and version.strip() and not any(symbol in version for symbol in ["^", "~", "*", ">=", "<=", "x", "X"])

    pass_checks = 0
    pass_checks += 1 if sbom.get("uploaded_at") else 0
    pass_checks += 1 if sbom.get("metadata", {}).get("authors") else 0
    pass_checks += 1 if components and all(has_supplier(c) for c in components) else 0
    pass_checks += 1 if components and all(c.get("name") for c in components) else 0
    pass_checks += 1 if components and all(has_pinned_version(c.get("version")) for c in components) else 0
    pass_checks += 1 if components and all(c.get("purl") for c in components) else 0
    pass_checks += 1 if dependencies else 0

    compliance_percentage = int((pass_checks / 7) * 100)

    return {
        "projectName": sbom.get("project"),
        "scanDate": sbom.get("uploaded_at"),
        "components": len(components),
        "vulnerabilities": len(vulns),
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "timestamp": sbom.get("uploaded_at"),
        "totalDependencies": len(dependencies),
        "compliancePercentage": compliance_percentage
    }


@router.get("/compliance/{sbom_id}")
def get_compliance(sbom_id: str):

    sbom = db.sboms.find_one(
        {"sbom_id": sbom_id},
        {"_id": 0}
    )

    if not sbom:
        return {"message": "SBOM not found"}

    components = list(
        db.components.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

    dependencies = list(
        db.dependency_edges.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

    vulns = list(
        db.vulns.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

    def has_supplier(component):
        supplier = component.get("supplier")
        if supplier == "NOASSERTION":
            return True
        if isinstance(supplier, dict):
            return bool(supplier.get("name", "").strip()) or supplier.get("name") == "NOASSERTION"
        return bool(str(supplier or "").strip())

    def has_exact_version(version):
        return isinstance(version, str) and bool(version.strip()) and not any(
            symbol in version for symbol in ["^", "~", "*", ">=", "<=", ">", "<", "x", "X", "||", ","]
        )

    def has_valid_purl(component):
        purl = component.get("purl")
        return isinstance(purl, str) and purl.startswith("pkg:") and "/" in purl[4:]

    def has_timezone_timestamp(timestamp):
        if not isinstance(timestamp, str) or not timestamp.strip():
            return False
        return timestamp.endswith("Z") or (
            len(timestamp) >= 6
            and timestamp[-6] in ["+", "-"]
            and timestamp[-3] == ":"
        )

    metadata = sbom.get("metadata", {})
    timestamp = metadata.get("timestamp") or sbom.get("uploaded_at")
    authors = metadata.get("authors") or []
    component_meta = metadata.get("component", {})
    root_ref = (
        component_meta.get("bom-ref")
        or component_meta.get("ref")
        or component_meta.get("purl")
        or component_meta.get("name")
    )
    dependency_parents = {edge.get("parent") for edge in dependencies if edge.get("parent")}
    dependency_children = {edge.get("child") for edge in dependencies if edge.get("child")}
    has_root_dependency = bool(
        dependencies
        and (
            (root_ref and root_ref in dependency_parents)
            or dependency_parents - dependency_children
            or dependency_parents
        )
    )
    machine_readable = sbom.get("bomFormat") == "CycloneDX" or sbom.get("spdxVersion") or sbom.get("SPDXID")

    checks = [
        {
            "id": "timestamp",
            "label": "Timestamp present",
            "field": "metadata.timestamp",
            "ntiaElement": "7",
            "passCondition": "ISO 8601 with timezone",
            "passed": has_timezone_timestamp(timestamp),
        },
        {
            "id": "authors",
            "label": "Author declared",
            "field": "metadata.authors",
            "ntiaElement": "6",
            "passCondition": "At least one entry",
            "passed": isinstance(authors, list) and len(authors) > 0,
        },
        {
            "id": "suppliers",
            "label": "All components have supplier",
            "field": "components[*].supplier",
            "ntiaElement": "1",
            "passCondition": "Present or NOASSERTION",
            "passed": bool(components) and all(has_supplier(component) for component in components),
        },
        {
            "id": "names",
            "label": "All components named",
            "field": "components[*].name",
            "ntiaElement": "2",
            "passCondition": "Non-empty string",
            "passed": bool(components) and all(bool((component.get("name") or "").strip()) for component in components),
        },
        {
            "id": "versions",
            "label": "All versions pinned",
            "field": "components[*].version",
            "ntiaElement": "3",
            "passCondition": "Exact version, no ranges",
            "passed": bool(components) and all(has_exact_version(component.get("version")) for component in components),
        },
        {
            "id": "purls",
            "label": "All PURLs present",
            "field": "components[*].purl",
            "ntiaElement": "4",
            "passCondition": "Valid PURL format",
            "passed": bool(components) and all(has_valid_purl(component) for component in components),
        },
        {
            "id": "dependencies",
            "label": "Dependency graph exists",
            "field": "dependencies",
            "ntiaElement": "5",
            "passCondition": "Non-empty, root component present",
            "passed": has_root_dependency,
        },
        {
            "id": "machine_readable",
            "label": "Machine-readable format",
            "field": "file format",
            "ntiaElement": "Operational",
            "passCondition": "JSON or XML, not PDF",
            "passed": bool(machine_readable),
        },
    ]

    passed_checks = sum(1 for check in checks if check["passed"])
    compliance_percentage = int(round((passed_checks / len(checks)) * 100))

    enriched_components = []
    for component in components:
        component_checks = {
            "supplier": has_supplier(component),
            "name": bool((component.get("name") or "").strip()),
            "version": has_exact_version(component.get("version")),
            "purl": has_valid_purl(component),
        }
        enriched_components.append({
            **component,
            "status": "pass" if all(component_checks.values()) else "review",
            "checks": component_checks,
        })

    return {
        "projectMeta": {
            "projectName": sbom.get("project"),
            "authors": authors,
            "author": ", ".join(
                author.get("name", str(author)) if isinstance(author, dict) else str(author)
                for author in authors
            ) or "Not declared",
            "timestamp": timestamp,
            "complianceScore": compliance_percentage,
            "compliancePercentage": compliance_percentage,
            "totalComponents": len(components),
            "totalDependencies": len(dependencies),
            "totalVulnerabilities": len(vulns),
            "passedChecks": passed_checks,
            "totalChecks": len(checks),
        },
        "sbom": sbom,
        "checks": checks,
        "components": enriched_components,
        "dependencies": dependencies
    }


@router.get("/vulns/{sbom_id}")
def get_vulns(sbom_id: str):

    return list(
        db.vulns.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

@router.get("/projects")
def get_projects():

    return list(
        db.projects.find(
            {},
            {"_id": 0}
        )
    )

@router.get("/diff/{old_scan}/{new_scan}")
def diff_scans(old_scan: str, new_scan: str):

    raise HTTPException(status_code=501, detail="Diff endpoint is not implemented")


@router.get("/{sbom_id}")
def get_sbom(sbom_id: str):

    sbom = db.sboms.find_one(
        {"sbom_id": sbom_id},
        {"_id": 0}
    )

    if not sbom:
        return {"message": "SBOM not found"}

    return sbom
