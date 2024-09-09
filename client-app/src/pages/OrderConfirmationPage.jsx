import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/style/style.css';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="confirmation-page">
      <div className='container'>
        <h1>Potwierdzenie zamówienia</h1>
        <p>Dziękujemy za zakup! Zamówienie zostało złożone pomyślnie.</p>
        <button onClick={handleContinueShopping}>Kontynuuj Zakupy</button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
