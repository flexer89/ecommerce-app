import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.app import app  # Assuming your FastAPI app is in src/main.py
from src.models import Base, Product
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

# Create the test client
client = TestClient(app)

# Create the test database tables
Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="module")
def test_db():
    # Create test data
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    product1 = Product(
        name="Test Product 1",
        description="Test Description 1",
        price=10.0,
        stock=10,
        discount=0.1,
        category="Test Category",
        image=None,
    )
    product2 = Product(
        name="Test Product 2",
        description="Test Description 2",
        price=20.0,
        stock=20,
        discount=0.2,
        category="Test Category",
        image=None,
    )
    db.add(product1)
    db.add(product2)
    db.commit()
    db.refresh(product1)
    db.refresh(product2)
    yield db
    db.query(Product).delete()
    db.commit()
    db.close()


def test_read_products(test_db):
    response = client.get("/get?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "total" in data
    assert "total_max_price" in data
    assert len(data["products"]) > 0


def test_read_products_with_filters(test_db):
    response = client.get("/get?limit=10&offset=0&search=Test Product 1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["products"]) == 1
    assert data["products"][0]["name"] == "Test Product 1"


def test_get_products_list_db_not_found(test_db):
    response = client.get("/get?limit=1&offset=0&search=Non-existent Product")

    assert response.status_code == 200
    assert response.json() == {"products": [], "total": 0, "total_max_price": 20}


def test_get_products_list_db_malformed_request(test_db):
    response = client.get("/get?limit=abc&offset=abc")
    assert response.status_code == 422
