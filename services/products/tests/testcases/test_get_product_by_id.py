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

# Create the test client
client = TestClient(app)

# Create the test database tables
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="module")
def test_db():
    # Create a new database session for the test
    db = TestingSessionLocal()
    yield db
    db.close()


def test_read_product_success(test_db):
    # Add a test product to the database
    test_product = Product(
        name="Test Product", description="Test Description", price=10.0
    )
    test_db.add(test_product)
    test_db.commit()
    test_db.refresh(test_product)

    # Test the read_product endpoint
    response = client.get(f"/getbyid/{test_product.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Product"
    assert response.json()["description"] == "Test Description"
    assert response.json()["price"] == 10.0


def test_read_product_not_found():
    # Test the read_product endpoint with a non-existent product ID
    response = client.get("/getbyid/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"
