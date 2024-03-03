from pymongo import MongoClient
import os

if os.getenv("ENV") == "test":
    collection = None
else:
    mongo_client = MongoClient("mongodb://products-db-service:27017/")
    db = mongo_client["products_db"]
    collection = db["products"]
    collection.create_index("name", unique=True)
