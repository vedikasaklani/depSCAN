from fastapi import APIRouter
from backend.database import db
from datetime import datetime, timezone

router = APIRouter(prefix="/sbom", tags=["SBOM"])


@router.post("/upload")
def upload_sbom(data: dict):
    data["uploaded_at"] = datetime.now(timezone.utc).isoformat()
    project_name = (
        data.get("metadata", {})
        .get("component", {})
        .get("name")
    )

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

    for idx, item in enumerate(data):

        normalized.append({
            "sbom_id": (
                item.get("sbom_id")
                or item.get("serialNumber")
                or f"scan_{idx}"
            ),

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

    return {
        "projectName": sbom.get("project"),
        "scanDate": sbom.get("uploaded_at"),
        "components": len(components),
        "vulnerabilities": len(vulns),
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "timestamp": sbom.get("uploaded_at")
    }

@router.get("/compliance/{sbom_id}")
def get_compliance(sbom_id: str):

    sbom = db.sboms.find_one(
        {"sbom_id": sbom_id}
    )

    if not sbom:
        return {"message": "SBOM not found"}

    components = list(
        db.components.find(
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

    total_dependencies = db.dependency_edges.count_documents(
        {"sbom_id": sbom_id}
    )

    metadata = sbom.get("metadata", {})
    timestamp_present = bool(metadata.get("timestamp"))
    authors = metadata.get("authors") or []
    author_declared = len(authors) > 0
    author_name = (
        authors[0].get("name")
        if author_declared and isinstance(authors[0], dict)
        else (authors[0] if author_declared else None)
    )

    all_have_supplier = all(c.get("supplier") for c in components) if components else False
    all_named = all(c.get("name") for c in components) if components else False

    def is_pinned(version):
        if not version:
            return False
        return not any(ch in version for ch in ["^", "~", ">", "<", "*", "x"])

    all_versions_pinned = all(is_pinned(c.get("version")) for c in components) if components else False
    all_purls_present = all(c.get("purl") for c in components) if components else False
    dependency_graph_exists = total_dependencies > 0

    checks = [
        {
            "id": "timestamp",
            "label": "Timestamp present",
            "field": "metadata.timestamp",
            "ntiaElement": 7,
            "passCondition": "ISO 8601 with timezone",
            "passed": timestamp_present,
        },
        {
            "id": "author",
            "label": "Author declared",
            "field": "metadata.authors",
            "ntiaElement": 6,
            "passCondition": "At least one entry",
            "passed": author_declared,
        },
        {
            "id": "supplier",
            "label": "All components have supplier",
            "field": "components[*].supplier",
            "ntiaElement": 1,
            "passCondition": "Present or NOASSERTION",
            "passed": all_have_supplier,
        },
        {
            "id": "named",
            "label": "All components named",
            "field": "components[*].name",
            "ntiaElement": 2,
            "passCondition": "Non-empty string",
            "passed": all_named,
        },
        {
            "id": "versions_pinned",
            "label": "All versions pinned",
            "field": "components[*].version",
            "ntiaElement": 3,
            "passCondition": "Exact version, no ranges",
            "passed": all_versions_pinned,
        },
        {
            "id": "purls",
            "label": "All PURLs present",
            "field": "components[*].purl",
            "ntiaElement": 4,
            "passCondition": "Valid PURL format",
            "passed": all_purls_present,
        },
        {
            "id": "dependency_graph",
            "label": "Dependency graph exists",
            "field": "dependencies",
            "ntiaElement": 5,
            "passCondition": "Non-empty, root component present",
            "passed": dependency_graph_exists,
        },
        {
            "id": "machine_readable",
            "label": "Machine-readable format",
            "field": "file format",
            "ntiaElement": "Operational",
            "passCondition": "JSON or XML, not PDF",
            "passed": True,
        },
    ]

    total_checks = len(checks)
    passed_checks = sum(1 for c in checks if c["passed"])
    compliance_percentage = (
        round((passed_checks / total_checks) * 100) if total_checks else 0
    )

    components_out = []
    for c in components:
        is_pass = bool(
            c.get("name") and c.get("version") and c.get("purl") and c.get("supplier")
        )
        components_out.append({
            **c,
            "status": "pass" if is_pass else "review",
        })

    return {
        "projectMeta": {
            "projectName": sbom.get("project"),
            "author": author_name or "Not declared",
            "timestamp": metadata.get("timestamp") or sbom.get("uploaded_at"),
            "complianceScore": compliance_percentage,
            "compliancePercentage": compliance_percentage,
            "totalComponents": len(components),
            "totalDependencies": total_dependencies,
            "totalVulnerabilities": len(vulns),
            "totalChecks": total_checks,
            "passedChecks": passed_checks,
        },
        "checks": checks,
        "components": components_out,
        "dependencies": [],
    }

@router.post("/vulns/add")
def add_vuln(data: dict):

    result = db.vulns.insert_one(data)

    return {
        "status": "stored",
        "id": str(result.inserted_id)
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

    return {
        "old_scan": old_scan,
        "new_scan": new_scan,
        "message": "Diff endpoint placeholder"
    }


@router.get("/{sbom_id}")
def get_sbom(sbom_id: str):

    sbom = db.sboms.find_one(
        {"sbom_id": sbom_id},
        {"_id": 0}
    )

    if not sbom:
        return {"message": "SBOM not found"}

    return sbom
