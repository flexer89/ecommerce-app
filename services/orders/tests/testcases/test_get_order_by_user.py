import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.routes import router, create_order
from src.schemas import CreateOrderRequest, CreateOrderResponse, ErrorResponse
from src.routes import get_db
from unittest.mock import MagicMock, patch
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)

client = TestClient(app)

@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    yield db

@pytest.fixture
def mock_get_order_by_user_db():
    with patch("src.routes.get_orders_by_user_id_db") as mock:
        yield mock

def test_get_order_by_user_success(mock_db_session, mock_get_order_by_user_db):
    order_data_response = [{
        "user_id": "f9df0b92-4a6f-4ec7-80a0-364d15481998",
        "total_price": 0,
        "status": "shipped",
        "id": 1,
        "created_at": "2024-10-04T17:25:29.413458",
        "updated_at": "2024-10-04T17:25:29.413458",
        "items": [
            {
            "product_id": 0,
            "quantity": 0,
            "price": 0.0,
            "weight": 0.0,
            "id": 0,
            "created_at": "2024-10-04T17:25:29.413458"
            }
        ]
    }]
    mock_get_order_by_user_db.return_value = order_data_response

    response = client.get("/getbyuser/f9df0b92-4a6f-4ec7-80a0-364d15481998")

    assert response.status_code == 200
    assert response.json() == order_data_response
    mock_get_order_by_user_db.assert_called_once()

def test_get_order_by_user_not_found(mock_db_session, mock_get_order_by_user_db):
    order_data = None
    mock_get_order_by_user_db.return_value = order_data
    response = client.get("/getbyuser/f9df0b92-4a6f-4ec7-80a0-364d15481998")

    assert response.status_code == 404
    assert response.json() == {"detail": "No orders found for this user"}
    mock_get_order_by_user_db.assert_called_once()
    
def test_get_order_by_user_malformed_request(mock_db_session, mock_get_order_by_user_db):
    response = client.get("/getbyuser/abc123")
    assert response.status_code == 422
    mock_get_order_by_user_db.assert_not_called()