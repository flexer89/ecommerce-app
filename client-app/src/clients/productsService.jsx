import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const ProductsServiceClient = axios.create({
  baseURL: "https://jolszak.test/api/products",
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor to add the token to the request
ProductsServiceClient.interceptors.request.use(
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
ProductsServiceClient.interceptors.response.use(
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

export default ProductsServiceClient;
