FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install react-router-dom @stripe/react-stripe-js @stripe/stripe-js

RUN npm install @mui/material @emotion/react @emotion/styled @mui/x-data-grid


RUN npm install keycloak-js @react-keycloak/web axios dayjs react-leaflet leaflet

RUN npm install @ionic/react ionicons chart.js react-chartjs-2 react-toastify


COPY . .

EXPOSE 8080

CMD ["npx", "vite", "--host", "0.0.0.0"]