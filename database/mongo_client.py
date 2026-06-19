from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# Get Mongo URI
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Database
db = client["sbom_db"]

# Collections
sboms_collection = db["sboms"]
components_collection = db["components"]
vulns_collection = db["vulns"]

print("MongoDB Connected Successfully")