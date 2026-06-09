from fastapi import APIRouter
from backend.database import db
from datetime import datetime

router = APIRouter(prefix="/sbom", tags=["SBOM"])

@router.post("/upload")
def upload_sbom(data: dict):

    data["uploaded_at"] = datetime.utcnow().isoformat()

    project_name = (
        data.get("metadata", {})
        .get("component", {})
        .get("name")
    )

    data["project"] = project_name

    result = db.sboms.insert_one(data)

    scan_id = str(result.inserted_id)

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
                comp.get("licenses", [{}])[0]
                .get("license", {})
                .get("id")
            )
        })

    return {
        "status": "stored",
        "id": scan_id,
        "project": project_name,
        "components_stored": len(components),
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


@router.get("/project/{project_name}/history")
def get_history(project_name: str):

    return list(
        db.sboms.find(
            {"project": project_name},
            {"_id": 0}
        )
    )


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
        db.vulnerabilities.find(
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
        db.vulnerabilities.find(
            {"sbom_id": sbom_id},
            {"_id": 0}
        )
    )

    return {
        "projectMeta": {
            "projectName": sbom.get("project"),
            "author": "depSCAN Team",
            "timestamp": sbom.get("uploaded_at"),
            "complianceScore": 88,
            "compliancePercentage": 88,
            "totalComponents": len(components),
            "totalDependencies": 0,
            "totalVulnerabilities": len(vulns)
        },
        "components": components,
        "dependencies": []
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


@router.post("/vulns/add")
def add_vuln(data: dict):

    result = db.vulnerabilities.insert_one(data)

    return {
        "status": "stored",
        "id": str(result.inserted_id)
    }


@router.get("/vulns/{sbom_id}")
def get_vulns(sbom_id: str):

    return list(
        db.vulnerabilities.find(
            {"sbom_id": sbom_id},
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