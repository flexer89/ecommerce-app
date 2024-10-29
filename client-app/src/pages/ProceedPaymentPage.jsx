import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import PaymentPage from "./PaymentPage";
import Header from "../components/Header";
import Footer from "../components/Footer";
import getKeycloak from "../auth/keycloak";
import { useCart } from '../contexts/CartContext';
import PaymentsServiceClient from '../clients/PaymentsService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API_KEY);

const ProceedPaymentPage = () => {
  const location = useLocation();
  const [paymentId, setPaymentId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const keycloak = getKeycloak();
  const { cart } = useCart();

  useEffect(() => {
    const fetchCartAndCreatePaymentIntent = async () => {
      try {
        const paymentIntentResponse = await PaymentsServiceClient.post("/create-payment-intent", {
          user_id: keycloak.subject,
          order_id: location.state.orderId,
          total: cart.total > 200 ? cart.total : cart.total + 9.99,
        });

        const paymentData = paymentIntentResponse.data;
        setPaymentId(paymentData.payment_id);
        setClientSecret(paymentData.client_secret);
      } catch (error) {
        console.error("Error during payment intent creation:", error);
      }
    };

    // Trigger the function
    fetchCartAndCreatePaymentIntent();
  }, [keycloak.subject]);

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    clientSecret && (
      <Elements options={options} stripe={stripePromise}>
        <div>
          <Header />
          <PaymentPage paymentId={paymentId} /> {/* Pass paymentId as a prop */}
          <Footer />
        </div>
      </Elements>
    )
  );
};

export default ProceedPaymentPage;
