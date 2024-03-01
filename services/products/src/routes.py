from fastapi import APIRouter, HTTPException
import os
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from src.models import Product
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()

# TODO: migrate to a separate file
collection = None
if os.getenv("ENV", "live") == "live":
    mongo_client = MongoClient("mongodb://products-db-service:27017/")
    db = mongo_client["products_db"]
    collection = db["products"]
    collection.create_index("name", unique=True)


@router.get("/k8s", include_in_schema=False)
def k8s():
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/add")
async def add_product(product: Product):
    try:
        result = collection.insert_one(product.model_dump())
        return {"message": "Product added successfully", "id": str(result.inserted_id)}
    # TODO: create custom exceptions
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="Product with this name already exists"
        )
    except ConnectionError:
        raise HTTPException(status_code=503, detail="Database connection error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get")
async def get_products():
    try:
        products = []
        for product in collection.find():
            product["_id"] = str(product["_id"])
            products.append(product)
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get/{product_id}")
async def get_product_by_id(product_id: str):
    try:
        product = collection.find_one({"_id": ObjectId(product_id)})
        if product:
            product["_id"] = str(product["_id"])
            return product
        else:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{product_id}")
async def update_product(product_id: str, product: Product):
    try:
        product = product.model_dump(exclude_unset=True)
        result = collection.update_one({"_id": ObjectId(product_id)}, {"$set": product})
        if result.matched_count == 1 and result.modified_count == 1:
            return {"message": "Product updated successfully"}
        else:
            raise HTTPException(
                status_code=404, detail="Product not found or not modified"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/filter")
async def filter_products(product: Product):
    products = []
    for product in collection.find(product.model_dump()):
        product["_id"] = str(product["_id"])
        products.append(product)
    return products


@router.get("/get/{product_id}")
async def get_products_by_id(product_id: str):
    product = collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])
        return product
    else:
        raise HTTPException(status_code=404, detail="Product not found")


# only for debug
@router.get("/callback")
def callback():
    return {"auth": "ok"}
