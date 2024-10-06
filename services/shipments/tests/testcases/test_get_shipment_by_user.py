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
def mock_get_shipment_by_user_id_db():
    with patch("src.routes.get_shipment_by_user_id_db") as mock:
        yield mock

def test_get_shipment_by_user_success(mock_db_session, mock_get_shipment_by_user_id_db):
    shipment_response = [{
        "id": 0,
        "user_id": 0,
        "user_id": "string",
        "shipment_address": "string",
        "current_location": "string",
        "shipment_date": "2024-10-05T13:22:02.335000",
        "delivery_date": "2024-10-05T13:22:02.335000",
        "status": "pending",
        "order_id": 0,
        "company": "string"
    }]
    
    mock_get_shipment_by_user_id_db.return_value = shipment_response
    response = client.get("/getbyuser/8c5717d8-92dd-4161-8e0c-ff9a4b7b7ef5")

    assert response.status_code == 200
    assert response.json() == shipment_response
    mock_get_shipment_by_user_id_db.assert_called_once()

def test_get_shipment_by_user_fail(mock_db_session, mock_get_shipment_by_user_id_db):
    shipment_response = None

    mock_get_shipment_by_user_id_db.return_value = shipment_response
    response = client.get("/getbyuser/8c5717d8-92dd-4161-8e0c-ff9a4b7b7ef5")

    assert response.status_code == 404
    assert response.json() == {"detail": "Shipment not found"}
    mock_get_shipment_by_user_id_db.assert_called_once()

def test_get_shipment_by_user_malformed_request(mock_db_session, mock_get_shipment_by_user_id_db):
    response = client.get("/getbyuser/aaa")

    assert response.status_code == 422
    mock_get_shipment_by_user_id_db.assert_not_called()