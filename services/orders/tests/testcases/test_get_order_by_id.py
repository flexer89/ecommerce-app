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
def mock_get_order_db():
    with patch("src.routes.get_order_db") as mock:
        yield mock


def test_read_order_success(mock_db_session, mock_get_order_db):
    order_data = {
        "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "total_price": 10,
        "status": "pending",
        "id": 1,
        "created_at": "2024-10-04T17:25:29.413458",
        "updated_at": "2024-10-04T17:25:29.413458",
        "items": [
            {
                "product_id": 1,
                "quantity": 1,
                "price": 10.0,
                "weight": 5.0,
                "id": 1,
                "created_at": "2024-10-04T17:25:29.413458",
            }
        ],
    }
    mock_get_order_db.return_value = order_data

    response = client.get("/get/1")

    assert response.status_code == 200
    assert response.json() == order_data
    mock_get_order_db.assert_called_once()


def test_read_order_not_found(mock_db_session, mock_get_order_db):
    order_data = None
    mock_get_order_db.return_value = order_data
    response = client.get("/get/1")

    assert response.status_code == 404
    assert response.json() == {"detail": "Order not found"}
    mock_get_order_db.assert_called_once()
