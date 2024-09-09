import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const ShipmentServiceClient = axios.create({
  baseURL: "https://admin.jolszak.test/api/shipments",
  timeout: 5010,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor to add the token to the request
ShipmentServiceClient.interceptors.request.use(
  async (config) => {
    if (keycloak.isTokenExpired()) {
      try {
        await keycloak.updateToken();
      } catch (refreshError) {
        keycloak.logout();
        return Promise.reject(refreshError);
      }
    }

    config.headers.authorization = keycloak.token;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 404 without throwing an error
ShipmentServiceClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 404) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default ShipmentServiceClient;
