from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_get_cart(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.hgetall.return_value = {"item1": "value1", "item2": "value2"}

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/get?email=test@example.com")

    assert response.status_code == 200
    assert response.json() == {"item1": "value1", "item2": "value2"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
