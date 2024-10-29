from pydantic import BaseModel, Field


class CreatePaymentIntentRequest(BaseModel):
    order_id: int
    total: float = Field(..., gt=0, description="Total amount of the order")
    user_id: str = Field(
        ..., min_length=36, max_length=36, description="The user ID, a UUID."
    )


class PaymentIntentResponse(BaseModel):
    payment_id: str
    client_secret: str


class ErrorResponse(BaseModel):
    detail: str


class CancelPaymentResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    detail: str
