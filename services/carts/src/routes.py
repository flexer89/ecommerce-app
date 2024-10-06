from fastapi import APIRouter, HTTPException
from typing import Dict
import json
import uuid
from redis.asyncio import Redis
from src.models import CartItems, RemoveItemRequest, CartSchema, ErrorResponse, StatusResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

redis_client = Redis(host="carts-db-service", port=6379, decode_responses=True)

def get_cart_key(user_id: str) -> str:
    return f"cart:{user_id}"


@router.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get(
    "/get/{user_id}",
    response_model=CartSchema,
    summary="Retrieve the user's shopping cart",
    description="Fetches the shopping cart data for the user identified by the `user_id`.",
)
async def get_cart(user_id: uuid.UUID):
    cart_key = get_cart_key(user_id)
    logger.info(f"Fetching cart for user_id={user_id}, cart_key={cart_key}")

    cart_data = await redis_client.hgetall(cart_key)
    if not cart_data:
        logger.warning(f"Cart not found for user_id={user_id}")
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_items = [json.loads(item_data) for item_data in cart_data.values()]
    response_data = {
        "items": cart_items,
        "total": sum(item["price"] * item["quantity"] for item in cart_items),
        "quantity": sum(item["quantity"] for item in cart_items)
    }
    
    logger.info(f"Successfully retrieved cart for user_id={user_id}: {response_data}")
    return response_data


@router.post(
    "/add/{user_id}",
    response_model=StatusResponse,
    summary="Add items to the user's shopping cart",
)
async def add_to_cart(user_id: uuid.UUID, cart: CartItems) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    logger.info(f"Adding items to cart for user_id={user_id}, cart_key={cart_key}, items={cart.items}")

    existing_cart = await redis_client.hgetall(cart_key)
    existing_cart_items = {item_key: json.loads(item_data) for item_key, item_data in existing_cart.items()}

    for item in cart.items:
        if item.quantity <= 0 or item.price < 0:
            logger.error(f"Invalid item attributes for product {item.id}: {item.dict()}")
            raise HTTPException(status_code=400, detail=f"Invalid item attributes for product {item.id}")

        item_key = f"{item.id}:{item.weight}:{item.grind}"
        if item_key in existing_cart_items:
            existing_cart_items[item_key]["quantity"] += item.quantity
            logger.info(f"Updated quantity for item {item_key} in user_id={user_id}'s cart.")
        else:
            existing_cart_items[item_key] = item.dict()
            logger.info(f"Added new item {item_key} to user_id={user_id}'s cart.")

    updated_cart = {str(item_key): json.dumps(item_data) for item_key, item_data in existing_cart_items.items()}
    await redis_client.hset(cart_key, mapping=updated_cart)
    await redis_client.expire(cart_key, 86400)

    logger.info(f"Successfully added items to cart for user_id={user_id}")
    return {"status": "ok"}


@router.post(
    "/remove/{user_id}",
    response_model=StatusResponse,
    summary="Remove items from the user's shopping cart",
)
async def remove_from_cart(user_id: uuid.UUID, remove_request: RemoveItemRequest) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    logger.info(f"Removing items from cart for user_id={user_id}, cart_key={cart_key}, remove_request={remove_request.dict()}")

    existing_cart = await redis_client.hgetall(cart_key)
    if not existing_cart:
        logger.warning(f"Cart not found for user_id={user_id}")
        raise HTTPException(status_code=404, detail="Cart not found")

    product_key = f"{remove_request.product_id}:{int(remove_request.weight)}:{remove_request.grind}"
    quantity = remove_request.quantity

    if product_key in existing_cart:
        existing_item = json.loads(existing_cart[product_key])
        current_quantity = existing_item["quantity"]

        if current_quantity > quantity:
            existing_item["quantity"] = current_quantity - quantity
            await redis_client.hset(cart_key, mapping={product_key: json.dumps(existing_item)})
            logger.info(f"Updated quantity for product {product_key} in cart of user_id={user_id}")
        else:
            await redis_client.hdel(cart_key, product_key)
            logger.info(f"Removed product {product_key} from cart of user_id={user_id}")
    else:
        logger.warning(f"Product not found in cart for user_id={user_id}, product_key={product_key}")
        raise HTTPException(status_code=404, detail="Product not found in cart")

    return {"status": "ok"}


@router.delete(
    "/delete/{user_id}",
    response_model=StatusResponse,
    summary="Delete the user's shopping cart",
)
async def delete_cart(user_id: uuid.UUID) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    logger.info(f"Deleting cart for user_id={user_id}, cart_key={cart_key}")

    response = await redis_client.delete(cart_key)
    if not response:
        logger.warning(f"Cart not found for user_id={user_id}")
        raise HTTPException(status_code=404, detail="Cart not found")

    logger.info(f"Successfully deleted cart for user_id={user_id}")
    return {"status": "ok"}
