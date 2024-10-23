import os
from typing import Dict

from dotenv import load_dotenv
from sqlalchemy import create_engine, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker
from src.models import Order, OrderItem, StatusEnum

load_dotenv()

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if os.getenv("ENV") == "test":
    DATABASE_URL = "sqlite:///./test.db"
else:
    DATABASE_URL = (
        f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@orders-db/{DATABASE_NAME}"
    )

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_orders_db(db: Session, limit: int = 10):
    if limit > 0:
        return db.query(Order).limit(limit).all()
    return db.query(Order).all()


def get_order_db(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()


def create_order_db(db: Session, order_data: Dict):
    try:
        order = Order(
            user_id=order_data.user_id,
            total_price=order_data.total_price,
            status="pending",
        )

        db.add(order)
        db.commit()
        db.refresh(order)

        for item in order_data.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.id,
                quantity=item.quantity,
                price=item.price,
                weight=item.weight,
            )
            db.add(order_item)
        db.commit()

        return order.id

    except SQLAlchemyError as e:
        db.rollback()
        raise RuntimeError(f"Error inserting order into database: {str(e)}")


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


def get_bestsellers_db(db: Session, limit: int):
    return (
        db.query(
            OrderItem.product_id, func.count(OrderItem.product_id).label("order_count")
        )
        .group_by(OrderItem.product_id)
        .order_by(func.count(OrderItem.product_id).desc())
        .limit(limit)
        .all()
    )


def count_db(db: Session):
    return db.query(Order).count()


def get_orders_by_user_id_db(db: Session, user_id: str, limit: int = 0):
    if limit > 0:
        return db.query(Order).filter(Order.user_id == user_id).limit(limit).all()
    return db.query(Order).filter(Order.user_id == user_id).all()


def get_orders_db(db: Session, limit: str, offset: str, status: str, search: int):
    if not status:
        if not search:
            orders = db.query(Order).limit(limit).offset(offset)
        else:
            orders = (
                db.query(Order).filter(Order.id == search).limit(limit).offset(offset)
            )
    else:
        if not search:
            orders = (
                db.query(Order)
                .filter(Order.status == status)
                .limit(limit)
                .offset(offset)
            )
        else:
            orders = (
                db.query(Order)
                .filter(Order.status == status, Order.id == search)
                .limit(limit)
                .offset(offset)
            )

    total = db.query(Order).count()

    return {
        "orders": orders.all(),
        "total": total,
    }
