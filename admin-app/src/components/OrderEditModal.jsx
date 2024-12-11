import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShipmentServiceClient from '../clients/ShipmentsService'; // Import ShipmentServiceClient

const OrderEditModal = ({ order, onClose, onSubmit }) => {
  const [status, setStatus] = useState(order.status || '');

  useEffect(() => {
    setStatus(order.status || '');
  }, [order]);

  const updateShipmentStatus = async (newStatus) => {
    try {
      // Fetch the shipment by order ID
      const response = await ShipmentServiceClient.get(`/getbyorder/${order.id}`);
      const shipment = response.data;

      if (shipment) {
        // Update the shipment status based on the order status
        await ShipmentServiceClient.patch(`/update/${shipment.id}`, {
          status: newStatus,
        });
        toast.success(`Shipment status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast.error('Error updating shipment status');
    }
  };

  const handleSubmit = async () => {
    const updatedOrderData = {
      status,
    };

    await onSubmit(updatedOrderData);

    // Update the shipment status based on the new order status
    if (status === 'shipped') {
      await updateShipmentStatus('shipped');
    } else if (status === 'delivered') {
      await updateShipmentStatus('delivered');
    } else if (status === 'cancelled') {
      await updateShipmentStatus('cancelled');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-order-content">
        <div className="modal-header">
          <h2>Edytuj zamówienie</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">W toku</option>
            <option value="processing">Przetwarzane</option>
            <option value="shipped">Wysłane</option>
            <option value="delivered">Dostarczone</option>
            <option value="cancelled">Anulowane</option>
            <option value="on_hold">Wstrzymane</option>
          </select>
        </div>
        <div className="modal-footer">
          <button onClick={handleSubmit} className="our-mission-button">Zapisz zmiany</button>
        </div>
      </div>
    </div>
  );
};

export default OrderEditModal;
