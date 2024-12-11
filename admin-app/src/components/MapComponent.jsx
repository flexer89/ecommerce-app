// MapComponent.jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import Leaflet images for custom marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Define a default icon for Leaflet markers
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapComponent = () => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]); // New York City coordinates
  const [zoomLevel, setZoomLevel] = useState(13);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Load OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Add a marker at the map center */}
        <Marker position={mapCenter} icon={defaultIcon}>
          <Popup>Here is New York City!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
