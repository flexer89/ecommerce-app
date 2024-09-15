from fastapi import APIRouter, Depends, HTTPException
import os
from src.database import *
from src.schemas import *
from src.models import Base
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/k8s")
def k8s():
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/create", response_model=ShipmentResponse)
def create_shipment(shipment: ShipmentCreate, db: Session = Depends(get_db)):
    return create_shipment_db(db=db, shipment=shipment)

@router.get("/get/{shipment_id}", response_model=ShipmentResponse)
def read_shipment(shipment_id: int, db: Session = Depends(get_db)):
    db_shipment = get_shipment_db(db, shipment_id=shipment_id)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment

@router.patch("/update/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(shipment_id: int, shipment: ShipmentUpdate, db: Session = Depends(get_db)):
    db_shipment = update_shipment_db(db=db, shipment_id=shipment_id, shipment=shipment)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment

@router.get("/getbyorder/{order_id}", response_model=ShipmentResponse)
def read_shipment_by_order_id(order_id: int, db: Session = Depends(get_db)):
    db_shipment = get_shipment_by_order_id_db(db, order_id=order_id)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment

@router.get("/getbyuser/{user_id}", response_model=list[ShipmentResponse])
def read_shipment_by_user_id(user_id: str, db: Session = Depends(get_db)):
    db_shipment = get_shipment_by_user_id_db(db, user_id=user_id)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment

@router.get("/getall", response_model=list[ShipmentResponse])
def read_all_shipments(db: Session = Depends(get_db)):
    return get_all_shipments_db(db)

@router.get("/count")
def count_shipments(db: Session = Depends(get_db)):
    return {"total": count_shipments_db(db)}

@router.get("/get")
def get_shipments(db: Session = Depends(get_db), limit: int = 10, offset: int = 0, status: str = None, search: int = None):
    shipments = get_all_shipments_db_paginated(SessionLocal(), limit=limit, offset=offset, status=status, search=search)
    total = get_shipments_count(db, status=status)

    return {
        "total": total,
        "shipments": shipments
    }