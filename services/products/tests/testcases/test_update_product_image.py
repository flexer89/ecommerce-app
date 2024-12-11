from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.app import app
from src.models import Base, Product
from src.routes import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
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


@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_update_product_image_success(test_db):
    # Create a test product
    test_product = Product(
        name="Test Product",
        description="Test Description",
        price=10.0,
        stock=10,
        discount=0.1,
        category="Test Category",
    )
    test_db.add(test_product)
    test_db.commit()
    test_db.refresh(test_product)

    # Prepare the image file
    image_content = b"test image content"
    image_file = BytesIO(image_content)
    image_file.name = "test_image.png"

    response = client.put(
        f"/update/{test_product.id}/image",
        files={"image": ("test_image.png", image_file, "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["id"] == test_product.id


def test_update_product_image_not_found(test_db):
    # Prepare the image file
    image_content = b"test image content"
    image_file = BytesIO(image_content)
    image_file.name = "test_image.png"

    response = client.put(
        "/update/9999/image",
        files={"image": ("test_image.png", image_file, "image/png")},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}
