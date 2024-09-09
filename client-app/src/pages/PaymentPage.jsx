import React, { useEffect, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }
  }, [stripe]);

  const clearCart = () => {
    localStorage.removeItem('cart');
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "https://jolszak.test/",
      },
      redirect: 'if_required',
    });

    if (paymentError) {
      setMessage(paymentError.message);
      setIsLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      setMessage("Payment succeeded!");
      clearCart();
    } else {
      setMessage("Payment processing or other status.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs"
  };

  return (
    <div className="payment-container">
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        <button className="our-mission-button" disabled={isLoading || !stripe || !elements} id="submit">
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
          </span>
        </button>
        {message && <div id="payment-message">{message}</div>}
      </form>
    </div>
  );
}
