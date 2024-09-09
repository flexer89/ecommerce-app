from fastapi import APIRouter, HTTPException
import os
import stripe
from pydantic import BaseModel
from typing import List
from logging import Logger

logger = Logger(__name__)
stripe.api_key = "sk_test_51PdvfxHm9ZvcVN2EHa7Ulxugn22qjBP5i0ajZeVXISn4Bf4LQaZEpvFIvM2yIeQ8f8MylsSWQEJaSJvXXi91LzEF00gSm3rlCL"
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
    return 9900

@router.post("/create-payment-intent")
async def create_payment(payment_request: PaymentRequest):
    try:
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
    payment_intent = stripe.PaymentIntent.confirm(
        request.clientSecret,
        payment_method=request.payment_method.id
    )

