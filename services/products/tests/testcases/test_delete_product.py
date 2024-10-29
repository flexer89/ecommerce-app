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
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)


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


@pytest.fixture(scope="module")
def setup_database():
    # Setup: Create a product to delete later
    db = TestingSessionLocal()
    product = Product(
        name="Test Product",
        description="Test Description",
        price=10.0,
        stock=10,
        discount=0.1,
        category="Test Category",
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    yield product.id
    # Teardown: Drop all tables
    Base.metadata.drop_all(bind=engine)


def test_delete_product_success(setup_database):
    product_id = setup_database
    response = client.delete(f"/delete/{product_id}")
    assert response.status_code == 200
    assert response.json()["id"] == product_id


def test_delete_product_not_found():
    response = client.delete(
        "/delete/9999"
    )  # Assuming 9999 is a non-existent product ID
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"
