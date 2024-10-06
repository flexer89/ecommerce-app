from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.routes import router

app = FastAPI()
app.include_router(router)

client = TestClient(app)


@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    yield db


@pytest.fixture
def mock_get_orders_db():
    with patch("src.routes.get_orders_db") as mock:
        yield mock


def test_get_orders_status_success(mock_db_session, mock_get_orders_db):
    order_data_response = {
        "orders": [
            {
                "created_at": "2024-10-05T12:35:52.658Z",
                "id": 0,
                "status": "pending",
                "total_price": 0,
                "updated_at": "2024-10-05T12:35:52.658Z",
                "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            }
        ],
        "total": 0,
    }
    mock_get_orders_db.return_value = order_data_response

    response = client.get("/get?status=pending")

    assert response.status_code == 200
    mock_get_orders_db.assert_called_once()


def test_get_orders_status_empty(mock_db_session, mock_get_orders_db):
    order_data_response = {"orders": [], "total": 0}
    mock_get_orders_db.return_value = order_data_response

    response = client.get("/get?status=shipped")

    assert response.status_code == 200
    assert response.json() == {"orders": [], "total": 0}
    mock_get_orders_db.assert_called_once()


def test_get_orders_search_success(mock_db_session, mock_get_orders_db):
    order_data_response = {
        "orders": [
            {
                "created_at": "2024-10-05T12:35:52.658Z",
                "id": 1,
                "status": "pending",
                "total_price": 0,
                "updated_at": "2024-10-05T12:35:52.658Z",
                "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            }
        ],
        "total": 0,
    }
    mock_get_orders_db.return_value = order_data_response

    response = client.get("/get?search=1")

    assert response.status_code == 200
    mock_get_orders_db.assert_called_once()


def test_get_orders_search_empty(mock_db_session, mock_get_orders_db):
    order_data_response = {"orders": [], "total": 0}
    mock_get_orders_db.return_value = order_data_response

    response = client.get("/get?search=1")

    assert response.status_code == 200
    mock_get_orders_db.assert_called_once()


def test_get_orders_malformed_request(mock_db_session, mock_get_orders_db):
    response = client.get("/get?search=aaaa")
    assert response.status_code == 422
    mock_get_orders_db.assert_not_called()
