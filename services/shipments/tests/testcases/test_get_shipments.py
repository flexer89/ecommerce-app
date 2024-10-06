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
def mock_get_all_shipments_db_paginated():
    with patch("src.routes.get_all_shipments_db_paginated") as mock:
        yield mock


@pytest.fixture
def mock_get_shipments_count():
    with patch("src.routes.get_shipments_count") as mock:
        yield mock


def test_get_shipment_count_success(
    mock_db_session, mock_get_all_shipments_db_paginated, mock_get_shipments_count
):
    mock_get_shipments_count.return_value = 1
    mock_get_all_shipments_response = [
        {
            "id": 0,
            "order_id": 0,
            "user_id": "string",
            "shipment_address": "string",
            "current_location": "string",
            "shipment_date": "2024-10-05T13:47:14.324000",
            "delivery_date": "2024-10-05T13:47:14.324000",
            "status": "pending",
            "company": "string",
        }
    ]
    mock_get_all_shipments_db_paginated.return_value = mock_get_all_shipments_response
    response = client.get("/get")

    assert response.status_code == 200
    assert response.json() == {"total": 1, "shipments": mock_get_all_shipments_response}
    mock_get_shipments_count.assert_called_once()
    mock_get_all_shipments_db_paginated.assert_called_once()
