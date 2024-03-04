from pydantic import BaseModel
from typing import List, Optional


class Product(BaseModel):
    name: str
    price: float = 0.0
    quantity: int = 0
    description: str = ""
    category: str = "uncategorized"
    brand: str = "default"
    images: List[str] = []
    weight: float = 0.0
    dimensions: List[float] = [0.0, 0.0, 0.0]

class ProductOptional(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    images: Optional[List[str]] = None
    weight: Optional[float] = None    
    dimensions: Optional[List[float]] = None
