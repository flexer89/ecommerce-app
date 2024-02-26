from fastapi import APIRouter, HTTPException
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
    for item in items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
            
    cart_key = f"email:{email}"
    cart_data = {item.product_id: item.quantity for item in items}
    
    existing_cart = redis_client.hgetall(cart_key)
    if existing_cart:
        for product_id, quantity in cart_data.items():
            if product_id in existing_cart:
                cart_data[product_id] = int(existing_cart[product_id]) + quantity
                
    redis_client.hset(cart_key, mapping=cart_data)

    return {"status": "ok"}

@router.post("/remove")
def remove_from_cart(email: str, product_id: str):
    cart_key = f"email:{email}"
    existing_cart = redis_client.hgetall(cart_key)
    
    if not existing_cart:
        raise HTTPException(status_code=404, detail="Product not found in cart")
    
    if product_id in existing_cart:
        existing_cart[product_id] = int(existing_cart[product_id]) - 1
        if existing_cart[product_id] == 0:
            redis_client.hdel(cart_key, product_id)
            
    return {"status": "ok"}

@router.delete("/delete")
def delete_cart(email: str):
    cart_key = f"email:{email}"
    redis_client.delete(cart_key)
    return {"status": "ok"}