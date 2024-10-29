from typing import Literal, Optional

from fastapi import HTTPException as BaseHTTPException
from fastapi import status


class HTTPException(BaseHTTPException):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(status_code, message)


class ProductNotFound(HTTPException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(status.HTTP_404_NOT_FOUND, f"Product not found. {details}")


class InvalidQuantityError(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status.HTTP_400_BAD_REQUEST, f"Quantity must be greater than 0"
        )


class CartNotFound(HTTPException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(status.HTTP_404_NOT_FOUND, f"Cart not found. {details}")
