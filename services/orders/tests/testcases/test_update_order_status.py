from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.routes import create_order, get_db, router
from src.schemas import CreateOrderRequest, CreateOrderResponse, ErrorResponse

app = FastAPI()
app.include_router(router)

client = TestClient(app)


@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    yield db


@pytest.fixture
def mock_update_order_status_db():
    with patch("src.routes.update_order_status_db") as mock:
        yield mock


def test_update_order_success(mock_db_session, mock_update_order_status_db):
    order_data = {"status": "shipped"}

    order_data_response = {
        "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
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
                "created_at": "2024-10-04T17:25:29.413458",
            }
        ],
    }
    mock_update_order_status_db.return_value = order_data_response

    response = client.put("/update/1/status", json=order_data)

    assert response.status_code == 200
    assert response.json() == order_data_response
    mock_update_order_status_db.assert_called_once()


def test_update_status_order_not_found(mock_db_session, mock_update_order_status_db):
    order_data = None
    mock_update_order_status_db.return_value = order_data
    response = client.put("/update/1/status", json={"status": "shipped"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Order not found"}
    mock_update_order_status_db.assert_called_once()


def test_update_order_status_malformed_request(
    mock_db_session, mock_update_order_status_db
):
    response = client.put("/update/1/status", json={})
    assert response.status_code == 422
    mock_update_order_status_db.assert_not_called()
