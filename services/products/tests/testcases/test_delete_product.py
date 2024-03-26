from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_delete_product_existing_product(mock_collection: AsyncMock) -> None:
    mock_collection.delete_one.return_value.deleted_count = 1

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete("/delete/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 200
    assert response.json() == {"message": "Product deleted successfully"}


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_delete_product_nonexistent_product(mock_collection: AsyncMock) -> None:
    mock_collection.delete_one.return_value.deleted_count = 0

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.delete("/delete/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Product not found. Product id: 60a6e2e8a9e7a9a7a9e7a9a7"
    }
