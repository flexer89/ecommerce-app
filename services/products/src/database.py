from pymongo import MongoClient
from mongomock import MongoClient as MockMongoClient
import os

if os.getenv("ENV") == "test":
    mongo_client = MockMongoClient() # type: ignore
else:
    mongo_client = MongoClient("mongodb://products-db-service:27017/") # type: ignore
    
db = mongo_client["products_db"]
collection = db["products"]
collection.create_index("name", unique=True)
