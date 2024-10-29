from dataclasses import dataclass
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from src.app import app
from stripe.error import StripeError

valid_request_data = {
    "order_id": 123,
    "total": 150.50,
    "user_id": "fecf2079-99d2-4fb2-bcb7-2ee6be3ecc1b",
}

invalid_request_data = {
    "order_id": 123,
    "total": -10.00,
    "user_id": "fecf2079-99d2-4fb2-bcb7-2ee6be3ecc1b",
}


@pytest.mark.asyncio
async def test_create_payment_intent_success():
    """Test successful creation of a payment intent"""

    @dataclass
    class MockPaymentIntent:
        id: str
        client_secret: str

    mock_intent_response = MockPaymentIntent(
        id="pi_test_intent_id", client_secret="test_client_secret"
    )

    with patch("stripe.PaymentIntent.create", return_value=mock_intent_response):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/create-payment-intent", json=valid_request_data
            )

    assert response.status_code == 200
    response_data = response.json()

    assert response_data["payment_id"] == "pi_test_intent_id"
    assert response_data["client_secret"] == "test_client_secret"


@pytest.mark.asyncio
async def test_create_payment_intent_invalid_total():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/create-payment-intent", json=invalid_request_data
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_payment_intent_invalid_request():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/create-payment-intent", json={})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_payment_intent_stripe_error():
    """Test Stripe error during payment intent creation"""

    with patch(
        "stripe.PaymentIntent.create", side_effect=StripeError("Stripe error occurred")
    ):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/create-payment-intent", json=valid_request_data
            )

    assert response.status_code == 500
    assert "Stripe error" in response.json()["detail"]
