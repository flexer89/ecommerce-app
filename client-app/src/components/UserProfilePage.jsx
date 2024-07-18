import React, { useEffect, useState } from 'react';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';
import axios from 'axios';
import ProductServiceClient from '../clients/productsService';

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personalInfo');

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <Orders />;
      case 'personalInfo':
        return <PersonalInfo />;
      case 'shipments':
        return <Shipments />;
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-page container">
      <h1>Profil użytkownika</h1>
      <div className="tabs">
        <button className={`tab ${activeTab === 'personalInfo' ? 'active' : ''}`} onClick={() => setActiveTab('personalInfo')}>Dane użytkownika</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Zamówienia</button>
        <button className={`tab ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>Wysyłki</button>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://jolszak.test/api/orders/getbyuser/67891d0d-101a-42ea-897a-6ece743074ee');
        setOrders(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>Błąd podczas ładowania: {error.message}</div>;
  }

  return (
    <div>
      <h2>Twoje zamówienia</h2>
      {orders.length === 0 ? (
        <p>Nie masz żadnych zamówień.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order">
              <h3>Zamówienie #{order.id}</h3>
              <p><strong>Data utworzenia:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Łączna cena:</strong> {order.total_price} zł</p>
              <p><strong>Status:</strong> {order.status}</p>
              <h4>Przedmioty:</h4>
              <ul>
                {order.items.map(item => (
                  <li key={item.id}>
                    <p><strong>ID produktu:</strong> {item.product_id}</p>
                    <p><strong>Ilość:</strong> {item.quantity}</p>
                    <p><strong>Cena jednostkowa:</strong> {item.price} zł</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PersonalInfo = () => {
  const { isInitialized } = useKeycloakAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    const keycloak = getKeycloak();
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/userinfo`, {
          headers: {
            'Authorization': `Bearer ${keycloak.token}`,
          },
        });
        console.log('response:', response);
        console.log(keycloak.token);
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        console.log('data:', data);
        setUserInfo(data);
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

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const response = await ProductServiceClient.get('/k8s');
      console.log('Response from /k8s endpoint:', response.data);
      // Handle the response as needed
    } catch (error) {
      console.error('Error making request to /k8s endpoint:', error);
      // Handle the error as needed
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div>
      <h2>Dane użytkownika</h2>
      {userInfo ? (
        <div>
          <p><strong>Email:</strong> {formValues.email}</p>
          {isEditing ? (
            <div>
              <p>
                <strong>Imię:</strong>
                <input
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Nazwisko:</strong>
                <input
                  type="text"
                  name="surname"
                  value={formValues.surname}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Numer Telefonu:</strong>
                <input
                  type="text"
                  name="phone_number"
                  value={formValues.phone_number}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Ulica:</strong>
                <input
                  type="text"
                  name="street"
                  value={formValues.street}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Miasto:</strong>
                <input
                  type="text"
                  name="city"
                  value={formValues.city}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Kod pocztowy:</strong>
                <input
                  type="text"
                  name="post_code"
                  value={formValues.post_code}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <p>
                <strong>Województwo:</strong>
                <input
                  type="text"
                  name="voivodeship"
                  value={formValues.voivodeship}
                  onChange={handleInputChange}
                  className="editable-input"
                />
              </p>
              <button class="contact-us-button" onClick={handleSave}>Zapisz</button>
            </div>
          ) : (
            <div>
              <p><strong>Imię:</strong> {formValues.name}</p>
              <p><strong>Nazwisko:</strong> {formValues.surname}</p>
              <p><strong>Numer Telefonu:</strong> {formValues.phone_number}</p>
              <p><strong>Ulica:</strong> {formValues.street}</p>
              <p><strong>Miasto:</strong> {formValues.city}</p>
              <p><strong>Kod pocztowy:</strong> {formValues.post_code}</p>
              <p><strong>Województwo:</strong> {formValues.voivodeship}</p>
              <button class="contact-us-button" onClick={toggleEditMode}>Edytuj</button>
            </div>
          )}
        </div>
      ) : (
        <p>Ładowanie danych użytkownika</p>
      )}
    </div>
  );
};

const Shipments = () => (
  <div>
    <h2>Wysyłki</h2>
    <p>Informacje o wysyłkach będą dostępne tutaj.</p>
  </div>
);

export default UserProfilePage;
