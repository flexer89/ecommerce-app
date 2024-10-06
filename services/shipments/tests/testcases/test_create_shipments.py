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
def mock_create_shipment_db():
    with patch("src.routes.create_shipment_db") as mock:
        yield mock


def test_create_shipment_success(mock_db_session, mock_create_shipment_db):
    shipment_response = {
        "id": 0,
        "order_id": 0,
        "user_id": "string",
        "shipment_address": "string",
        "current_location": "string",
        "shipment_date": "2024-10-05T13:14:36.330000",
        "delivery_date": "2024-10-05T13:14:36.330000",
        "status": "pending",
        "company": "string",
    }

    shipment_data = {
        "order_id": 0,
        "user_id": "string",
        "shipment_address": "string",
        "current_location": "string",
        "status": "pending",
        "company": "string",
    }
    mock_create_shipment_db.return_value = shipment_response

    response = client.post("/create", json=shipment_data)

    assert response.status_code == 201
    assert response.json() == shipment_response
    mock_create_shipment_db.assert_called_once()


def test_create_order_db_error(mock_db_session, mock_create_shipment_db):
    shipment_response = {
        "id": 0,
        "order_id": 0,
        "user_id": "string",
        "shipment_address": "string",
        "current_location": "string",
        "shipment_date": "2024-10-05T13:14:36.330000",
        "delivery_date": "2024-10-05T13:14:36.330000",
        "status": "pending",
        "company": "string",
    }

    shipment_data = {
        "shipment_address": "string",
        "current_location": "string",
        "company": "string",
    }
    mock_create_shipment_db.return_value = shipment_response

    response = client.post("/create", json=shipment_data)

    assert response.status_code == 422
    mock_create_shipment_db.assert_not_called()
