import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const CartServiceClient = axios.create({
  baseURL: "https://jolszak.test/api/carts",
  timeout: 5040,
  headers: {
    'Accept': 'application/json',
  }
});

CartServiceClient.interceptors.request.use(
  async (config) => {
    if (keycloak.isTokenExpired()) {
      try {
        await keycloak.updateToken();
      } catch (refreshError) {
        keycloak.logout();
        return Promise.reject(refreshError);
      }
    }
    
    config.headers.token = `Bearer ${keycloak.token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default CartServiceClient;