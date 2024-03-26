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
from typing import Dict, List, Any

router = APIRouter()


@router.get("/k8s", include_in_schema=False)
async def k8s() -> Dict[str, str | None]:
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health", description="Check the health status test")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.post("/add")
async def add_product(product: Product) -> Dict[str, str]:
    try:
        result = await collection.insert_one(product.model_dump())
        return {"message": "Product added successfully", "id": str(result.inserted_id)}
    except DuplicateKeyError:
        raise ProductExists(details=f"Product name: {product.name}")
    except ConnectionError:
        raise DatabaseConnectionError()
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.get("/get")
async def get_products() -> List[Product]:
    try:
        products = []
        async for product in collection.find():
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
async def get_product_by_id(product_id: str) -> Any:
    try:
        product = await collection.find_one({"_id": ObjectId(product_id)})
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
async def update_product(product_id: str, product: ProductOptional) -> Dict[str, str]:
    try:
        updated_product = product.model_dump(exclude_unset=True)
        result = await collection.update_one(
            {"_id": ObjectId(product_id)}, {"$set": updated_product}
        )
        if result.matched_count == 1 and result.modified_count == 1:
            return {"message": "Product updated successfully"}
        else:
            raise ProductNotModified(details=f"Product id: {product_id}")
    except ProductNotModified:
        raise
    except Exception as e:
        raise SomethingWentWrong(str(e))


@router.post("/filter")
async def filter_products_by_criteria(
    criteria: ProductOptional,
) -> List[ProductOptional]:
    filtered_products = []
    async for product in collection.find(criteria.model_dump(exclude_unset=True)):
        product["_id"] = str(product["_id"])
        filtered_products.append(product)
    return filtered_products


@router.get("/get/{product_id}")
async def get_products_by_id(product_id: str) -> Any:
    product = await collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])
        return product
    else:
        raise ProductNotFound(details=f"Product id: {product_id}")


# only for debug
@router.get("/callback")
async def callback() -> Dict[str, str]:
    return {"auth": "ok"}


@router.delete("/delete/{product_id}")
async def delete_product(product_id: str) -> Dict[str, str]:
    result = await collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 1:
        return {"message": "Product deleted successfully"}
    else:
        raise ProductNotFound(details=f"Product id: {product_id}")
