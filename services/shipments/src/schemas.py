from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ShipmentStatusEnum(str, Enum):
    pending = "pending"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class ShipmentCreate(BaseModel):
    order_id: int = Field(
        ..., gt=0, description="The order ID, must be greater than 0."
    )
    user_id: str = Field(
        ..., min_length=36, max_length=36, description="The user ID, a UUID."
    )
    shipment_address: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The address of the shipment, between 1 and 100 characters.",
    )
    current_location: str = "Warszawska 24, Kraków, małopolskie, 31-155"
    status: Optional[ShipmentStatusEnum] = ShipmentStatusEnum.pending
    company: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The name of the shipping company, between 1 and 100 characters.",
    )


class ShipmentUpdate(BaseModel):
    shipment_address: Optional[str] = None
    current_location: Optional[str] = None
    status: Optional[ShipmentStatusEnum] = None
    delivery_date: Optional[datetime] = None


class ShipmentResponse(BaseModel):
    id: int
    order_id: int
    user_id: str = Field(
        ..., min_length=36, max_length=36, description="The user ID, a UUID."
    )
    shipment_address: str
    current_location: str
    shipment_date: datetime
    delivery_date: datetime
    status: ShipmentStatusEnum
    company: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The name of the shipping company, between 1 and 100 characters.",
    )


class GetShipmentResponse(BaseModel):
    total: int
    shipments: list[ShipmentResponse]


class ErrorResponse(BaseModel):
    detail: str


class CountResponse(BaseModel):
    total: int
