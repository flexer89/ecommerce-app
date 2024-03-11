from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app import app

client = TestClient(app)


@patch("src.routes.collection")
def test_delete_product_existing_product(mock_collection: MagicMock) -> None:
    mock_collection.delete_one.return_value.deleted_count = 1

    response = client.delete("/delete/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 200
    assert response.json() == {"message": "Product deleted successfully"}


@patch("src.routes.collection")
def test_delete_product_nonexistent_product(mock_collection: MagicMock) -> None:
    mock_collection.delete_one.return_value.deleted_count = 0

    response = client.delete("/delete/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Product not found. Product id: 60a6e2e8a9e7a9a7a9e7a9a7"
    }
