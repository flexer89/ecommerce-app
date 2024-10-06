from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class ShipmentStatusEnum(str, Enum):
    pending = "pending"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class ShipmentCreate(BaseModel):
    order_id: int
    user_id: str
    shipment_address: str
    current_location: str = "Warszawska 24, Kraków, małopolskie, 31-155"
    status: Optional[ShipmentStatusEnum] = ShipmentStatusEnum.pending
    company: str


class ShipmentUpdate(BaseModel):
    shipment_address: Optional[str] = None
    current_location: Optional[str] = None
    status: Optional[ShipmentStatusEnum] = None
    delivery_date: Optional[datetime] = None


class ShipmentResponse(BaseModel):
    id: int
    order_id: int
    user_id: str
    shipment_address: str
    current_location: str
    shipment_date: datetime
    delivery_date: datetime
    status: ShipmentStatusEnum
    company: str


class GetShipmentResponse(BaseModel):
    total: int
    shipments: list[ShipmentResponse]


class ErrorResponse(BaseModel):
    detail: str


class CountResponse(BaseModel):
    total: int
