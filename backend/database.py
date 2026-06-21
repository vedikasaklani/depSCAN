from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["sbom_db"]
print("Databases:", client.list_database_names())
print(db.list_collection_names())
