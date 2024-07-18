import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const ProductServiceClient = axios.create({
  baseURL: "https://jolszak.test/api/products",
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
  }
});

ProductServiceClient.interceptors.request.use(
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

export default ProductServiceClient;