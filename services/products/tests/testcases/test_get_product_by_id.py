from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from bson import ObjectId
from src.app import app
import pytest


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_get_product_by_id_existing_product(mock_collection: AsyncMock) -> None:

    mock_collection.find_one.return_value = {
        "_id": ObjectId("60a6e2e8a9e7a9a7a9e7a9a7"),
        "name": "Product 1",
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/get/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 200
    assert response.json() == {"_id": "60a6e2e8a9e7a9a7a9e7a9a7", "name": "Product 1"}


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_get_product_by_id_nonexistent_product(
    mock_collection: AsyncMock,
) -> None:
    mock_collection.find_one.return_value = None

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/get/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Product not found. Product id: 60a6e2e8a9e7a9a7a9e7a9a7"
    }


@pytest.mark.asyncio
@patch("src.routes.collection", new_callable=AsyncMock)
async def test_get_product_by_id_exception(mock_collection: AsyncMock) -> None:
    mock_collection.find_one.side_effect = Exception("Something went wrong")

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/get/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 500
    assert response.json() == {"detail": "Something went wrong"}
