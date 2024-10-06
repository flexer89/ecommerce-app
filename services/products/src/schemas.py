from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: Optional[int] = 0
    discount: Optional[float] = 0
    category: Optional[str] = "uncategorized"


class ProductCreate(ProductBase):
    image: Optional[bytes]


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: Optional[int]
    created_at: datetime
    updated_at: datetime
    discount: Optional[float]
    category: Optional[str]


class ProductUpdate(ProductBase):
    pass


class Product(ProductBase):
    id: int


class ProductsListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    total_max_price: float


class UpdateQuantityItem(BaseModel):
    product_id: int
    quantity: int


class UpdateQuantityRequest(BaseModel):
    items: List[UpdateQuantityItem]


class ErrorResponse(BaseModel):
    detail: str
