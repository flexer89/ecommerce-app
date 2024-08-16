from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ShipmentStatusEnum(str, Enum):
    pending = 'pending'
    shipped = 'shipped'
    delivered = 'delivered'

# Schema for creating a shipment
class ShipmentCreate(BaseModel):
    order_id: int
    user_id: str
    shipment_address: str
    status: Optional[ShipmentStatusEnum] = ShipmentStatusEnum.pending
    company: str

# Schema for updating a shipment
class ShipmentUpdate(BaseModel):
    shipment_address: Optional[str] = None
    status: Optional[ShipmentStatusEnum] = None
    delivery_date: Optional[datetime] = None

# Schema for retrieving a shipment
class ShipmentResponse(BaseModel):
    id: int
    order_id: int
    user_id: str
    shipment_address: str
    shipment_date: datetime
    delivery_date: datetime
    status: ShipmentStatusEnum
    company: str
