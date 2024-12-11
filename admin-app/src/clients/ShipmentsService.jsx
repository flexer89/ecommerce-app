import axios from 'axios';
import getKeycloak from '../auth/keycloak'; // Assuming keycloak.js is in this location

const keycloak = getKeycloak();

const ShipmentServiceClient = axios.create({
  baseURL: 'https://admin.jolszak.test/api/shipments',
  timeout: 5050,
  headers: {
    'Accept': 'application/json',
  },
});

// Use an Axios request interceptor to add the token dynamically
ShipmentServiceClient.interceptors.request.use(
  async (config) => {
    // Ensure Keycloak is initialized and the token is available
    console.log('Keycloak token:', keycloak);

    if (!keycloak.authenticated) {
      keycloak.login();
    }

    // Check if the token is expired and refresh it if needed
    if (keycloak.isTokenExpired()) {
      try {
        await keycloak.updateToken(30); // Refresh token if expiring in the next 30 seconds
      } catch (error) {
        console.error('Failed to refresh Keycloak token', error);
        keycloak.logout();
        return Promise.reject(error);
      }
    }

    // Set the Authorization header with the token
    config.headers.Authorization = `Bearer ${keycloak.token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default ShipmentServiceClient;
