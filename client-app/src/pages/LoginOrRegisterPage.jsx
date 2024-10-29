import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import '../assets/style/style.css';

const LoginOrRegisterPage = () => {
  const { redirectToCheckout } = useKeycloakAuth();

  const handleLoginOrRegister = () => {
    redirectToCheckout();
  };

  return (
    <div className="login-register-page">
      <div className='container'>
        <h1>Kontynuuj zakupy</h1>
        <div className='login-register-buttons'>
          <button class="our-mission-button" onClick={handleLoginOrRegister}>Zaloguj lub Zarejestruj się</button>
        </div>
      </div>
    </div>
  );
};

export default LoginOrRegisterPage;
