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
