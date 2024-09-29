from pydantic import BaseModel, condecimal, validator
from typing import List

class CartItemSchema(BaseModel):
    id: int
    name: str
    price: float
    discount: float
    category: str
    grind: str
    weight: str
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
    weight: str
