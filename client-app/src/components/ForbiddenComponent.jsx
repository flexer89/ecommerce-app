// ForbiddenComponent.js
import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenComponent = () => {
  return (
    <div className="forbidden-page">
      <h1>403 - Dostęp zabroniony</h1>
      <p>Nie masz uprawnień, aby uzyskać dostęp do tej strony.</p>
      <p>Ukończ wcześniej kroki zamówienia.</p>
        <div className='button-container'>
            <Link to="/" className="our-mission-button">
                Wróć do strony głównej
            </Link>
        </div>
    </div>
  );
};

export default ForbiddenComponent;
