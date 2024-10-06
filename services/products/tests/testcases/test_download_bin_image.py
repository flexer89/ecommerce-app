import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.app import app
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

# Create the test database tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    # Create a sample product with an image
    db = TestingSessionLocal()
    product = Product(
        name="Test Product",
        description="A product for testing",
        price=10.0,
        stock=100,
        discount=0.1,
        category="test",
        image=b"test_image_data",
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    yield db
    db.query(Product).delete()
    db.commit()
    db.close()


def test_download_binary_product_image_success(setup_database):
    response = client.get("/download/bin/1")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/octet-stream"
    assert (
        response.headers["content-disposition"]
        == 'attachment; filename="product_1_image.bin"'
    )


def test_download_binary_product_image_not_found(setup_database):
    response = client.get("/download/bin/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Image not found"}
