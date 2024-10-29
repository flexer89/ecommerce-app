import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const OrderServiceClient = axios.create({
  baseURL: "https://jolszak.test/api/orders",
  timeout: 5010,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor to add the token to the request
OrderServiceClient.interceptors.request.use(
  async (config) => {
    // Check if the user is authenticated
    if (keycloak.authenticated) {
      // Ensure the token is not expired
      if (keycloak.isTokenExpired()) {
        try {
          await keycloak.updateToken();
        } catch (refreshError) {
          keycloak.logout();
          return Promise.reject(refreshError);
        }
      }
      // Add the token to the request headers if authenticated
      config.headers.authorization = `Bearer ${keycloak.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 404 without throwing an error
OrderServiceClient.interceptors.response.use(
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

export default OrderServiceClient;
