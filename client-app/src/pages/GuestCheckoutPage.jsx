// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';

const CheckoutPage = () => {
  const { isInitialized } = useKeycloakAuth();
  const [formValues, setFormValues] = useState({
    email: '',
    name: '',
    phone_number: '',
    street: '',
    city: '',
    post_code: '',
    voivodeship: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSave = async () => {
    // Add your save logic here
    console.log('Saved data:', formValues);
  };

  return (
    <div className="checkout-page">
      <div className='container'>
        <h1>Checkout</h1>
        <form onSubmit={handleSave}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Phone Number:</label>
            <input
              type="text"
              name="phone_number"
              value={formValues.phone_number}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Street:</label>
            <input
              type="text"
              name="street"
              value={formValues.street}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>City:</label>
            <input
              type="text"
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Post Code:</label>
            <input
              type="text"
              name="post_code"
              value={formValues.post_code}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Voivodeship:</label>
            <input
              type="text"
              name="voivodeship"
              value={formValues.voivodeship}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Save and Continue</button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
