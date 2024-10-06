import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';
import UserServiceClient from '../clients/UsersService';
import OrderServiceClient from '../clients/OrdersService';
import ShipmentServiceClient from '../clients/ShipmentsService';
import ProductServiceClient from '../clients/ProductsService';
import { useCart } from '../contexts/CartContext';

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
  const { cart } = useCart();
  const [paczkomatPoint, setPaczkomatPoint] = useState(null)

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

  useEffect(() => {
    const scriptId = 'easypack-script';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://geowidget.easypack24.net/js/sdk-for-javascript.js';
      script.id = scriptId;
      script.async = true;
      script.onload = () => {
        if (window.easyPackAsyncInit) {
          window.easyPackAsyncInit();
        }
      };
      document.body.appendChild(script);
    } else if (window.easyPack) {
      window.easyPackAsyncInit();
    }
  
    window.easyPackAsyncInit = () => {
      try {
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
      } catch (error) {
        console.error('Error initializing EasyPack:', error);
      }
    };
  }, []);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleShippingChange = (e) => {
    setSelectedShipping(e.target.value);

    if (e.target.value === 'paczkomat' && window.easyPack) {
      window.easyPack.mapWidget('easypack-map', function (point) {
        console.log('Selected point:', point);
        setPaczkomatPoint(point); // Store the selected paczkomat point
      });
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Determine the shipment company and address based on selected shipping
    let shipmentCompany = 'brak';
    let shipmentAddress = `${formValues.Address}, ${formValues.City} ${formValues.PostCode}`;

    if (selectedShipping === 'kurier') {
      shipmentCompany = 'kurier';
    } else if (selectedShipping === 'paczkomat') {
      shipmentCompany = 'paczkomat';
      if (paczkomatPoint) {
        shipmentAddress = `${paczkomatPoint.address.line1}, ${paczkomatPoint.address.line2}`;
      } else {
        alert('Please select a Paczkomat point.');
        return;
      }
    } else if (selectedShipping === 'odbior_osobisty') {
      shipmentCompany = 'odbior_osobisty';
    }
    

    try {
      const orderItems = cart.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
        grind: item.grind,
      }));

      const orderResponse = await OrderServiceClient.post('/create', {
        user_id: getKeycloak().subject,
        items: orderItems,
        total_price: cart.total,
      });
      if (orderResponse.status !== 201) {
        throw new Error('Failed to create order');
      }
      
      const orderId = orderResponse.data.order_id;

      // Step 3: Create a shipping entry
      const shippingResponse = await ShipmentServiceClient.post('/create', {
        order_id: orderId,
        user_id: getKeycloak().subject,
        shipment_address: shipmentAddress,
        company: shipmentCompany

      });

      if (shippingResponse.status !== 201) {
        throw new Error('Failed to create shipping entry');
      }

      // Step 4: Redirect to the payment page
      navigate('/payment', { state: { orderId: orderId, fromCheckout: true } });
    } catch (error) {
      console.error('Error during checkout process:', error);
      alert('An error occurred during the checkout process. Please try again.');
    }
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
              Kurier - 9.99 zł (Dostawa w ciągu 2-3 dni roboczych)
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
              Paczkomat - 9.99 zł (Dostawa w ciągu 2-3 dni roboczych)
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
