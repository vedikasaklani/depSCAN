from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv
import os

dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in backend/.env")

client = MongoClient(MONGO_URI)

db = client["sbom_db"]
