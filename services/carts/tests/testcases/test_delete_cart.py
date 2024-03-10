from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.app import app

client = TestClient(app)


@patch("src.routes.redis_client")
def test_delete_cart(mock_redis_client: MagicMock) -> None:
    mock_redis_client.delete.return_value = 1

    response = client.delete("/delete", params={"email": "test@example.com"})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_redis_client.delete.assert_called_once_with("email:test@example.com")
