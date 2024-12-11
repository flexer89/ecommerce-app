import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/style/style.css';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderId, setOrderId] = useState(null);

  // Extract the orderId from the query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderIdFromQuery = queryParams.get('orderId');
    setOrderId(orderIdFromQuery);
  }, [location]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="confirmation-page">
      <div className='container not-found-page'>
        <h1>Potwierdzenie zamówienia</h1>
        <p>Dziękujemy za zakup! Zamówienie zostało złożone pomyślnie.</p>
        {orderId && <p>Twój numer zamówienia: <strong>{orderId}</strong></p>}
        <button onClick={handleContinueShopping}>Kontynuuj Zakupy</button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
