from logging import INFO, Logger, basicConfig

import stripe
from fastapi import APIRouter, HTTPException

from .schemas import (
    CancelPaymentResponse,
    CreatePaymentIntentRequest,
    ErrorResponse,
    PaymentIntentResponse,
)

# Set up logging configuration
basicConfig(
    level=INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = Logger(__name__)

stripe.api_key = "sk_test_51PdvfxHm9ZvcVN2EHa7Ulxugn22qjBP5i0ajZeVXISn4Bf4LQaZEpvFIvM2yIeQ8f8MylsSWQEJaSJvXXi91LzEF00gSm3rlCL"
router = APIRouter()


@router.get("/health")
def health():
    logger.info("Health check requested")
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
        200: {
            "description": "Payment intent created successfully.",
            "model": PaymentIntentResponse,
        },
        400: {
            "description": "Bad request - Invalid data or amount.",
            "model": ErrorResponse,
        },
    },
)
async def create_payment_intent(request: CreatePaymentIntentRequest):
    logger.info(
        f"Received request to create payment intent for order {request.order_id} with total amount {request.total}"
    )

    if request.total <= 0:
        logger.warning(
            f"Invalid total amount: {request.total}. Must be greater than 0."
        )
        raise HTTPException(
            status_code=400, detail="Total amount must be greater than 0."
        )

    try:
        intent = stripe.PaymentIntent.create(
            amount=int(request.total * 100),  # Convert to cents
            currency="pln",
            automatic_payment_methods={"enabled": True},
            metadata={
                "order_id": request.order_id,
                "user_id": request.user_id,
            },
        )
        logger.info(
            f"Payment intent created successfully for order {request.order_id} with payment ID {intent.id}"
        )
    except stripe.error.StripeError as e:
        logger.error(
            f"Stripe error occurred while creating payment intent: {e}"
        )
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

    return {"payment_id": intent.id, "client_secret": intent.client_secret}


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
        200: {
            "description": "Payment cancelled successfully.",
            "model": CancelPaymentResponse,
        },
        403: {
            "description": "Forbidden - Payment cancellation failed.",
            "model": ErrorResponse,
        },
        500: {"description": "Internal server error.", "model": ErrorResponse},
    },
)
async def cancel_payment(payment_id: str):
    logger.info(f"Received request to cancel payment with ID {payment_id}")

    try:
        intent = stripe.PaymentIntent.cancel(payment_id)
        logger.info(f"Payment with ID {payment_id} cancelled successfully")
        return {"status": "ok"}

    except stripe.error.InvalidRequestError as e:
        logger.warning(f"Failed to cancel payment {payment_id}: {e}")
        raise HTTPException(status_code=403, detail=f"Stripe error: {str(e)}")

    except stripe.error.StripeError as e:
        logger.error(
            f"Stripe error occurred while canceling payment {payment_id}: {e}"
        )
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
