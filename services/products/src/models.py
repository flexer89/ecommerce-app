from pydantic import BaseModel
from datetime import datetime
from typing import List

# TODO: add optional fields
class Product(BaseModel):
    name: str
    price: float
    quantity: int
    description: str = ""
    category: str = "uncategorized"
    brand: str = "default"
    images: List[str] = []
    weight: float = 0.0
    dimensions: List[float] = [0.0, 0.0, 0.0]
    