import os
from datetime import datetime

from sqlalchemy import BLOB, TIMESTAMP, Column, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import BYTEA
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    image = Column(BLOB) if os.getenv("ENV") == "test" else Column(BYTEA)
    stock = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow)
    discount = Column(Float, default=0)
    category = Column(String(255), default="uncategorized")
