from fastapi.testclient import TestClient
from unittest.mock import patch
from src.app import app

client = TestClient(app)


@patch("src.routes.redis_client")
def test_remove_and_delete_from_cart(mock_redis_client):
    mock_redis_client.hgetall.return_value = {"product1": "1", "product2": "1"}

    response = client.post(
        "/remove", params={"email": "test@example.com", "product_id": "product1"}
    )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hdel.assert_called_once_with("email:test@example.com", "product1")


@patch("src.routes.redis_client")
def test_remove_from_cart(mock_redis_client):
    mock_redis_client.hgetall.return_value = {"product1": "2", "product2": "1"}

    response = client.post(
        "/remove", params={"email": "test@example.com", "product_id": "product1"}
    )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hdel.assert_not_called()


@patch("src.routes.redis_client")
def test_remove_nonexistent_cart(mock_redis_client):
    mock_redis_client.hgetall.return_value = {}

    response = client.post(
        "/remove", params={"email": "test@example.com", "product_id": "product1"}
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found in cart"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")
    mock_redis_client.hdel.assert_not_called()
