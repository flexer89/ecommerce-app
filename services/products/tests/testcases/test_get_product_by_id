from fastapi.testclient import TestClient
from unittest.mock import patch
from bson import ObjectId
from src.app import app

client = TestClient(app)


@patch("src.routes.collection")
def test_get_product_by_id_existing_product(mock_collection):

    mock_collection.find_one.return_value = {
        "_id": ObjectId("60a6e2e8a9e7a9a7a9e7a9a7"),
        "name": "Product 1",
    }

    response = client.get("/get/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 200
    assert response.json() == {"_id": "60a6e2e8a9e7a9a7a9e7a9a7", "name": "Product 1"}


@patch("src.routes.collection")
def test_get_product_by_id_nonexistent_product(mock_collection):
    mock_collection.find_one.return_value = None

    response = client.get("/get/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}


@patch("src.routes.collection")
def test_get_product_by_id_exception(mock_collection):
    mock_collection.find_one.side_effect = Exception("Something went wrong")

    response = client.get("/get/60a6e2e8a9e7a9a7a9e7a9a7")

    assert response.status_code == 500
    assert response.json() == {"detail": "Something went wrong"}
