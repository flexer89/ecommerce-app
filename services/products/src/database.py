import os

from dotenv import load_dotenv
from sqlalchemy import asc, create_engine, desc
from sqlalchemy.orm import Session, sessionmaker
from src.models import Product
from src.schemas import ProductCreate, ProductUpdate

load_dotenv()

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_USER = os.getenv("DATABASE_USER")

if os.getenv("ENV") == "test":
    DATABASE_URL = "sqlite:///./test.db"
else:
    DATABASE_URL = (
        f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@products-db/products"
    )

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_products_db(db: Session, limit: int = 10):
    if limit > 0:
        return db.query(Product).limit(limit).all()
    return db.query(Product).all()


def get_product_db(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()


def get_products_list_db(
    db: Session,
    limit: int,
    offset: int,
    search: str,
    arabica: bool,
    robusta: bool,
    minPrice: float,
    maxPrice: float,
    sort_by: str,
    sort_order: str,
):
    products = db.query(Product)
    if not products.count():
        return {"products": [], "total": 0, "max_price": 0}
    max_price = products.order_by(Product.price.desc()).first().price

    # Apply filters based on arabica and robusta
    if arabica:
        products = products.filter(Product.category == "arabica")
    if robusta:
        products = products.filter(Product.category == "robusta")

    # Apply price range filters
    if minPrice:
        products = products.filter(Product.price >= minPrice)
    if maxPrice:
        products = products.filter(Product.price <= maxPrice)

    # Apply search filter
    if search:
        products = products.filter(Product.name.ilike(f"%{search}%"))

    # Apply sorting options
    if sort_by:
        if sort_by == "price":
            sort_column = Product.price
        elif sort_by == "name":
            sort_column = Product.name
        elif sort_by == "discount":
            sort_column = Product.discount
        else:
            sort_column = None

        if sort_column:
            if sort_order == "asc":
                products = products.order_by(asc(sort_column))
            elif sort_order == "desc":
                products = products.order_by(desc(sort_column))

    # Get total count before applying pagination
    total = products.count()

    # Apply pagination
    products = products.limit(limit).offset(offset).all()

    return {"products": products, "total": total, "max_price": max_price}


def create_product_db(db: Session, product: ProductCreate):
    db_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        image=product.image,
        category=product.category,
        stock=product.stock,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product_db(db: Session, product_id: int, product: ProductUpdate):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db_product.name = product.name
        db_product.description = product.description
        db_product.price = product.price
        db_product.stock = product.stock
        db_product.discount = product.discount
        db_product.category = product.category
        db.commit()
        db.refresh(db_product)
    return db_product


def count_db(db: Session):
    return db.query(Product).count()


def update_product_image_db(db: Session, product_id: int, image: str):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db_product.image = image
        db.commit()
        db.refresh(db_product)
    return db_product


def delete_product_db(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product
