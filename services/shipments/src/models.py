from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class ShipmentStatusEnum(str, enum.Enum):
    pending = 'pending'
    shipped = 'shipped'
    delivered = 'delivered'
    cancelled = 'cancelled'

class Shipment(Base):
    __tablename__ = 'shipments'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False)
    user_id = Column(String, nullable=False)
    shipment_address = Column(String, nullable=False)
    shipment_date = Column(TIMESTAMP, default=datetime.utcnow)
    delivery_date = Column(TIMESTAMP, default=datetime.utcnow)
    status = Column(Enum(ShipmentStatusEnum), default=ShipmentStatusEnum.pending)
    company = Column(String, nullable=False)
