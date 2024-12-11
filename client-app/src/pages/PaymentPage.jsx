import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from '../contexts/CartContext';

export default function PaymentPage({ clientSecret }) {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { deleteCart } = useCart();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location.state || !location.state.fromCheckout) {
      navigate("/forbidden");
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    deleteCart();

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://jolszak.test/order-confirmation?orderId=" + location.state.orderId,
        },
      });

      if (error) {
        setMessage(error.message);
      } else if (paymentIntent.status === "succeeded") {
        setMessage("Payment succeeded!");
        clearCart();
      } else {
        setMessage("Payment processing or other status.");
      }
    } catch (error) {
      setMessage("An error occurred while confirming the payment.");
      console.error("Error confirming payment:", error);
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <div className="payment-container">
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        <button
          className="our-mission-button"
          disabled={isLoading || !stripe || !elements}
          id="submit"
        >
          <span id="button-text">
            {isLoading ? <div className="spinner" id="spinner"></div> : "Zapłać teraz"}
          </span>
        </button>
        {message && <div id="payment-message">{message}</div>}
      </form>
    </div>
  );
}
