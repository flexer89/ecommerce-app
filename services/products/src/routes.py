from fastapi import APIRouter
import os
from pymongo.errors import DuplicateKeyError
from src.models import Product, ProductOptional
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
from typing import Dict, List, Union, Any

router = APIRouter()


@router.get("/k8s", include_in_schema=False)
def k8s() -> Dict[str, str | None]:
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health", description="Check the health status test")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.post("/add")
def add_product(product: Product) -> Dict[str, str]:
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
def get_products() -> List[Product]:
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
def get_product_by_id(product_id: str) -> Any:
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


@router.patch("/update/{product_id}")
def update_product(product_id: str, product: ProductOptional) -> Dict[str, str]:
    try:
        updated_product = product.model_dump(exclude_unset=True)
        result = collection.update_one({"_id": ObjectId(product_id)}, {"$set": updated_product})
        if result.matched_count == 1 and result.modified_count == 1:
            return {"message": "Product updated successfully"}
        else:
            raise ProductNotModified(details=f"Product id: {product_id}")
    except ProductNotModified:
        raise
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.post("/filter")
def filter_products_by_criteria(criteria: ProductOptional) -> List[ProductOptional]:
    filtered_products = []
    for product in collection.find(criteria.model_dump(exclude_unset=True)):
        product["_id"] = str(product["_id"])
        filtered_products.append(product)
    return filtered_products


@router.get("/get/{product_id}")
def get_products_by_id(product_id: str) -> Any:
    product = collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])
        return product
    else:
        raise ProductNotFound(details=f"Product id: {product_id}")


# only for debug
@router.get("/callback")
def callback() -> Dict[str, str]:
    return {"auth": "ok"}
