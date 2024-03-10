from fastapi import HTTPException as BaseHTTPException
from fastapi import status
from typing import Literal, Optional


class HTTPException(BaseHTTPException):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(status_code, message)


class ProductNotFound(HTTPException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(status.HTTP_404_NOT_FOUND, f"Product not found. {details}")


class ProductsNotFound(HTTPException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(status.HTTP_404_NOT_FOUND, f"Products not found. {details}")


class ProductNotModified(HTTPException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(
            status.HTTP_404_NOT_FOUND, f"Product not found or not modified. {details}"
        )


class ProductExists(HTTPException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(
            status.HTTP_400_BAD_REQUEST,
            f"Product with this name already exists. {details}",
        )


class DatabaseConnectionError(HTTPException):
    def __init__(
        self,
    ) -> None:
        super().__init__(
            status.HTTP_503_SERVICE_UNAVAILABLE, f"Database connection error."
        )


class SomethingWentWrong(HTTPException):
    def __init__(self, message: str) :
        super().__init__(status.HTTP_500_INTERNAL_SERVER_ERROR, message)
