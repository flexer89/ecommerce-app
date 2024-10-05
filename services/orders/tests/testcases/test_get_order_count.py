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
def mock_get_count_db():
    with patch("src.routes.count_db") as mock:
        yield mock

def test_get_bestsellers_success(mock_db_session, mock_get_count_db):
    order_data_response = 100
    mock_get_count_db.return_value = order_data_response

    response = client.get("/count")

    assert response.status_code == 200
    assert response.json() == 100
    mock_get_count_db.assert_called_once()
