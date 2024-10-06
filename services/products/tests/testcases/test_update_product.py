import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.app import app
from src.routes import get_db
from src.models import Base, Product

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_update_product_success(test_db):
    # Create a product to update
    product = Product(name="Test Product", description="Test Description", price=10.0, stock=100, discount=0.1, category="Test Category")
    test_db.add(product)
    test_db.commit()
    test_db.refresh(product)

    update_data = {
        "name": "Updated Product",
        "description": "Updated Description",
        "price": 20.0,
        "stock": 200,
        "discount": 0.2,
        "category": "Updated Category"
    }

    response = client.put(f"/update/{product.id}", json=update_data)
    assert response.status_code == 200
    updated_product = response.json()
    assert updated_product["name"] == "Updated Product"
    assert updated_product["description"] == "Updated Description"
    assert updated_product["price"] == 20.0
    assert updated_product["stock"] == 200
    assert updated_product["discount"] == 0.2
    assert updated_product["category"] == "Updated Category"

def test_update_product_not_found(test_db):
    update_data = {
        "name": "Non-existent Product",
        "description": "Non-existent Description",
        "price": 20.0,
        "stock": 200,
        "discount": 0.2,
        "category": "Non-existent Category"
    }

    response = client.put("/update/9999", json=update_data)
    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}