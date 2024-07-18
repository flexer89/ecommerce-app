from fastapi import APIRouter, HTTPException
import os
import stripe
from pydantic import BaseModel
from typing import List
from logging import Logger

logger = Logger(__name__)
# This is your test secret API key.
stripe.api_key = 'sk_test_51PdvfxHm9ZvcVN2EHa7Ulxugn22qjBP5i0ajZeVXISn4Bf4LQaZEpvFIvM2yIeQ8f8MylsSWQEJaSJvXXi91LzEF00gSm3rlCL'

router = APIRouter()


@router.get("/k8s")
def k8s():
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health")
def health():
    return {"status": "ok"}

class Item(BaseModel):
    id: str

class PaymentRequest(BaseModel):
    items: List[Item]

def calculate_order_amount(items):
    # Replace this constant with a calculation of the order's amount
    # Calculate the order total on the server to prevent
    # people from directly manipulating the amount on the client
    return 9900

@router.post("/create-payment-intent")
async def create_payment(payment_request: PaymentRequest):
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=calculate_order_amount(payment_request.items),
            currency='pln',
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return {"clientSecret": intent['client_secret']}
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))
    
class CardDetails(BaseModel):
    number: str
    exp_month: str
    exp_year: str
    cvc: str

class ConfirmPaymentRequest(BaseModel):
    clientSecret: str
    payment_method: CardDetails
    
    
@router.post('/confirm-cart-payment')
async def confirm_payment(request: ConfirmPaymentRequest):
    # Confirm the PaymentIntent with the created PaymentMethod
    payment_intent = stripe.PaymentIntent.confirm(
        request.clientSecret,
        payment_method=request.payment_method.id
    )

