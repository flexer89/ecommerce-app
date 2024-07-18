// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';

const CheckoutPage = () => {
  const { isInitialized, isLogin } = useKeycloakAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: '',
    name: '',
    surname: '',
    phone_number: '',
    street: '',
    city: '',
    post_code: '',
    voivodeship: ''
  });
  const [selectedShipping, setSelectedShipping] = useState('');

  useEffect(() => {
    const keycloak = getKeycloak();
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/userinfo`, {
          headers: {
            'Authorization': `Bearer ${keycloak.token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        setFormValues({
          email: data.email,
          name: data.given_name,
          surname: data.family_name,
          phone_number: data.phone_number,
          street: data.street,
          city: data.city,
          post_code: data.post_code,
          voivodeship: data.voivodeship
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (isInitialized) {
      fetchUserInfo();
    }
  }, [isInitialized]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleShippingChange = (e) => {
    console.log('Selected Shipping:', e.target.value);
    if (e.target.value === 'paczkomat') {
      // Load the Easypack map
      const script = document.createElement('script');
      script.src = 'https://geowidget.easypack24.net/js/sdk-for-javascript.js';
      script.async = true;
      script.onload = () => {
        window.easyPackAsyncInit = () => {
          window.easyPack.init({
            defaultLocale: 'pl',
            mapType: 'osm',
            searchType: 'osm',
            points: {
              types: ['parcel_locker'],
              functions: ['parcel_collect'],
            },
            map: {
              initialTypes: ['parcel_locker'],
              initialFunctions: ['parcel_collect'],
            },
          });

          window.easyPack.mapWidget('easypack-map', function(point) {
            console.log('Selected point:', point);
          });
        };
      };
      document.body.appendChild(script);
    }
    setSelectedShipping(e.target.value);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    // Save shipping choice and navigate to payment
    console.log('Selected Shipping:', selectedShipping);
    navigate('/payment');
  };

  return (
    <div className="checkout-page container">
      <h1>Podsumowanie</h1>
      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleCheckout}>
          <h2>Dane użytkownika</h2>
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
            <label>Imię:</label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Nazwisko:</label>
            <input
              type="text"
              name="surname"
              value={formValues.surname}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Numer Telefonu:</label>
            <input
              type="text"
              name="phone_number"
              value={formValues.phone_number}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Ulica i numer:</label>
            <input
              type="text"
              name="street"
              value={formValues.street}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Miasto:</label>
            <input
              type="text"
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Kod pocztowy:</label>
            <input
              type="text"
              name="post_code"
              value={formValues.post_code}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Województwo:</label>
            <input
              type="text"
              name="voivodeship"
              value={formValues.voivodeship}
              onChange={handleInputChange}
            />
          </div>
          <button className="contact-us-button" type="submit">Przejdź do płatności</button>
        </form>
        <div className="shipping-options">
          <h2>Wybierz sposób dostawy</h2>
          <div>
            <label>
              <input
                type="radio"
                name="shipping"
                value="kurier"
                checked={selectedShipping === 'kurier'}
                onChange={handleShippingChange}
              />
              Kurier
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="shipping"
                value="paczkomat"
                checked={selectedShipping === 'paczkomat'}
                onChange={handleShippingChange}
              />
              Paczkomat
            </label>
            {selectedShipping === 'paczkomat' && (
              <div id="easypack-map"></div>
            )}
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="shipping"
                value="odbior_osobisty"
                checked={selectedShipping === 'odbior_osobisty'}
                onChange={handleShippingChange}
              />
              Odbiór osobisty (Sprawdź adres poniżej)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
