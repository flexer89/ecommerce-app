from pydantic import BaseModel
from typing import Optional
import base64

class ProductBase(BaseModel):
    name: str
    description: Optional[str]
    price: float

class ProductCreate(ProductBase):
    image: Optional[bytes]

class ProductUpdate(ProductBase):
    image: Optional[bytes]

class Product(ProductBase):
    id: int
