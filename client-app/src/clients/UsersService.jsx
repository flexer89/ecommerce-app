import axios from 'axios';
import getKeycloak from '../auth/keycloak';

const keycloak = getKeycloak();

const UserServiceClient = axios.create({
  baseURL: "https://jolszak.test/api/users",
  timeout: 5030,
  headers: {
    'Accept': 'application/json',
  }
});

UserServiceClient.interceptors.request.use(
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

export default UserServiceClient;