from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_remove_and_delete_from_cart(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.hgetall.return_value = {"product1": "1", "product2": "1"}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/remove", params={"email": "test@example.com", "product_id": "product1"}
        )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hdel.assert_called_once_with("email:test@example.com", "product1")


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_remove_from_cart(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.hgetall.return_value = {"product1": "2", "product2": "1"}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/remove", params={"email": "test@example.com", "product_id": "product1"}
        )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hdel.assert_not_called()


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_remove_nonexistent_cart(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.hgetall.return_value = {}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/remove", params={"email": "test@example.com", "product_id": "product1"}
        )
    assert response.status_code == 404
    assert response.json() == {"detail": "Cart not found. Email: test@example.com"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hdel.assert_not_called()
