from fastapi.testclient import TestClient
from pymongo.errors import DuplicateKeyError
from src.app import app
from unittest.mock import MagicMock, patch

client = TestClient(app)


@patch("src.routes.collection")
def test_add_product_success(mock_collection):
    product_data = {
        "name": "test product",
        "price": 0,
        "quantity": 0,
        "description": "",
        "category": "uncategorized",
        "brand": "default",
        "images": [],
        "weight": 0,
        "dimensions": [0, 0, 0],
    }

    # mock mongo collection
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = "60f3e3e3e4b3f3e"
    mock_collection.insert_one.return_value = mock_insert_result

    response = client.post("/add", json=product_data)
    assert response.status_code == 200
    assert response.json() == {
        "message": "Product added successfully",
        "id": "60f3e3e3e4b3f3e",
    }


@patch("src.routes.collection")
def test_add_product_duplicate_name(mock_collection):
    product_data = {
        "name": "duplicated product",
        "price": 0,
        "quantity": 0,
        "description": "",
        "category": "uncategorized",
        "brand": "default",
        "images": [],
        "weight": 0,
        "dimensions": [0, 0, 0],
    }

    # mock mongo collection
    mock_collection.insert_one.side_effect = DuplicateKeyError(
        "Mocked duplicate key error"
    )

    response = client.post("/add", json=product_data)

    assert response.status_code == 400
    assert response.json()["detail"] == "Product with this name already exists"


@patch("src.routes.collection")
def test_add_product_database_error(mock_collection):
    product_data = {
        "name": "test product",
        "price": 0,
        "quantity": 0,
        "description": "",
        "category": "uncategorized",
        "brand": "default",
        "images": [],
        "weight": 0,
        "dimensions": [0, 0, 0],
    }

    mock_collection.insert_one.side_effect = ConnectionError(
        "Mocked database connection error"
    )

    response = client.post("/add", json=product_data)

    assert response.status_code == 503
    assert response.json()["detail"] == "Database connection error"


@patch("src.routes.collection")
def test_add_product_unknown_error(mock_collection):
    product_data = {
        "name": "test product",
        "price": 0,
        "quantity": 0,
        "description": "",
        "category": "uncategorized",
        "brand": "default",
        "images": [],
        "weight": 0,
        "dimensions": [0, 0, 0],
    }

    mock_collection.insert_one.side_effect = Exception("mocked unknown error")

    response = client.post("/add", json=product_data)

    assert response.status_code == 500
    assert response.json()["detail"] == "mocked unknown error"
