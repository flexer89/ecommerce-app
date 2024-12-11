from datetime import datetime, timedelta

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

# Create the database tables
Base.metadata.create_all(bind=engine)


# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Add test data
    db.add_all(
        [
            Product(
                name="Product 1",
                stock=5,
                price=100,
                category="Category 1",
                created_at=datetime.now(),
                discount=0.1,
            ),
            Product(
                name="Product 2",
                stock=0,
                price=200,
                category="Category 2",
                created_at=datetime.now() - timedelta(days=40),
                discount=0,
            ),
            Product(
                name="Product 3",
                stock=15,
                price=150,
                category="Category 3",
                created_at=datetime.now() - timedelta(days=20),
                discount=0.2,
            ),
            Product(
                name="Product 4",
                stock=8,
                price=80,
                category="Category 4",
                created_at=datetime.now() - timedelta(days=10),
                discount=0.05,
            ),
        ]
    )
    db.commit()
    yield db
    db.query(Product).delete()
    db.commit()
    db.close()


def test_get_product_trends(setup_db):
    response = client.get("/trends")
    assert response.status_code == 200
    data = response.json()

    assert data["out_of_stock_product_amount"] == 1
    assert len(data["low_stock_products"]) == 3
    assert len(data["new_products"]) == 3
    assert len(data["discounted_products"]) == 3

    assert data["low_stock_products"][0]["name"] == "Product 2"
    assert data["new_products"][0]["name"] == "Product 1"
    assert data["discounted_products"][0]["name"] == "Product 3"
