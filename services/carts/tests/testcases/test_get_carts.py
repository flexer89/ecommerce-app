from fastapi.testclient import TestClient
from unittest.mock import patch
from src.app import app

client = TestClient(app)

@patch("src.routes.redis_client")
def test_get_cart(mock_redis_client):
    mock_redis_client.hgetall.return_value = {"item1": "value1", "item2": "value2"}

    response = client.get("/get?email=test@example.com")

    assert response.status_code == 200
    assert response.json() == {"item1": "value1", "item2": "value2"}
    mock_redis_client.hgetall.assert_called_once_with("email:test@example.com")