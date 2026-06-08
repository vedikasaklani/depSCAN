from fastapi import FastAPI
from backend.routers.sbom import router as sbom_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="SBOM Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(sbom_router)

@app.get("/")
def home():
    return {"message": "SBOM Backend Running"}
