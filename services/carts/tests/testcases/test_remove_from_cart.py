import json
import uuid
from unittest.mock import patch

import pytest
from fastapi import HTTPException
from httpx import AsyncClient
from src.app import app
from src.models import RemoveItemRequest


@pytest.fixture
def mock_redis():
    """Fixture to mock redis client."""
    with patch("src.routes.redis_client") as mock_redis:
        yield mock_redis


@pytest.mark.asyncio
async def test_remove_from_cart_success(mock_redis):
    """Test successfully removing items from a user's cart (quantity updated)."""
    user_id = str(uuid.uuid4())
    cart_key = f"cart:{user_id}"
    product_key = "1:500:ground"

    existing_cart = {
        "1:500:ground": json.dumps(
            {
                "id": "1",
                "name": "Product 1",
                "price": 10.0,
                "quantity": 2,
                "weight": 500,
                "discount": 0.0,
            }
        )
    }
    mock_redis.hgetall.return_value = existing_cart

    remove_request = RemoveItemRequest(product_id=1, weight=500, quantity=1)

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/remove/{user_id}", json=remove_request.dict())

    assert response.json() == {"status": "ok"}
    assert response.status_code == 200

    updated_item = {
        "id": "1",
        "name": "Product 1",
        "price": 10.0,
        "quantity": 1,
        "weight": 500,
        "discount": 0.0,
    }
    mock_redis.hset.assert_called_once_with(
        cart_key, mapping={product_key: json.dumps(updated_item)}
    )


@pytest.mark.asyncio
async def test_remove_from_cart_item_deleted(mock_redis):
    """Test removing an item from the cart completely (quantity reaches zero)."""
    user_id = str(uuid.uuid4())
    cart_key = f"cart:{user_id}"
    product_key = "1:500:ground"

    existing_cart = {
        "1:500:ground": json.dumps(
            {
                "id": "1",
                "name": "Product 1",
                "price": 10.0,
                "quantity": 2,
                "weight": 500,
                "discount": 0.0,
            }
        )
    }
    mock_redis.hgetall.return_value = existing_cart

    remove_request = RemoveItemRequest(product_id=1, weight=500, quantity=2)

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/remove/{user_id}", json=remove_request.dict())

    assert response.json() == {"status": "ok"}
    assert response.status_code == 200

    mock_redis.hdel.assert_called_once_with(cart_key, product_key)


@pytest.mark.asyncio
async def test_remove_from_cart_not_found(mock_redis):
    """Test trying to remove items from a cart that does not exist."""
    user_id = str(uuid.uuid4())
    cart_key = f"cart:{user_id}"

    mock_redis.hgetall.return_value = {}

    remove_request = RemoveItemRequest(product_id=1, weight=500, quantity=2)

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/remove/{user_id}", json=remove_request.dict())

    assert response.status_code == 404
    assert response.json() == {"detail": "Cart not found"}

    mock_redis.hgetall.assert_called_once_with(cart_key)


@pytest.mark.asyncio
async def test_remove_from_cart_product_not_found(mock_redis):
    """Test trying to remove a product that is not in the cart."""
    user_id = str(uuid.uuid4())
    cart_key = f"cart:{user_id}"

    mock_redis.hgetall.return_value = {
        "2:500:ground": json.dumps({"quantity": 5, "price": 10.0})
    }

    remove_request = RemoveItemRequest(product_id=1, weight=500, quantity=2)

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/remove/{user_id}", json=remove_request.dict())

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found in cart"}

    mock_redis.hgetall.assert_called_once_with(cart_key)
