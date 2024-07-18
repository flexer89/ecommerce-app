# models.py
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, Float, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class StatusEnum(PyEnum):
    pending = 'pending'
    processing = 'processing'
    shipped = 'shipped'

class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    total_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    product_id = Column(Integer)
    quantity = Column(Integer)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    order = relationship("Order", back_populates="items")