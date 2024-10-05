import React, { useEffect, useState } from 'react';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';
import OrderServiceClient from '../clients/OrdersService';
import UserServiceClient from '../clients/UsersService';
import ShipmentServiceClient from '../clients/ShipmentsService';
import OrderDetailModal from './OrderDetailModal';
import ShipmentEditModal from './ShipmentEditModal';
import ShipmentDetailModal from './ShipmentDetailModal';

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
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await OrderServiceClient.get(`/getbyuser/${getKeycloak().subject}?limit=10000`);
        
        if (response.status === 404) {
          setOrders([]);
          setError(null);
        } else if (response.status === 200) {
          setOrders(response.data);
        } else {
          throw new Error('Unexpected error occurred');
        }
      } catch (error) {
        setError('Błąd podczas ładowania zamówień.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>Błąd podczas ładowania.</div>;
  }

  return (
    <div>
      <h2>Twoje zamówienia</h2>
      {orders.length === 0 ? (
        <p>Nie masz żadnych zamówień.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order" onClick={() => handleOrderClick(order)}>
              <h3>Zamówienie #{order.id}</h3>
              <p><strong>Data utworzenia:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Łączna cena:</strong> {order.total_price.toFixed(2)} zł</p>
              <button className="our-mission-button">Szczegóły</button>
            </div>
          ))}
        </div>
      )}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={closeOrderModal} />}
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
    phoneNumber: '',
    Address: '',
    City: '',
    PostCode: '',
    voivodeship: ''
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const keycloak = getKeycloak();
        const response = await UserServiceClient.get(`/get/${keycloak.subject}`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch user info');
        }

        const data = response.data.users[0];
        setUserInfo(data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    const keycloak = getKeycloak();
    const userId = keycloak.subject;

    const updateData = {
      firstName: formValues.name,
      lastName: formValues.surname,
      email: formValues.email,
      attributes: {
        phoneNumber: formValues.phoneNumber,
        Address: formValues.Address,
        City: formValues.City,
        PostCode: formValues.PostCode,
        voivodeship: formValues.voivodeship,
      },
    };

    const response = await UserServiceClient.patch(`/update/${userId}`, updateData).catch(function (error) {   
      alert("Upewnij się, że wszystkie pola są wypełnione poprawnie.");
      return null;
    });
    if (response) {
      toggleEditMode();
      setUserInfo({ ...userInfo, ...formValues });
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
              <p><strong>Imię:</strong><input type="text" name="name" value={formValues.name} onChange={handleInputChange} className={"editable-input"} /></p>
              <p><strong>Nazwisko:</strong><input type="text" name="surname" value={formValues.surname} onChange={handleInputChange} className={"editable-input"} /></p>
              <p><strong>Numer Telefonu:</strong><input type="text" name="phoneNumber" value={formValues.phoneNumber} onChange={handleInputChange} className={"editable-input"} /></p>
              <p><strong>Ulica:</strong><input type="text" name="Address" value={formValues.Address} onChange={handleInputChange} className={"editable-input"} /></p>
              <p><strong>Miasto:</strong><input type="text" name="City" value={formValues.City} onChange={handleInputChange} className={"editable-input"} /></p>
              <p><strong>Kod pocztowy:</strong><input type="text" name="PostCode" value={formValues.PostCode} onChange={handleInputChange} className={"editable-input"} /></p>
              <p><strong>Województwo:</strong><input type="text" name="voivodeship" value={formValues.voivodeship} onChange={handleInputChange} className={"editable-input"} /></p>
              <button className="our-mission-button" onClick={handleSave}>Zapisz</button>
            </div>
          ) : (
            <div>
              <p><strong>Imię:</strong> {formValues.name}</p>
              <p><strong>Nazwisko:</strong> {formValues.surname}</p>
              <p><strong>Numer Telefonu:</strong> {formValues.phoneNumber}</p>
              <p><strong>Ulica:</strong> {formValues.Address}</p>
              <p><strong>Miasto:</strong> {formValues.City}</p>
              <p><strong>Kod pocztowy:</strong> {formValues.PostCode}</p>
              <p><strong>Województwo:</strong> {formValues.voivodeship}</p>
              <button className="our-mission-button" onClick={toggleEditMode}>Edytuj</button>
            </div>
          )}
        </div>
      ) : (
        <p>Ładowanie danych użytkownika</p>
      )}
    </div>
  );
};

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const response = await ShipmentServiceClient.get(`/getbyuser/${getKeycloak().subject}`);
        
        if (response.status === 404) {
          setShipments([]);
          setError(null);
        } else if (response.status === 200) {
          setShipments(response.data);
        } else {
          throw new Error('Unexpected error occurred');
        }
      } catch (error) {
        setError('Błąd podczas ładowania wysyłek.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchShipments();
  }, []);

  const handleEditSubmit = async (updatedShipmentData, shipmentId) => {
    try {
      await ShipmentServiceClient.patch(`/update/${shipmentId}`, updatedShipmentData);
      alert('Shipment updated successfully!');
      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert('Error updating shipment');
    } finally {
      closeEditModal();
    }
  };

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (shipment) => {
    setSelectedShipment(shipment);
    setIsEditModalOpen(true);
  };

  const closeShipmentDetailModal = () => {
    setSelectedShipment(null);
    setIsDetailModalOpen(false);
  };

  const closeShipmentEditModal = () => {
    setSelectedShipment(null);
    setIsEditModalOpen(false);
  }

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>Błąd podczas ładowania.</div>;
  }

  return (
    <div>
      <h2>Twoje wysyłki</h2>
      {shipments.length === 0 ? (
        <p>Nie masz żadnych wysyłek.</p>
      ) : (
        <div className="shipments-list">
          {shipments.map(shipment => (
            <div key={shipment.id} className="shipment">
              <h3>Wysyłka #{shipment.id}</h3>
              <p><strong>Adres dostawy:</strong> {shipment.shipment_address}</p>
              <p><strong>Data wysyłki:</strong> {new Date(shipment.shipment_date).toLocaleString()}</p>
              <p><strong>Data dostawy:</strong> {new Date(shipment.delivery_date).toLocaleString()}</p>
              <button className="our-mission-button" onClick={() => handleShipmentClick(shipment)}>Szczegóły</button>
              {shipment.status === "pending" && (
                <button className='our-mission-button' onClick={() => handleEditClick(shipment)}>Edytuj</button>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedShipment && isDetailModalOpen && (
        <ShipmentDetailModal shipment={selectedShipment} onClose={closeShipmentDetailModal} />
      )}
      {selectedShipment && isEditModalOpen && (
        <ShipmentEditModal
          isOpen={isEditModalOpen}
          onClose={closeShipmentEditModal}
          onSubmit={handleEditSubmit}
          shipment={selectedShipment}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
