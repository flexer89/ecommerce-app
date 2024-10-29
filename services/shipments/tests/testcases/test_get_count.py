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
def mock_count_shipments_db():
    with patch("src.routes.count_shipments_db") as mock:
        yield mock


def test_get_shipment_count_success(mock_db_session, mock_count_shipments_db):
    mock_count_shipments_db.return_value = 1
    response = client.get("/count")

    assert response.status_code == 200
    assert response.json() == {"total": 1}
    mock_count_shipments_db.assert_called_once()
