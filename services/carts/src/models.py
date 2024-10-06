from typing import List

from pydantic import BaseModel


class CartItemSchema(BaseModel):
    id: int
    name: str
    price: float
    discount: float
    grind: str
    weight: float
    quantity: int


class CartSchema(BaseModel):
    items: List[CartItemSchema]
    total: float
    quantity: int


class CartItems(BaseModel):
    items: List[CartItemSchema]


class RemoveItemRequest(BaseModel):
    product_id: int
    quantity: int
    grind: str
    weight: float


class ErrorResponse(BaseModel):
    message: str


class StatusResponse(BaseModel):
    status: str
