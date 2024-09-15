import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserServiceClient from '../clients/UsersService';
import OrderServiceClient from '../clients/OrdersService';
import ShipmentServiceClient from '../clients/ShipmentsService';
import OrderDetailModal from './OrderDetailModal';
import '../assets/style/style.css';

const UserProfileComponent = () => {
  const { userId } = useParams(); // userId is extracted from the route params
  const [userInfo, setUserInfo] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userShipments, setUserShipments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await UserServiceClient.get(`/get/${userId}`);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Fetch user's orders
  const fetchUserOrders = async () => {
    try {
      const response = await OrderServiceClient.get(`/getbyuser/${userId}`);
      setUserOrders(response.data);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  // Fetch user's shipments
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

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
    setIsDetailModalOpen(false);
  };

  return (
    <div className="user-profile-page">
      <h1>User Profile</h1>

      {userInfo ? (
        <div className="user-info">
          <h2>Personal Info</h2>
          <p><strong>Username:</strong> {userInfo.username}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>First Name:</strong> {userInfo.firstName}</p>
          <p><strong>Last Name:</strong> {userInfo.lastName}</p>
          <p><strong>Phone:</strong> {userInfo.attributes?.phoneNumber}</p>
          <p><strong>Address:</strong> {userInfo.attributes?.Address}, {userInfo.attributes?.City}, {userInfo.attributes?.PostCode}</p>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}

      <div className="user-orders">
        <h2>User Orders</h2>
        {userOrders.length > 0 ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.total_price.toFixed(2)} zł</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => openDetailModal(order)}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      <div className="user-shipments">
        <h2>User Shipments</h2>
        {userShipments.length > 0 ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Order ID</th>
                <th>Shipment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.id}</td>
                  <td>{shipment.order_id}</td>
                  <td>{shipment.status}</td>
                  <td>{new Date(shipment.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No shipments found.</p>
        )}
      </div>

      {isDetailModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default UserProfileComponent;
