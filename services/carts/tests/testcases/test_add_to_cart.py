import pytest
from httpx import AsyncClient
from unittest.mock import patch
from src.app import app
import json
import uuid


@pytest.fixture
def mock_redis():
    """Fixture to mock redis client."""
    with patch('src.routes.redis_client') as mock_redis:
        yield mock_redis

@pytest.mark.asyncio
async def test_add_to_cart_success(mock_redis):
    """Test successfully adding items to the cart."""
    user_id = str(uuid.uuid4())
    
    mock_redis.hgetall.return_value = {}

    cart_payload = {
        "items": [
            {"id": "1", "name": "Product 1", "price": 10.0, "quantity": 2, "weight": 500, "grind": "fine", "discount": 0.0},
            {"id": "2", "name": "Product 2", "price": 20.0, "quantity": 1, "weight": 250, "grind": "medium", "discount": 0.0}
        ]
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/add/{user_id}", json=cart_payload)
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_add_to_cart_update_existing_item(mock_redis):
    """Test adding more quantity to an existing item in the cart."""
    user_id = str(uuid.uuid4())

    existing_cart = {
        '1:500g:fine': json.dumps({"id": "1", "name": "Product 1", "price": 10.0, "quantity": 2, "weight": 500, "grind": "fine", "discount": 0.0})
    }
    mock_redis.hgetall.return_value = existing_cart

    cart_payload = {
        "items": [
            {"id": "1", "name": "Product 1", "price": 10.0, "quantity": 2, "weight": 500, "grind": "fine", "discount": 0.0}
        ]
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/add/{user_id}", json=cart_payload)

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_add_to_cart_invalid_item(mock_redis):
    """Test adding an item with invalid data (e.g., negative price or quantity)."""
    user_id = str(uuid.uuid4())
    
    mock_redis.hgetall.return_value = {}
    cart_payload = {
        "items": [
            {"id": "1", "name": "Product 1", "price": -10.0, "quantity": 2, "weight": 500, "grind": "fine", "discount": 0.0}
        ]
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/add/{user_id}", json=cart_payload)

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid item attributes for product 1"}

@pytest.mark.asyncio
async def test_add_to_cart_no_cart_found(mock_redis):
    """Test scenario where cart does not exist (but we are adding items for the first time)."""
    user_id = str(uuid.uuid4())

    mock_redis.hgetall.return_value = {}

    cart_payload = {
        "items": [
            {"id": "1", "name": "Product 1", "price": 10.0, "quantity": 2, "weight": 500, "grind": "fine", "discount": 0.0}
        ]
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(f"/add/{user_id}", json=cart_payload)

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
