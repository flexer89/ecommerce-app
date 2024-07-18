from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from src.models import Product
from src.schemas import ProductCreate, ProductUpdate

SQLALCHEMY_DATABASE_URL = "postgresql://products:password@products-db/products"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_products_db(db: Session, limit: int = 10):
    if limit > 0:
        return db.query(Product).limit(limit).all()
    return db.query(Product).all()

def get_product_db(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def create_product_db(db: Session, product: ProductCreate):
    db_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        image=product.image
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
        if product.image is not None:
            db_product.image = product.image
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product_db(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product
