from motor.motor_asyncio import AsyncIOMotorClient as MongoClient
from mongomock_motor import AsyncMongoMockClient as MockMongoClient
import os

if os.getenv("ENV") == "test":
    mongo_client = MockMongoClient()
else:
    mongo_client = MongoClient("mongodb://products-db-service:27017/")

db = mongo_client["products_db"]
collection = db["products"]
collection.create_index("name", unique=True)
