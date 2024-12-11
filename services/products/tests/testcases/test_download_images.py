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
def mock_get_product_db():
    with patch("src.routes.get_product_db") as mock:
        yield mock


def test_download_images_success(mock_db_session, mock_get_product_db):
    mock_product = MagicMock()
    mock_product.image = b"fake_image_data"
    mock_get_product_db.return_value = mock_product

    response = client.get("/download/images", params={"product_ids": "1,2"})
    assert response.status_code == 200
    data = response.json()
    assert "1" in data
    assert "2" in data
    assert data["1"] == "ZmFrZV9pbWFnZV9kYXRh"  # Base64 encoded "fake_image_data"
    assert data["2"] == "ZmFrZV9pbWFnZV9kYXRh"


def test_download_multiple_images_partial_success(mock_db_session, mock_get_product_db):
    mock_product_with_image = MagicMock()
    mock_product_with_image.image = b"fake_image_data"

    mock_product_without_image = MagicMock()
    mock_product_without_image.image = None

    mock_get_product_db.side_effect = [
        mock_product_with_image,
        mock_product_without_image,
    ]
    response = client.get("/download/images", params={"product_ids": "1,2"})
    assert response.status_code == 200
    data = response.json()
    assert "1" in data
    assert "2" not in data
    assert data["1"] == "ZmFrZV9pbWFnZV9kYXRh"  # Base64 encoded "fake_image_data"


def test_download_images_no_image(mock_db_session, mock_get_product_db):
    mock_get_product_db.return_value = None
    response = client.get("/download/images", params={"product_ids": "1,2,3"})
    assert response.status_code == 404
    assert response.json() == {"detail": "No images found for the provided product IDs"}


def test_download_multiple_images_no_product_ids(mock_db_session, mock_get_product_db):
    response = client.get("/download/images", params={"product_ids": ""})
    assert response.status_code == 404
    assert response.json() == {"detail": "No product IDs provided"}


def test_get_products_list_db_malformed_request(mock_db_session, mock_get_product_db):
    response = client.get("/download/images", params={"product_idserror": "1,2,3"})

    assert response.status_code == 422
    mock_get_product_db.assert_not_called()
