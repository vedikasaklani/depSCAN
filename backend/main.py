from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.sbom import router as sbom_router
from backend.routers.scan import router as scan_router

app = FastAPI(title="SBOM Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
         "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(sbom_router)
app.include_router(scan_router)

@app.get("/")
def home():
    return {"message": "SBOM Backend Running"}