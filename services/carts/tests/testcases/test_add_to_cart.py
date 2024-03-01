from fastapi.testclient import TestClient
from unittest.mock import patch
from src.app import app

client = TestClient(app)


@patch("src.routes.redis_client")
def test_add_to_cart(mock_redis_client):
    mock_redis_client.hgetall.return_value = {"item1": "value1", "item2": "value2"}

    response = client.post(
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


def test_add_to_cart_invalid_quantity():
    response = client.post(
        "/add",
        params={"email": "test@example.com"},
        json=[
            {"product_id": "product1", "quantity": -1},
            {"product_id": "product2", "quantity": 3},
        ],
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Quantity must be greater than 0"}


@patch("src.routes.redis_client")
def test_add_to_cart_cart_does_not_exist(mock_redis_client):
    mock_redis_client.hgetall.return_value = {}

    response = client.post(
        "/add",
        params={"email": "test@example.com"},
        json=[
            {"product_id": "product1", "quantity": 2},
            {"product_id": "product2", "quantity": 3},
        ],
    )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
