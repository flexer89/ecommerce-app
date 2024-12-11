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
def mock_get_bestsellers_db():
    with patch("src.routes.get_bestsellers_db") as mock:
        yield mock


def test_get_bestsellers_success(mock_db_session, mock_get_bestsellers_db):
    order_data_response = [(2, 40), (4, 36), (1, 34)]
    mock_get_bestsellers_db.return_value = order_data_response

    response = client.get("/bestsellers")

    assert response.status_code == 200
    assert response.json() == [
        {"product_id": 2, "order_count": 40},
        {"product_id": 4, "order_count": 36},
        {"product_id": 1, "order_count": 34},
    ]
    mock_get_bestsellers_db.assert_called_once()


def test_get_bestsellers_malformed_request(mock_db_session, mock_get_bestsellers_db):
    response = client.get("/bestsellers?limit=abc")
    assert response.status_code == 422
    mock_get_bestsellers_db.assert_not_called()
