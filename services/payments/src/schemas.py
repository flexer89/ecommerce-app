from pydantic import BaseModel


class CreatePaymentIntentRequest(BaseModel):
    order_id: int
    total: float
    user_id: str


class PaymentIntentResponse(BaseModel):
    payment_id: str
    client_secret: str


class ErrorResponse(BaseModel):
    detail: str


class CancelPaymentResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    detail: str
