import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../assets/style/style.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { statusTranslationMap } from '../utils/utils';

const ShipmentDetailModal = ({ shipment, onClose }) => {
  const [currentLocationCoords, setCurrentLocationCoords] = useState(null);
  const [deliveryLocationCoords, setDeliveryLocationCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoomLevel, setZoomLevel] = useState(13);

  console.log('shipment', shipment)

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        console.error('Geocoding failed: No results found');
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  useEffect(() => {
    if (shipment && shipment.shipment_address) {
      const fetchGeocodedData = async () => {
        const currentAddress = shipment.current_location;
        const deliveryAddress = shipment.shipment_address;

        const currentCoords = await geocodeAddress(currentAddress);
        const deliveryCoords = await geocodeAddress(deliveryAddress);

        if (currentCoords) {
          setCurrentLocationCoords(currentCoords);
        }
        if (deliveryCoords) {
          setDeliveryLocationCoords(deliveryCoords);
        }
        console.log('currentCoords', currentCoords)
        console.log('deliveryCoords', deliveryCoords)
        if (currentCoords && deliveryCoords) {
          const middleLat = (currentCoords[0] + deliveryCoords[0]) / 2;
          const middleLon = (currentCoords[1] + deliveryCoords[1]) / 2;
          setMapCenter([middleLat, middleLon]);
          setZoomLevel(8);
        }
      };

      fetchGeocodedData();
    }
  }, [shipment]);

  if (!shipment) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content shipment-detail-modal">
        <h2>Szczegóły wysyłki</h2>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="shipment-details">
          <p><strong>ID Wysyłki:</strong> {shipment.id}</p>
          <p><strong>ID Użytkownika:</strong> {shipment.user_id}</p>
          <p><strong>ID Zamówienia:</strong> {shipment.order_id}</p>
          <p><strong>Adres wysyłki:</strong> {shipment.shipment_address}</p>
          <p><strong>Obecna lokalizacja:</strong> {shipment.current_location}</p>
          <p><strong>Data wysyłki:</strong> {shipment.shipment_date}</p>
          <p><strong>Data dostawy:</strong> {shipment.delivery_date}</p>
          <p><strong>Status:</strong> {statusTranslationMap[shipment.status]}</p>
          <p><strong>Firma:</strong> {shipment.company}</p>
        </div>

        <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
        {(shipment.status === 'shipped' || shipment.status === 'delivered') ? (
          (currentLocationCoords && deliveryLocationCoords && mapCenter) ? (
            <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={currentLocationCoords} icon={currentLocationIcon}>
                <Popup>Current Location</Popup>
              </Marker>
              <Marker position={deliveryLocationCoords} icon={deliveryLocationIcon}>
                <Popup>Delivery Location</Popup>
              </Marker>
              <Polyline positions={[currentLocationCoords, deliveryLocationCoords]} color="blue" />
            </MapContainer>
          ) : (
            <p>Ładowanie mapy</p>
          )
        ) : (
          <p>Trasa przesyłki będzie widoczna tutaj po wysyłce zamówienia.</p>
        )}
      </div>
      </div>
    </div>
  );
};

const currentLocationIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/google/material-design-icons/master/png/maps/directions_car/materialicons/48dp/2x/baseline_directions_car_black_48dp.png',
  iconSize: [30, 30],
});

const deliveryLocationIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
});

ShipmentDetailModal.propTypes = {
  shipment: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShipmentDetailModal;
