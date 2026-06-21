from fastapi import APIRouter
from database import db
from datetime import datetime

router = APIRouter(prefix="/scan", tags=["Scan"])


@router.post("/")
def start_scan(data: dict):

    project_name = data.get("project_name")

    scan_job = {
        "project_name": project_name,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat()
    }

    result = db.scan_jobs.insert_one(scan_job)

    return {
        "scan_id": str(result.inserted_id),
        "status": "queued"
    }