import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserServiceClient from '../clients/UsersService';
import OrderServiceClient from '../clients/OrdersService';
import ShipmentServiceClient from '../clients/ShipmentsService';
import OrderDetailModal from './OrderDetailModal';
import { shipmentStatuses, orderStatusTranslationMap } from '../utils/utils';
import '../assets/style/style.css';
import ShipmentDetailModal from './ShipmentDetailModal';
import { Switch, FormControlLabel } from '@mui/material';

const UserProfileComponent = () => {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userShipments, setUserShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShipmentDetailModalOpen, setIsShipmentDetailModalOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const response = await UserServiceClient.get(`/get/${userId}`);
      setUserInfo(response.data.users[0]);
      // Assume that the user object contains a field `isBlocked` that indicates if the user is blocked
      setIsEnabled(response.data.users[0].enabled);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await OrderServiceClient.get(`/getbyuser/${userId}?limit=10000`);
      setUserOrders(response.data);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const fetchUserShipments = async () => {
    try {
      const response = await ShipmentServiceClient.get(`/getbyuser/${userId}`);
      setUserShipments(response.data);
    } catch (error) {
      console.error('Error fetching user shipments:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
      fetchUserOrders();
      fetchUserShipments();
    }
  }, [userId]);

  const toggleBlockStatus = async () => {
    try {
      if (isEnabled) {
        // Unblock the user
        await UserServiceClient.post(`/block/${userId}`);
        setIsEnabled(false);
      } else {
        // Block the user
        await UserServiceClient.post(`/unblock/${userId}`);
        setIsEnabled(true);
      }
    } catch (error) {
      console.error('Error updating block status:', error);
    }
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openShipmentDetailModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsShipmentDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  };

  const closeShipmentDetailModal = () => {
    setSelectedShipment(null);
    setIsShipmentDetailModalOpen(false);
  }

  return (
    <div className="user-profile-page container">
      <h1>Profil użytkownika</h1>

      {userInfo ? (
        <div className="user-info">
          <h2>Informacje osobiste</h2>
          <p><strong>ID Użytkownika:</strong> {userInfo.id}</p>
          <p><strong>Login:</strong> {userInfo.username}</p>
          <p><strong>Adres Email:</strong> {userInfo.email}</p>
          <p><strong>Imię:</strong> {userInfo.firstName}</p>
          <p><strong>Nazwisko:</strong> {userInfo.lastName}</p>
          <p><strong>Numer Telefonu:</strong> {userInfo.attributes?.phoneNumber}</p>
          <p><strong>Adres:</strong> {userInfo.attributes?.Address}, {userInfo.attributes?.City}, {userInfo.attributes?.PostCode}</p>
          <div className="user-block-status">
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled}
                  onChange={toggleBlockStatus}
                  name="blockToggle"
                  color="primary"
                />
              }
              label={isEnabled ? 'Aktywny' : 'Zablokowany'}
            />
          </div>
        </div>
      ) : (
        <p>Ładowanie informacji o użytkowniku</p>
      )}

      <div className="user-orders">
        <h2>Zamówienia</h2>
        {userOrders.length > 0 ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID zamówienia</th>
                <th>Cena całkowita</th>
                <th>Status</th>
                <th>Data zamówienia</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.total_price.toFixed(2)} zł</td>
                  <td>{orderStatusTranslationMap[order.status]}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => openDetailModal(order)}>Szczegóły</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nie znaleziono zamówień.</p>
        )}
      </div>

      <div className="user-shipments">
        <h2>Wysyłki</h2>
        {userShipments.length > 0 ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID Wysyłki</th>
                <th>ID zamówienia</th>
                <th>Status</th>
                <th>Data wysłania</th>
                <th>Data dostarczenia</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {userShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.order_id}</td>
                  <td>{shipmentStatuses[shipment.status]}</td>
                  <td>{new Date(shipment.shipment_date).toLocaleDateString('pl-PL') + ' | ' + new Date(shipment.shipment_date).toLocaleTimeString('pl-PL')}</td>
                  <td>{new Date(shipment.delivery_date).toLocaleDateString('pl-PL') + ' | ' + new Date(shipment.delivery_date).toLocaleTimeString('pl-PL')}</td>
                  <td>
                    <button onClick={() => openShipmentDetailModal(shipment)}>Szczegóły</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nie znaleziono wysyłek.</p>
        )}
      </div>

      {isDetailModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeDetailModal}
        />
      )}
      {isShipmentDetailModalOpen && selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={closeShipmentDetailModal}
        />
      )}
    </div>
  );
};

export default UserProfileComponent;
