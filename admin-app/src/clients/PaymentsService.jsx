import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const PaymentsServiceClient = axios.create({
  baseURL: "https://admin.jolszak.test/api/payments",
  timeout: 5020,
  headers: {
    'Accept': 'application/json',
  }
});

PaymentsServiceClient.interceptors.request.use(
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

export default PaymentsServiceClient;
