from pymongo import MongoClient

MONGO_URI = "mongodb+srv://anwitapadhi_db_user:Anwita2004@cluster0.jk2s71i.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["sbom_db"]