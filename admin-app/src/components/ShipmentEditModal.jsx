import React, { useState, useEffect } from 'react';
import { formatDateTime, statusTranslationMap } from '../utils/utils';

const ShipmentEditModal = ({ isOpen, onClose, onSubmit, shipment }) => {
  const [currentLocation, setcurrentLocation] = useState(shipment?.current_location || '');
  const [shipmentAddress, setShipmentAddress] = useState(shipment?.shipment_address || '');
  const [deliveryDate, setDeliveryDate] = useState(formatDateTime(shipment?.delivery_date)  || '');
  const [status, setStatus] = useState(shipment?.status || '');

  useEffect(() => {
    setcurrentLocation(shipment?.current_location || '');
    setShipmentAddress(shipment?.shipment_address || '');
    setDeliveryDate(formatDateTime(shipment?.delivery_date));
    setStatus(shipment?.status || '');
  }, [shipment]);

  const handleSubmit = () => {
    const updatedShipmentData = {
      current_location: currentLocation,
      shipment_address: shipmentAddress,
      delivery_date: deliveryDate,
      status,
    };

    // Call the onSubmit function passed as a prop
    onSubmit(updatedShipmentData, shipment.id);
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content modal-shipment-content">
        <div className="modal-header">
          <h2>Edytuj Wysyłkę</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <label>Obecna Lokalizacja</label>
          <input
            type="text"
            value={currentLocation}
            onChange={(e) => setcurrentLocation(e.target.value)}
            placeholder="Obecna Lokalizacja"
          />
          <label>Adres wysyłki</label>
          <input
            type="text"
            value={shipmentAddress}
            onChange={(e) => setShipmentAddress(e.target.value)}
            placeholder="Adres Wysyłki"
          />
          <label>Data Dostawy</label>
          <input
            type="datetime-local"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            placeholder="Data dostawy"
          />
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(statusTranslationMap).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-footer">
          <button className="our-mission-button" onClick={handleSubmit}>
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ShipmentEditModal;
