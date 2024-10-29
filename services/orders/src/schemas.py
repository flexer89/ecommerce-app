from datetime import datetime
from enum import Enum
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    detail: str


class CreateOrderResponse(BaseModel):
    order_id: int


class StatusEnum(str, Enum):
    pending = "pending"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    on_hold = "on_hold"


class OrderItemBase(BaseModel):
    product_id: int
    quantity: float = Field(
        ..., gt=0, description="Quantity should be greater than 0"
    )
    price: float = Field(
        ..., gt=0, description="Price should be greater than 0"
    )
    weight: float = Field(
        ..., gt=0, description="Weight should be greater than 0"
    )


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    created_at: datetime = Field(..., description="Created at datetime")

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    user_id: UUID = Field(..., description="The user ID, a UUID.")
    total_price: float = Field(
        ..., gt=0, description="Total price should be greater than 0"
    )
    status: StatusEnum = StatusEnum.pending


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdateStatus(BaseModel):
    status: StatusEnum


class Order(OrderBase):
    id: int
    created_at: datetime = Field(..., description="Created at datetime")
    updated_at: datetime = Field(..., description="Updated at datetime")
    items: List[OrderItem]

    class Config:
        from_attributes = True


class OrderTrendResponse(BaseModel):
    month: str = Field(..., description="Month of the year")
    total_orders: int = Field(..., description="Total number of orders")
    total_revenue: float = Field(..., description="Total revenue")


class OrderStatusCountResponse(BaseModel):
    status: str
    order_count: int = Field(
        ..., ge=0, description="Order amount for the status"
    )


class Bestseller(BaseModel):
    product_id: int
    order_count: int = Field(
        ..., ge=0, description="Order amount for the product"
    )


class BestsellersResponse(BaseModel):
    List[Bestseller]


class OrderItem(BaseModel):
    id: int
    quantity: int = Field(
        ..., gt=0, description="Quantity should be greater than 0"
    )
    price: float = Field(
        ..., gt=0, description="Price should be greater than 0"
    )
    weight: float = Field(
        ..., gt=0, description="Weight should be greater than 0"
    )


class CreateOrderRequest(BaseModel):
    user_id: UUID = Field(..., description="The user ID, a UUID.")
    items: List[OrderItem]
    total_price: float = Field(
        ..., gt=0, description="Total price should be greater than 0"
    )


class OrderResponse(BaseModel):
    created_at: datetime = Field(..., description="Created at datetime")
    id: int
    status: StatusEnum
    total_price: float = Field(
        ..., gt=0, description="Total price should be greater than 0"
    )
    updated_at: datetime
    user_id: UUID = Field(..., description="The user ID, a UUID.")


class GetOrdersResponse(BaseModel):
    orders: List[OrderResponse]
    total: int = Field(..., ge=0, description="Total number of orders")
