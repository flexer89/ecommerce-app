import React, { useState, useEffect } from 'react';

const ShipmentEditModal = ({ onClose, onSubmit, shipment }) => {
  const [shipmentAddress, setShipmentAddress] = useState(shipment?.shipment_address || '');

  useEffect(() => {
    setShipmentAddress(shipment?.shipment_address || '');
  }, [shipment]);

  const handleSubmit = () => {
    const updatedShipmentData = {
      shipment_address: shipmentAddress,
    };

    onSubmit(updatedShipmentData, shipment.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-shipment-content">
        <div className="modal-header">
          <h2>Edytuj Wysyłkę</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <label>Adres wysyłki</label>
          <input
            type="text"
            value={shipmentAddress}
            onChange={(e) => setShipmentAddress(e.target.value)}
            placeholder="Adres Wysyłki"
          />
        </div>
        <div className="modal-footer">
          <button className="our-mission-button" onClick={handleSubmit}>
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentEditModal;
