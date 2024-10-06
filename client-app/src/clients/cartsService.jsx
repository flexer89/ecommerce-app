import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const CartServiceClient = axios.create({
  baseURL: "https://jolszak.test/api/carts",
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
  }
});

CartServiceClient.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
    if (keycloak.isTokenExpired()) {
      try {
        await keycloak.updateToken();
      } catch (refreshError) {
        keycloak.logout();
        return Promise.reject(refreshError);
      }
    }

    config.headers.authorization = keycloak.token;
  }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 404 without throwing an error
CartServiceClient.interceptors.response.use(
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

export default CartServiceClient;
