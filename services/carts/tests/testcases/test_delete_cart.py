import uuid
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
async def test_delete_cart_success(mock_redis):
    """Test successfully deleting a user's cart."""
    user_id = str(uuid.uuid4())
    cart_key = f"cart:{user_id}"

    mock_redis.delete.return_value = 1

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete(f"/delete/{user_id}")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

    mock_redis.delete.assert_called_once_with(cart_key)


@pytest.mark.asyncio
async def test_delete_cart_not_found(mock_redis):
    """Test trying to delete a cart that does not exist."""
    user_id = str(uuid.uuid4())
    cart_key = f"cart:{user_id}"

    mock_redis.delete.return_value = 0

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete(f"/delete/{user_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Cart not found"}

    mock_redis.delete.assert_called_once_with(cart_key)
