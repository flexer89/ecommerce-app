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
def mock_create_order_db():
    with patch("src.routes.create_order_db") as mock:
        yield mock


def test_create_order_success(mock_db_session, mock_create_order_db):
    mock_create_order_db.return_value = 1  # Mock the created order ID

    order_data = {
        "user_id": "c8940d5e-2fa4-4f10-a3e8-1eb4d05876a1",
        "items": [
            {"id": 1, "quantity": 2, "price": 50, "weight": 500},
            {"id": 2, "quantity": 1, "price": 50, "weight": 500},
        ],
        "total_price": 100.0,
    }

    response = client.post("/create", json=order_data)

    assert response.status_code == 201
    assert response.json() == {"order_id": 1}
    mock_create_order_db.assert_called_once()


def test_create_order_db_error(mock_db_session, mock_create_order_db):
    mock_create_order_db.side_effect = RuntimeError("Database error")

    order_data = {
        "user_id": "c8940d5e-2fa4-4f10-a3e8-1eb4d05876a1",
        "items": [
            {"id": 1, "quantity": 2, "price": 50.0, "weight": 500},
            {"id": 2, "quantity": 1, "price": 50.0, "weight": 500},
        ],
        "total_price": 100.0,
    }

    response = client.post("/create", json=order_data)

    assert response.status_code == 500
    assert response.json() == {"detail": "Database error: Database error"}
    mock_create_order_db.assert_called_once()
