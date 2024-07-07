FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install @ionic/react ionicons

RUN npm install react-router-dom

RUN npm install @mui/material @emotion/react @emotion/styled

RUN npm install keycloak-js @react-keycloak/web

COPY . .

EXPOSE 8080

ENV VITE_KEYCLOAK_URL="https://auth.hms.test"
ENV VITE_KEYCLOAK_REALM="hms"
ENV VITE_KEYCLOAK_CLIENT_ID="hms"

CMD ["npx", "vite", "--host", "0.0.0.0"]