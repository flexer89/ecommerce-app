import React, { createContext, useContext, useState, useEffect } from 'react';
import getKeycloak from '../auth/keycloak';

const KeycloakAuthContext = createContext();

export const KeycloakAuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLogin, setLogin] = useState(false);
  const [roles, setRoles] = useState([]);
  const [uuid, setUuid] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const keycloak = getKeycloak();
    if (!isInitialized) {
      keycloak
        .init({ onLoad: 'check-sso' })
        .then((authenticated) => {
          setLogin(authenticated);
          const tokenPayload = keycloak.tokenParsed;
          if (tokenPayload && tokenPayload.realm_access && tokenPayload.realm_access.roles) {
            setRoles(tokenPayload.realm_access.roles);
          }
          setUuid(tokenPayload.sub);
          setName(tokenPayload.name);
        })
        .catch((error) => {
          console.error('Error initializing Keycloak:', error);
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, [isInitialized]);

  const login = () => getKeycloak().login();
  const logout = () => getKeycloak().logout({redirectUri: "/"});
  const redirectToCheckout = () => getKeycloak().login({redirectUri: window.location.origin + '/checkout'});
  const user = { uuid, name, roles };

  return (
    <KeycloakAuthContext.Provider value={{ isLogin, isInitialized, login, logout, redirectToCheckout, user }}>
      {children}
    </KeycloakAuthContext.Provider>
  );
};

export const useKeycloakAuth = () => {
  return useContext(KeycloakAuthContext);
};
