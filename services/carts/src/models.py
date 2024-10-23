from typing import List

from pydantic import BaseModel, Field


class CartItemSchema(BaseModel):
    id: int
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The name of the product, between 1 and 100 characters.",
    )
    price: float = Field(
        ..., gt=0, description="The price of the product, must be greater than 0."
    )
    discount: float = Field(
        0, ge=0, le=1, description="The discount percentage, between 0 and 1."
    )
    weight: float = Field(
        ..., gt=0, description="The weight of the product, must be greater than 0."
    )
    quantity: int = Field(
        ..., ge=1, description="The quantity of the product, must be at least 1."
    )


class CartSchema(BaseModel):
    items: List[CartItemSchema]
    total: float = Field(
        ...,
        ge=0,
        description="The total price of the cart, must be greater than or equal to 0.",
    )
    quantity: int = Field(
        ...,
        ge=0,
        description="The total quantity of the cart, must be greater than or equal to 0.",
    )


class CartItems(BaseModel):
    items: List[CartItemSchema]


class RemoveItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(
        ...,
        ge=1,
        description="The quantity of the product to remove, must be at least 1.",
    )
    weight: float = Field(
        ...,
        gt=0,
        description="The weight of the product to remove, must be greater than 0.",
    )


class ErrorResponse(BaseModel):
    message: str


class StatusResponse(BaseModel):
    status: str
