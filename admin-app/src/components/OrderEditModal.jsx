import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderEditModal = ({ order, onClose, onSubmit }) => {
  const [status, setStatus] = useState(order.status || '');

  useEffect(() => {
    setStatus(order.status || '');
  }, [order]);

  const handleSubmit = async () => {
    const updatedOrderData = {
      status,
    };

    await onSubmit(updatedOrderData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-order-content">
        <div className="modal-header">
          <h2>Edit Order</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="modal-footer">
          <button onClick={handleSubmit} className="our-mission-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default OrderEditModal;
