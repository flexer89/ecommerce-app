from fastapi import APIRouter
import os
from typing import List, Dict, Any
from redis import Redis
from src.models import CartItem
from src.exceptions import InvalidQuantityError, CartNotFound

router = APIRouter()

redis_client = Redis(host="carts-db-service", port=6379, decode_responses=True)


@router.get("/k8s")
def k8s() -> Dict[str, str | None]:
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/get")
def get_cart(email: str) -> Dict[str, str]:
    cart_key = f"email:{email}"
    cart_data: Dict[Any, Any] = redis_client.hgetall(cart_key)    # type: ignore
    return cart_data


@router.post("/add")
def add_to_cart(email: str, items: List[CartItem]) -> Dict[str, str]:
    for item in items:
        if item.quantity <= 0:
            raise InvalidQuantityError()

    cart_key = f"email:{email}"
    cart_data = {item.product_id: item.quantity for item in items}

    existing_cart: Dict[Any, Any] = redis_client.hgetall(cart_key)    # type: ignore 
    if existing_cart:
        for product_id, quantity in cart_data.items():
            if product_id in existing_cart:
                cart_data[product_id] = int(existing_cart[product_id]) + quantity

    redis_client.hset(cart_key, mapping=cart_data)   
    return {"status": "ok"}


@router.post("/remove")
def remove_from_cart(email: str, product_id: str) -> Dict[str, str]:
    cart_key = f"email:{email}"
    existing_cart: Dict[Any, Any] = redis_client.hgetall(cart_key)    # type: ignore

    if not existing_cart:
        raise CartNotFound(details=f"Email: {email}")

    if product_id in existing_cart:
        existing_cart[product_id] = int(existing_cart[product_id]) - 1
        redis_client.hset(cart_key, mapping={product_id: existing_cart[product_id]})
        if existing_cart[product_id] == 0:
            redis_client.hdel(cart_key, product_id)   # type: ignore

    return {"status": "ok"}


@router.delete("/delete")
def delete_cart(email: str) -> Dict[str, str]:
    cart_key = f"email:{email}"
    redis_client.delete(cart_key)
    return {"status": "ok"}
