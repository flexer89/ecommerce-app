# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from src.models import Order, OrderItem, StatusEnum

SQLALCHEMY_DATABASE_URL = "postgresql://orders:password@orders-db/orders"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_orders_db(db: Session, limit: int = 10):
    if limit > 0:
        return db.query(Order).limit(limit).all()
    return db.query(Order).all()

def get_order_db(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()

def create_order_db(db: Session, user_id: str, total_price: float, items: list):
    order = Order(user_id=user_id, total_price=total_price, status=StatusEnum.pending)
    db.add(order)
    db.commit()
    db.refresh(order)
    for item in items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)
    db.commit()
    return order

def update_order_status_db(db: Session, order_id: int, status: StatusEnum):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        order.status = status
        db.commit()
        db.refresh(order)
    return order

def get_orders_by_user_id_db(db: Session, user_id: str, limit: int = 0):
    if limit > 0:
        return db.query(Order).filter(Order.user_id == user_id).limit(limit).all()
    return db.query(Order).filter(Order.user_id == user_id).all()