from unittest.mock import patch

import pytest
from httpx import AsyncClient

from src.app import app


@pytest.fixture
def mock_redis():
    """Fixture to mock redis client."""
    with patch("src.routes.redis_client") as mock_redis:
        yield mock_redis


@pytest.mark.asyncio
async def test_get_cart_success(mock_redis):
    """Test case when the cart is found."""
    user_id = "e3a9fc5f-1c42-410f-a0c4-1d9155289552"
    cart_key = f"cart:{user_id}"

    cart_data = {
        "1:500:fine": '{"id": 1, "name": "Product 1", "price": 10.0, "discount": 0.0, "grind": "fine", "weight": 250.0, "quantity": 4}'
    }
    mock_redis.hgetall.return_value = cart_data

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"/get/{user_id}")

    assert response.status_code == 200
    data = response.json()

    assert data["items"] == [
        {
            "id": 1,
            "name": "Product 1",
            "price": 10.0,
            "discount": 0.0,
            "grind": "fine",
            "weight": 250.0,
            "quantity": 4,
        },
    ]
    assert data["total"] == 40.0
    assert data["quantity"] == 4


@pytest.mark.asyncio
async def test_get_cart_not_found(mock_redis):
    """Test case when the cart is not found."""
    user_id = "e3a9fc5f-1c42-410f-a0c4-1d9155289552"
    cart_key = f"cart:{user_id}"

    mock_redis.hgetall.return_value = {}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"/get/{user_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Cart not found"}


@pytest.mark.asyncio
async def test_get_cart_empty_cart(mock_redis):
    """Test case when the cart is found but is empty."""
    user_id = "e3a9fc5f-1c42-410f-a0c4-1d9155289552"
    cart_key = f"cart:{user_id}"

    mock_redis.hgetall.return_value = {}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"/get/{user_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Cart not found"}


@pytest.mark.asyncio
async def test_get_cart_invalid_user_id(mock_redis):
    """Test case when the user ID is invalid (e.g. malformed)."""
    invalid_user_id = "invalid-id!"

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"/get/{invalid_user_id}")

    assert response.status_code == 422
