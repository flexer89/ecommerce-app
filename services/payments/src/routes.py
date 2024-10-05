from fastapi import APIRouter, HTTPException
import stripe
from .schemas import CreatePaymentIntentRequest, PaymentIntentResponse, CancelPaymentResponse, ErrorResponse
from logging import Logger

logger = Logger(__name__)
stripe.api_key = "sk_test_51PdvfxHm9ZvcVN2EHa7Ulxugn22qjBP5i0ajZeVXISn4Bf4LQaZEpvFIvM2yIeQ8f8MylsSWQEJaSJvXXi91LzEF00gSm3rlCL"
router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post(
    "/create-payment-intent",
    response_model=PaymentIntentResponse,
    summary="Create Payment Intent",
    description=(
        "Creates a payment intent for the specified order. The payment intent is used to process payments using Stripe. "
        "The total amount must be a positive float, and the order ID and user ID must be valid."
    ),
    responses={
        200: {"description": "Payment intent created successfully.", "model": PaymentIntentResponse},
        400: {"description": "Bad request - Invalid data or amount.", "model": ErrorResponse},
    }
)
async def create_payment_intent(request: CreatePaymentIntentRequest):
    if request.total <= 0:
        raise HTTPException(status_code=400, detail="Total amount must be greater than 0.")
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(request.total * 100),
            currency="pln",
            automatic_payment_methods={"enabled": True},
            metadata={
                "order_id": request.order_id,
                "user_id": request.user_id
            }
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    return {
        "payment_id": intent.id,
        "client_secret": intent.client_secret
    }


@router.post(
    "/cancel-payment",
    response_model=CancelPaymentResponse,
    summary="Cancel a Payment",
    description=(
        "Cancels an existing payment intent identified by the `payment_id`. "
        "This action will attempt to cancel the payment intent in Stripe. "
        "A successful response will return 'ok', while errors may arise if the payment is invalid or cannot be canceled."
    ),
    responses={
        200: {"description": "Payment cancelled successfully.", "model": CancelPaymentResponse},
        403: {"description": "Forbidden - Payment cancellation failed.", "model": ErrorResponse},
        500: {"description": "Internal server error.", "model": ErrorResponse}
    }
)
async def cancel_payment(payment_id: str):
    try:
        intent = stripe.PaymentIntent.cancel(payment_id)
        return {"status": "ok"}

    except stripe.error.InvalidRequestError as e:
        raise HTTPException(status_code=403, detail=f"Stripe error: {str(e)}")
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

