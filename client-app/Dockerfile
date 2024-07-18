FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install @ionic/react ionicons

RUN npm install react-router-dom @stripe/react-stripe-js @stripe/stripe-js

RUN npm install @mui/material @emotion/react @emotion/styled

RUN npm install keycloak-js @react-keycloak/web axios

COPY . .

EXPOSE 8080

ENV VITE_KEYCLOAK_URL="https://auth.jolszak.test"
ENV VITE_KEYCLOAK_REALM="jolszak"
ENV VITE_KEYCLOAK_CLIENT_ID="python"
ENV VITE_KEYCLOAK_REDIRECT_URI="https://jolszak.test/"
CMD ["npx", "vite", "--host", "0.0.0.0"]