import os
from uuid import UUID
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from .models import Shipment
from .schemas import ShipmentCreate, ShipmentUpdate
from dotenv import load_dotenv

load_dotenv()

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if os.getenv("ENV") == "test":
    DATABASE_URL = "sqlite:///./test.db"
else:
    DATABASE_URL = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@shipments-db/{DATABASE_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_shipment_db(db: Session, shipment: ShipmentCreate):
    db_shipment = Shipment(**shipment.dict())
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

def update_shipment_db(db: Session, shipment_id: int, shipment: ShipmentUpdate):
    db_shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if db_shipment:
        update_data = shipment.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_shipment, key, value)
        db.commit()
        db.refresh(db_shipment)
    return db_shipment

def get_shipment_by_order_id_db(db: Session, order_id: int):
    return db.query(Shipment).filter(Shipment.order_id == order_id).first()

def get_shipment_by_user_id_db(db: Session, user_id: str):
    return db.query(Shipment).filter(Shipment.user_id == user_id).all()

def count_shipments_db(db: Session):
    return db.query(Shipment).count()

def get_all_shipments_db_paginated(db: Session, offset: int = 0, limit: int = 10, status: str = None, search: int = None):
    if status:
        return db.query(Shipment).filter(Shipment.status == status).offset(offset).limit(limit).all()
    if search:
        return db.query(Shipment).filter(Shipment.order_id == search).offset(offset).limit(limit).all()
    
    if search and status:
        return db.query(Shipment).filter(Shipment.order_id == search, Shipment.status == status).offset(offset).limit(limit).all()
    return db.query(Shipment).filter().offset(offset).limit(limit).all()

def get_shipments_count(db: Session, status: str = None):
    if status:
        return db.query(Shipment).filter(Shipment.status == status).count()
    return db.query(Shipment).count()