import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.app import app
from src.models import Base, Product
from src.routes import get_db

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override the get_db dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    # Create the test database tables
    Base.metadata.create_all(bind=engine)

    # Setup: Add initial data to the test database
    db = TestingSessionLocal()
    product1 = Product(
        id=1, name="Product 1", stock=10, price=100, category="Category 1"
    )
    product2 = Product(
        id=2, name="Product 2", stock=5, price=200, category="Category 2"
    )
    db.add(product1)
    db.add(product2)
    db.commit()
    db.close()
    yield
    # Teardown: Drop the test database tables
    Base.metadata.drop_all(bind=engine)


def test_update_quantity_success(setup_database):
    request_data = {
        "items": [
            {"product_id": 1, "quantity": 3},
            {"product_id": 2, "quantity": 2},
        ]
    }
    response = client.post("/update-quantity", json=request_data)
    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Quantities updated successfully",
    }

    # Verify the quantities in the database
    db = TestingSessionLocal()
    product1 = db.query(Product).filter(Product.id == 1).first()
    product2 = db.query(Product).filter(Product.id == 2).first()
    assert product1.stock == 7
    assert product2.stock == 3
    db.close()


def test_update_quantity_insufficient_stock(setup_database):
    request_data = {"items": [{"product_id": 1, "quantity": 20}]}
    response = client.post("/update-quantity", json=request_data)
    assert response.status_code == 400
    assert (
        "Insufficient quantity for the following products" in response.json()["detail"]
    )


def test_update_quantity_product_not_found(setup_database):
    request_data = {"items": [{"product_id": 999, "quantity": 1}]}
    response = client.post("/update-quantity", json=request_data)
    assert response.status_code == 400
    assert "Product with ID 999 not found" in response.json()["detail"]
