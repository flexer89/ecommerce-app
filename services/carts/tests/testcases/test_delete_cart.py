from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.redis_client")
async def test_delete_cart(mock_redis_client: AsyncMock) -> None:
    mock_redis_client.delete.return_value = 1

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete("/delete", params={"email": "test@example.com"})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.delete.assert_called_once_with("email:test@example.com")
