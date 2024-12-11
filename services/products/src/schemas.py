from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The name of the product, between 1 and 100 characters.",
    )
    description: Optional[str] = Field(
        None,
        max_length=255,
        description="The description of the product, up to 255 characters.",
    )
    price: float = Field(
        ..., gt=0, description="The price of the product, must be greater than 0."
    )
    stock: Optional[int] = Field(
        None,
        ge=0,
        description="The stock of the product, must be greater than or equal to 0.",
    )
    discount: Optional[float] = Field(
        None, ge=0, le=1, description="The discount percentage, between 0 and 1."
    )
    category: Optional[str] = "uncategorized"


class ProductCreate(ProductBase):
    image: Optional[bytes]


class ProductResponse(BaseModel):
    id: int
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The name of the product, between 1 and 100 characters.",
    )
    description: Optional[str] = Field(
        None,
        max_length=255,
        description="The description of the product, up to 255 characters.",
    )
    price: float = Field(
        ..., gt=0, description="The price of the product, must be greater than 0."
    )
    stock: Optional[int] = Field(
        None,
        ge=0,
        description="The stock of the product, must be greater than or equal to 0.",
    )
    created_at: datetime
    updated_at: datetime
    discount: Optional[float] = Field(
        None, ge=0, le=1, description="The discount percentage, between 0 and 1."
    )
    category: Optional[str]


class ProductUpdate(ProductBase):
    pass


class Product(ProductBase):
    id: int


class ProductsListResponse(BaseModel):
    products: List[ProductResponse]
    total: int = Field(
        ...,
        ge=0,
        description="The total number of products, must be greater than or equal to 0.",
    )
    total_max_price: float = Field(
        ...,
        ge=0,
        description="The total maximum price of the products, must be greater than or equal to 0.",
    )


class UpdateQuantityItem(BaseModel):
    product_id: int
    quantity: int = Field(..., description="The quantity of the product.")


class UpdateQuantityRequest(BaseModel):
    items: List[UpdateQuantityItem]


class ErrorResponse(BaseModel):
    detail: str
