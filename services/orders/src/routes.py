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

@router.get("/get", response_model=List[Order])
def read_orders(limit: int = 0, db: Session = Depends(get_db)):
    orders = get_orders_db(db, limit=limit)
    return orders

@router.get("/getbyorder/{order_id}", response_model=Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = get_order_db(db, order_id=order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/create", response_model=Order)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = create_order_db(db, user_id=order.user_id, total_price=order.total_price, items=order.items)
    return db_order

@router.put("/update/{order_id}/status", response_model=Order)
def update_order_status(order_id: int, order_update: OrderUpdateStatus, db: Session = Depends(get_db)):
    order = update_order_status_db(db, order_id=order_id, status=order_update.status)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/getbyuser/{user_id}", response_model=list[Order])
def read_orders_by_user(user_id: str, limit: int = 10, db: Session = Depends(get_db)):
    orders = get_orders_by_user_id_db(db, user_id=user_id, limit=limit)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")
    return orders