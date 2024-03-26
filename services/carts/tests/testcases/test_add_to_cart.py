from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_add_to_cart(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.hgetall.return_value = {"item1": "value1", "item2": "value2"}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/add",
            params={"email": "test@example.com"},
            json=[
                {"product_id": "product1", "quantity": 2},
                {"product_id": "product2", "quantity": 3},
            ],
        )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hset.assert_called_once_with(
        "email:test@example.com", mapping={"product1": 2, "product2": 3}
    )


@pytest.mark.asyncio
async def test_add_to_cart_invalid_quantity() -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/add",
            params={"email": "test@example.com"},
            json=[
                {"product_id": "product1", "quantity": -1},
                {"product_id": "product2", "quantity": 3},
            ],
        )

    assert response.status_code == 400
    assert response.json() == {"detail": "Quantity must be greater than 0"}


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_add_to_cart_cart_does_not_exist(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.hgetall.return_value = {}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/add",
            params={"email": "test@example.com"},
            json=[
                {"product_id": "product1", "quantity": 2},
                {"product_id": "product2", "quantity": 3},
            ],
        )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
