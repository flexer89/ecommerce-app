import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const OrderServiceClient = axios.create({
  baseURL: "https://admin.jolszak.test/api/orders",
  timeout: 5010,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor to add the token to the request
OrderServiceClient.interceptors.request.use(
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
