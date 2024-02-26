from fastapi import APIRouter
import os
from typing import List
from redis import StrictRedis
from src.models import CartItem

router = APIRouter()

redis_client = StrictRedis(host="carts-db-service", port=6379, decode_responses=True)


@router.get("/k8s")
def k8s():
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/get")
def get_cart(email: str):
    cart_key = f"email:{email}"
    cart_data = redis_client.hgetall(cart_key)

    return cart_data


@router.post("/add")
def add_to_cart(email: str, items: List[CartItem]):
    cart_key = f"email:{email}"
    cart_data = {item.product_id: item.quantity for item in items}
    redis_client.hset(cart_key, mapping=cart_data)

    return {"status": "ok"}
