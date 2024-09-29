from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from redis.asyncio import Redis
from src.models import CartItems, RemoveItemRequest

router = APIRouter()

redis_client = Redis(host="carts-db-service", port=6379, decode_responses=True)

def get_cart_key(user_id: str) -> str:
    return f"cart:{user_id}"

@router.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}

@router.get("/get/{user_id}")
async def get_cart(user_id: str):
    cart_key = get_cart_key(user_id)
    cart_data = await redis_client.hgetall(cart_key)
    
    if not cart_data:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Convert each JSON string back into a Python dictionary
    cart_items = [json.loads(item_data) for item_data in cart_data.values()]
    
    return {
        "items": cart_items,
        "total": sum(item["price"] * item["quantity"] for item in cart_items),
        "quantity": sum(item["quantity"] for item in cart_items)
    }


@router.post("/add/{user_id}")
async def add_to_cart(user_id: str, cart: CartItems) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    
    # Fetch the existing cart from Redis
    existing_cart = await redis_client.hgetall(cart_key)

    # Convert the existing cart items from JSON to Python objects if they exist
    existing_cart_items = {
        item_key: json.loads(item_data)
        for item_key, item_data in existing_cart.items()
    }

    # Merge new items into the existing cart
    for item in cart.items:
        # Create a unique key using the product_id and weight
        item_key = f"{item.id}:{item.weight}:{item.grind}"
        
        if item_key in existing_cart_items:
            # Update the existing item's quantity
            existing_cart_items[item_key]["quantity"] += item.quantity
        else:
            # Add the new item to the existing cart
            existing_cart_items[item_key] = item.dict()

    # Save the merged cart back to Redis, converting each item to JSON
    updated_cart = {str(item_key): json.dumps(item_data) for item_key, item_data in existing_cart_items.items()}
    await redis_client.hset(cart_key, mapping=updated_cart)
    await redis_client.expire(cart_key, 86400)

    return {"status": "ok"}


@router.post("/remove/{user_id}")
async def remove_from_cart(user_id: str, remove_request: RemoveItemRequest) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    existing_cart = await redis_client.hgetall(cart_key)

    if not existing_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Create the composite key using product_id and weight
    product_key = f"{remove_request.product_id}:{remove_request.weight}:{remove_request.grind}"
    quantity = remove_request.quantity

    # Check if the product exists in the cart
    if product_key in existing_cart:
        # Load the existing item as a JSON object
        existing_item = json.loads(existing_cart[product_key])
        current_quantity = existing_item["quantity"]

        if current_quantity > quantity:
            # Update the quantity
            existing_item["quantity"] = current_quantity - quantity
            await redis_client.hset(cart_key, mapping={product_key: json.dumps(existing_item)})
        else:
            # Remove the item from the cart if the quantity reaches zero
            await redis_client.hdel(cart_key, product_key)
    else:
        raise HTTPException(status_code=404, detail="Product not found in cart")

    return {"status": "ok"}



@router.delete("/delete/{user_id}")
async def delete_cart(user_id: str) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    await redis_client.delete(cart_key)
    return {"status": "ok"}
