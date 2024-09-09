import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import '../assets/style/style.css';

const LoginOrRegisterPage = () => {
  const { redirectToCheckout } = useKeycloakAuth();
  const navigate = useNavigate();

  const handleLoginOrRegister = () => {
    redirectToCheckout();
  };

  const handleContinueAsGuest = () => {
    navigate('/guest-checkout');
  };

  return (
    <div className="login-register-page">
      <div className='container'>
        <h1>Kontynuuj zakupy</h1>
        <div className='login-register-buttons'>
          <button class="our-mission-button" onClick={handleLoginOrRegister}>Zaloguj lub Zarejestruj się</button>
          <button class="contact-us-button" onClick={handleContinueAsGuest}>Kontynuuj jako gość</button>
        </div>
      </div>
    </div>
  );
};

export default LoginOrRegisterPage;
