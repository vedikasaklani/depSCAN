from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv
from pathlib import Path
import os

# Load .env from project root
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

# Read MongoDB URI
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError(
        "MONGO_URI not found. Please add it to your .env file."
    )

try:
    # Connect to MongoDB Atlas
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000
    )

    # Verify connection
    client.admin.command("ping")

    print(" MongoDB Connected Successfully")

except ConnectionFailure as e:
    raise ConnectionError(
        f" Failed to connect to MongoDB: {e}"
    )

# Database
db = client["sbom_db"]

# Collections
sboms_collection = db["sboms"]
components_collection = db["components"]
vulns_collection = db["vulns"]