import React, { createContext, useContext, useState, useEffect } from 'react';
import getKeycloak from '../auth/keycloak';

const KeycloakAuthContext = createContext();

export const KeycloakAuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLogin, setLogin] = useState(false);
  const [roles, setRoles] = useState([]);
  const [uuid, setUuid] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const keycloak = getKeycloak();
    if (!isInitialized) {
      keycloak
        .init({ onLoad: 'login-required' })
        .then((authenticated) => {
          setLogin(authenticated);
            const tokenPayload = keycloak.tokenParsed;
            if (tokenPayload && tokenPayload.realm_access && tokenPayload.realm_access.roles) {
              const userRoles = tokenPayload.realm_access.roles;
              setRoles(userRoles);
              setIsAdmin(userRoles.includes('admin'));
              setUuid(tokenPayload.sub);
              setName(tokenPayload.name);
            }
        })
        .catch((error) => {
          console.error('Error initializing Keycloak:', error);
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, [isInitialized]);

  // Logout user if they are not admin after login
  useEffect(() => {
    if (isLogin && !isAdmin) {
      // If the user is not an admin, immediately log them out or redirect
      getKeycloak().logout({ redirectUri: '/' });
    }
  }, [isLogin, isAdmin]);

  const login = () => getKeycloak().login();
  const logout = () => getKeycloak().logout({ redirectUri: '/' });

  const redirectToCheckout = () => getKeycloak().login({ redirectUri: import.meta.env.VITE_KEYCLOAK_CHECKOUT_REDIRECT_URI });

  const user = { uuid, name, roles, isAdmin };

  return (
    <KeycloakAuthContext.Provider value={{ isLogin, isInitialized, isAdmin, login, logout, redirectToCheckout, user }}>
      {children}
    </KeycloakAuthContext.Provider>
  );
};

export const useKeycloakAuth = () => {
  return useContext(KeycloakAuthContext);
};
