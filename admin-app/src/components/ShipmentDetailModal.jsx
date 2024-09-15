import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../assets/style/style.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const ShipmentDetailModal = ({ shipment, onClose }) => {
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoomLevel, setZoomLevel] = useState(13);

  useEffect(() => {
    // Geocode the shipment address using Nominatim
    const geocodeAddress = async (address) => {
        address = "Widok 35A Kraków";
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setMapCenter([parseFloat(lat), parseFloat(lon)]);
          setZoomLevel(14); // Adjust zoom level as needed
        } else {
          console.error('Geocoding failed: No results found');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    };

    if (shipment && shipment.shipment_address) {
      geocodeAddress(shipment.shipment_address);
    }
  }, [shipment]);

  if (!shipment) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content shipment-detail-modal">
        <h2>Shipment Details</h2>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="shipment-details">
          <p>
            <strong>ID:</strong> {shipment.id}
          </p>
          <p>
            <strong>User ID:</strong> {shipment.user_id}
          </p>
          <p>
            <strong>Order ID:</strong> {shipment.order_id}
          </p>
          <p>
            <strong>Shipment Address:</strong> {shipment.shipment_address}
          </p>
          <p>
            <strong>Shipment Date:</strong>{' '}
            {new Date(shipment.shipment_date).toLocaleDateString()}
          </p>
          <p>
            <strong>Delivery Date:</strong>{' '}
            {new Date(shipment.delivery_date).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong> {shipment.status}
          </p>
          <p>
            <strong>Company:</strong> {shipment.company}
          </p>
        </div>

        {/* Map Visualization */}
        <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
          {mapCenter[0] !== 0 && mapCenter[1] !== 0 ? (
            <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapCenter} icon={defaultIcon}>
                <Popup>Delivery Location</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>Loading map...</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Define the default icon for markers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

ShipmentDetailModal.propTypes = {
  shipment: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShipmentDetailModal;
