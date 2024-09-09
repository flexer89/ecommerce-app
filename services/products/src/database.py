import os 
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from src.models import Product
from src.schemas import ProductCreate, ProductUpdate
from dotenv import load_dotenv

load_dotenv()

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@products-db/products"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_products_db(db: Session, limit: int = 10):
    if limit > 0:
        return db.query(Product).limit(limit).all()
    return db.query(Product).all()

def get_product_db(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_products_list_db(db: Session, limit: int, offset: int):
    return db.query(Product).offset(offset).limit(limit).all()

def create_product_db(db: Session, product: ProductCreate):
    db_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        image=product.image,
        category=product.category,
        stock=product.stock
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
