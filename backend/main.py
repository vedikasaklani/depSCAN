from fastapi import FastAPI
from routers.sbom import router as sbom_router

app = FastAPI(title="SBOM Backend")

app.include_router(sbom_router)

@app.get("/")
def home():
    return {"message": "SBOM Backend Running"}
