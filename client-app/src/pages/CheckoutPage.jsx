import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';
import UserServiceClient from '../clients/UsersService';

const CheckoutPage = () => {
  const { isInitialized } = useKeycloakAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: '',
    name: '',
    surname: '',
    phoneNumber: '',
    Address: '',
    City: '',
    PostCode: '',
    voivodeship: ''
  });
  const [selectedShipping, setSelectedShipping] = useState('');

  // Load user info
  useEffect(() => {
    const keycloak = getKeycloak();
    const fetchUserInfo = async () => {
      try {
        const response = await UserServiceClient.get(`/get/${keycloak.subject}`, {
          headers: {
            'Authorization': `Bearer ${keycloak.token}`,
          },
        });
        const data = response.data.users[0];
        setFormValues({
          email: data.email,
          name: data.firstName,
          surname: data.lastName,
          phoneNumber: data.attributes.phoneNumber,
          Address: data.attributes.Address,
          City: data.attributes.City,
          PostCode: data.attributes.PostCode,
          voivodeship: data.attributes.voivodeship,
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (isInitialized) {
      fetchUserInfo();
    }
  }, [isInitialized]);

  // Load the Easypack script only once
  useEffect(() => {
    if (!document.querySelector('#easypack-script')) {
      const script = document.createElement('script');
      script.src = 'https://geowidget.easypack24.net/js/sdk-for-javascript.js';
      script.id = 'easypack-script';
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
        };
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleShippingChange = (e) => {
    setSelectedShipping(e.target.value);

    // Display the Easypack map widget only when "Paczkomat" is selected
    if (e.target.value === 'paczkomat' && window.easyPack) {
      window.easyPack.mapWidget('easypack-map', function (point) {
        console.log('Selected point:', point);
      });
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
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
              value={formValues.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Ulica i numer:</label>
            <input
              type="text"
              name="street"
              value={formValues.Address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Miasto:</label>
            <input
              type="text"
              name="city"
              value={formValues.City}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Kod pocztowy:</label>
            <input
              type="text"
              name="post_code"
              value={formValues.PostCode}
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
