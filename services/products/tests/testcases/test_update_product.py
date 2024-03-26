from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_update_product_existing_product(mock_collection: AsyncMock) -> None:
    mock_collection.update_one.return_value.matched_count = 1
    mock_collection.update_one.return_value.modified_count = 1

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.patch(
            "/update/60a6e2e8a9e7a9a7a9e7a9a7", json={"name": "Updated Product"}
        )

    assert response.status_code == 200
    assert response.json() == {"message": "Product updated successfully"}


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_update_product_nonexistent_product(mock_collection: AsyncMock) -> None:
    mock_collection.update_one.return_value.matched_count = 0
    mock_collection.update_one.return_value.modified_count = 0

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.patch(
            "/update/60a6e2e8a9e7a9a7a9e7a9a7", json={"name": "Updated Product"}
        )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Product not found or not modified. Product id: 60a6e2e8a9e7a9a7a9e7a9a7"
    }


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_update_product_exception(mock_collection: AsyncMock) -> None:
    mock_collection.update_one.side_effect = Exception("Something went wrong")

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.patch(
            "/update/60a6e2e8a9e7a9a7a9e7a9a7", json={"name": "Updated Product"}
        )

    assert response.status_code == 500
    assert response.json() == {"detail": "Something went wrong"}
