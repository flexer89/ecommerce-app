from fastapi import APIRouter, HTTPException
from typing import Dict
import json
import uuid
from redis.asyncio import Redis
from src.models import CartItems, RemoveItemRequest, CartSchema, ErrorResponse, StatusResponse

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
    description="Fetches the shopping cart data for the user identified by the `user_id`. The response contains details of the cart items, the total price, and the total quantity of items in the cart. If no cart is found for the user, a 404 error is returned.",
    responses={
        200: {"description": "Cart data retrieved successfully."},
        404: {"description": "Cart not found.", "model": ErrorResponse},
    }
)
async def get_cart(user_id: uuid.UUID):
    cart_key = get_cart_key(user_id)
    cart_data = await redis_client.hgetall(cart_key)
    if not cart_data:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_items = [json.loads(item_data) for item_data in cart_data.values()]
    
    return {
        "items": cart_items,
        "total": sum(item["price"] * item["quantity"] for item in cart_items),
        "quantity": sum(item["quantity"] for item in cart_items)
    }


@router.post(
    "/add/{user_id}",
    response_model=StatusResponse,
    summary="Add items to the user's shopping cart",
    description="Adds new items to the user's shopping cart or updates the quantity of existing items in the cart. If the product (identified by product_id, weight, and grind) already exists in the cart, the item's quantity is updated.",
    responses={
        200: {"description": "Items added to the cart successfully.", "model": StatusResponse},
        400: {"description": "Bad request - Invalid data provided.", "model": ErrorResponse},
    }
)
async def add_to_cart(user_id: uuid.UUID, cart: CartItems) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)

    existing_cart = await redis_client.hgetall(cart_key)

    existing_cart_items = {
        item_key: json.loads(item_data)
        for item_key, item_data in existing_cart.items()
    }

    for item in cart.items:

        if item.quantity <= 0 or item.price < 0:
            raise HTTPException(status_code=400, detail=f"Invalid item attributes for product {item.id}")

        item_key = f"{item.id}:{item.weight}:{item.grind}"
        
        if item_key in existing_cart_items:
            existing_cart_items[item_key]["quantity"] += item.quantity
        else:
            existing_cart_items[item_key] = item.dict()

    updated_cart = {str(item_key): json.dumps(item_data) for item_key, item_data in existing_cart_items.items()}
    await redis_client.hset(cart_key, mapping=updated_cart)
    await redis_client.expire(cart_key, 86400)

    return {"status": "ok"}

@router.post(
    "/remove/{user_id}",
    response_model=StatusResponse,
    summary="Remove items from the user's shopping cart",
    description=(
        "Removes a specified quantity of an item from the user's shopping cart. "
        "If the quantity to remove is greater than or equal to the current quantity, the item will be removed entirely. "
        "Otherwise, the item's quantity is updated. Each item in the cart is identified by a combination of product_id, weight, and grind."
    ),
    responses={
        200: {"description": "Item removed or updated successfully.","model": StatusResponse},
        400: {"description": "Bad request - Invalid data provided.", "model": ErrorResponse},
        404: {"description": "Cart or product not found.", "model": ErrorResponse},
    }
)
async def remove_from_cart(user_id: uuid.UUID, remove_request: RemoveItemRequest) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    existing_cart = await redis_client.hgetall(cart_key)

    if not existing_cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    product_key = f"{remove_request.product_id}:{int(remove_request.weight)}:{remove_request.grind}"
    quantity = remove_request.quantity

    if product_key in existing_cart:
        existing_item = json.loads(existing_cart[product_key])
        current_quantity = existing_item["quantity"]

        if current_quantity > quantity:
            existing_item["quantity"] = current_quantity - quantity
            await redis_client.hset(cart_key, mapping={product_key: json.dumps(existing_item)})
        else:
            await redis_client.hdel(cart_key, product_key)
    else:
        # raise Exception(f"product_key: {product_key}, existing_cart: {existing_cart}")
        raise HTTPException(status_code=404, detail="Product not found in cart")

    return {"status": "ok"}



@router.delete(
    "/delete/{user_id}",
    response_model=StatusResponse,
    summary="Delete the user's shopping cart",
    description=(
        "Deletes the entire shopping cart for the specified user. This action will remove all items from the cart. "
        "The cart is identified by the user ID, and if no cart is found, an appropriate error will be returned."
    ),
    responses={
        200: {"description": "Cart deleted successfully.", "model": StatusResponse},
        404: {"description": "Cart not found.", "model": ErrorResponse},
    }
)
async def delete_cart(user_id: uuid.UUID) -> Dict[str, str]:
    cart_key = get_cart_key(user_id)
    response = await redis_client.delete(cart_key)
    if not response:
        raise HTTPException(status_code=404, detail="Cart not found")
    return {"status": "ok"}
