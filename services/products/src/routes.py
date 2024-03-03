from fastapi import APIRouter
import os
from pymongo.errors import DuplicateKeyError
from src.models import Product
from bson import ObjectId
from src.exceptions import (
    ProductNotFound,
    ProductsNotFound,
    ProductNotModified,
    ProductExists,
    DatabaseConnectionError,
    SomethingWentWrong,
)
from src.database import collection

router = APIRouter()


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
def add_product(product: Product):
    try:
        result = collection.insert_one(product.model_dump())
        return {"message": "Product added successfully", "id": str(result.inserted_id)}
    except DuplicateKeyError:
        raise ProductExists(details=f"Product name: {product.name}")
    except ConnectionError:
        raise DatabaseConnectionError()
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.get("/get")
def get_products():
    try:
        products = []
        for product in collection.find():
            product["_id"] = str(product["_id"])
            products.append(product)
        if not products:
            raise ProductsNotFound()
        return products
    except ProductsNotFound:
        raise
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.get("/get/{product_id}")
def get_product_by_id(product_id: str):
    try:
        product = collection.find_one({"_id": ObjectId(product_id)})
        if product:
            product["_id"] = str(product["_id"])
            return product
        else:
            raise ProductNotFound(details=f"Product id: {product_id}")
    except ProductNotFound:
        raise
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.put("/update/{product_id}")
def update_product(product_id: str, product: Product):
    try:
        product = product.model_dump(exclude_unset=True)
        result = collection.update_one({"_id": ObjectId(product_id)}, {"$set": product})
        if result.matched_count == 1 and result.modified_count == 1:
            return {"message": "Product updated successfully"}
        else:
            raise ProductNotModified(details=f"Product id: {product_id}")
    except ProductNotModified:
        raise
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.post("/filter")
def filter_products(product: Product):
    products = []
    for product in collection.find(product.model_dump()):
        product["_id"] = str(product["_id"])
        products.append(product)
    return products


@router.get("/get/{product_id}")
def get_products_by_id(product_id: str):
    product = collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])
        return product
    else:
        raise ProductNotFound(details=f"Product id: {product_id}")


# only for debug
@router.get("/callback")
def callback():
    return {"auth": "ok"}
