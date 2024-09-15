from pydantic import BaseModel
from typing import List
from datetime import datetime
from enum import Enum

class StatusEnum(str, Enum):
    pending = 'pending'
    processing = 'processing'
    shipped = 'shipped'
    delivered = 'delivered'
    cancelled = 'cancelled'
    on_hold = 'on_hold'

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float
    weight: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    user_id: str
    total_price: float
    status: StatusEnum

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdateStatus(BaseModel):
    status: StatusEnum

class Order(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True
        
class OrderTrendResponse(BaseModel):
    month: str
    total_orders: int
    total_revenue: float

class OrderTrendResponse(BaseModel):
    month: str
    total_orders: int
    total_revenue: float

class OrderStatusCountResponse(BaseModel):
    status: str
    order_count: int