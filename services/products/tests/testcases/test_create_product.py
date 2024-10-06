import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.app import app
from src.models import Base
from src.routes import get_db

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override the get_db dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# Create the test database tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_create_product():
    response = client.post(
        "/create",
        data={
            "name": "Test Product",
            "description": "A product for testing",
            "price": 10.99,
            "stock": 100,
            "discount": 0.1,
            "category": "test-category",
        },
        files={"image": ("test_image.png", b"fake_image_data", "image/png")},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Product"
    assert response.json()["description"] == "A product for testing"
    assert response.json()["price"] == 10.99
    assert response.json()["stock"] == 100
    assert response.json()["discount"] == 0.0
    assert response.json()["category"] == "test-category"


def test_create_product_invalid_discount():
    response = client.post(
        "/create",
        data={
            "name": "Test Product",
            "description": "A product for testing",
            "price": 10.99,
            "stock": 100,
            "discount": 1.5,  # Invalid discount
            "category": "test-category",
        },
        files={"image": ("test_image.png", b"fake_image_data", "image/png")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Discount must be between 0 and 1"
