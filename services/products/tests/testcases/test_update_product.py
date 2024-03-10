from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app import app

client = TestClient(app)


@patch("src.routes.collection")
def test_update_product_existing_product(mock_collection: MagicMock) -> None:
    mock_collection.update_one.return_value.matched_count = 1
    mock_collection.update_one.return_value.modified_count = 1

    response = client.patch(
        "/update/60a6e2e8a9e7a9a7a9e7a9a7", json={"name": "Updated Product"}
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Product updated successfully"}


@patch("src.routes.collection")
def test_update_product_nonexistent_product(mock_collection: MagicMock) -> None:
    mock_collection.update_one.return_value.matched_count = 0
    mock_collection.update_one.return_value.modified_count = 0

    response = client.patch(
        "/update/60a6e2e8a9e7a9a7a9e7a9a7", json={"name": "Updated Product"}
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Product not found or not modified. Product id: 60a6e2e8a9e7a9a7a9e7a9a7"
    }


@patch("src.routes.collection")
def test_update_product_exception(mock_collection: MagicMock) -> None:
    mock_collection.update_one.side_effect = Exception("Something went wrong")

    response = client.patch(
        "/update/60a6e2e8a9e7a9a7a9e7a9a7", json={"name": "Updated Product"}
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Something went wrong"}
