import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.routes import router
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
def mock_update_shipment_db():
    with patch("src.routes.update_shipment_db") as mock:
        yield mock

def test_update_shipment_success(mock_db_session, mock_update_shipment_db):
    shipment_response = {
        "id": 0,
        "order_id": 0,
        "user_id": "string",
        "shipment_address": "string",
        "current_location": "string",
        "shipment_date": "2024-10-05T13:17:18.346000",
        "delivery_date": "2024-10-05T13:17:18.346000",
        "status": "pending",
        "company": "string"
    }

    shipment_data = {
        "shipment_address": "string",
        "current_location": "string",
        "status": "pending",
        "delivery_date": "2024-10-05T13:17:18.346000"
    }
    
    mock_update_shipment_db.return_value = shipment_response
    response = client.patch("/update/1", json=shipment_data)

    assert response.status_code == 200
    assert response.json() == shipment_response
    mock_update_shipment_db.assert_called_once()

def test_update_shipment_fail(mock_db_session, mock_update_shipment_db):
    shipment_response = None
    shipment_data = {
        "shipment_address": "string",
        "current_location": "string",
        "status": "pending",
        "delivery_date": "2024-10-05T13:17:18.336Z"
    }
    
    mock_update_shipment_db.return_value = shipment_response
    response = client.patch("/update/1", json=shipment_data)

    assert response.status_code == 404
    assert response.json() == {"detail": "Shipment not found"}
    mock_update_shipment_db.assert_called_once()

def test_update_shipment_malformed_request(mock_db_session, mock_update_shipment_db):
    shipment_data = {
        "shipment_address": 123,
        "current_location": "string",
        "delivery_date": "2024-10-05T13:17:18.336Z"
    }

    response = client.patch("/update/1", json=shipment_data)

    assert response.status_code == 422
    mock_update_shipment_db.assert_not_called()