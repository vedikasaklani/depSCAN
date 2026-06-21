from fastapi import FastAPI

from routers.sbom import router as sbom_router
from routers.scan import router as scan_router

app = FastAPI(title="SBOM Backend")

app.include_router(sbom_router)
app.include_router(scan_router)

@app.get("/")
def home():
    return {"message": "SBOM Backend Running"}