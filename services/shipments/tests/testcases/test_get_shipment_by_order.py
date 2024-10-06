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
def mock_get_shipment_by_order_id_db():
    with patch("src.routes.get_shipment_by_order_id_db") as mock:
        yield mock


def test_get_shipment_by_order_success(
    mock_db_session, mock_get_shipment_by_order_id_db
):
    shipment_response = {
        "id": 0,
        "order_id": 0,
        "user_id": "string",
        "shipment_address": "string",
        "current_location": "string",
        "shipment_date": "2024-10-05T13:22:02.335000",
        "delivery_date": "2024-10-05T13:22:02.335000",
        "status": "pending",
        "company": "string",
    }

    mock_get_shipment_by_order_id_db.return_value = shipment_response
    response = client.get("/getbyorder/1")

    assert response.status_code == 200
    assert response.json() == shipment_response
    mock_get_shipment_by_order_id_db.assert_called_once()


def test_get_shipment_by_order_fail(mock_db_session, mock_get_shipment_by_order_id_db):
    shipment_response = None

    mock_get_shipment_by_order_id_db.return_value = shipment_response
    response = client.get("/getbyorder/1")

    assert response.status_code == 404
    assert response.json() == {"detail": "Shipment not found"}
    mock_get_shipment_by_order_id_db.assert_called_once()


def test_get_shipment_by_order_malformed_request(
    mock_db_session, mock_get_shipment_by_order_id_db
):
    response = client.get("/getbyorder/aaa")

    assert response.status_code == 422
    mock_get_shipment_by_order_id_db.assert_not_called()
