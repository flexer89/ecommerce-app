import { React } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import NotFoundComponent from "./NotFoundComponent";
import Statistics from "./Statistics";
import ProductsPageComponent from "./ProductsPageComponent";
import UserList from "./UserList";
import OrderList from "./OrderList";
import UserProfileComponent from "./UserProfileComponent";
import AdminProfileComponent from "./AdminProfileComponent";
import ShipmentComponent from "./ShipmentComponent";
import MapComponent from "./MapComponent";
import { KeycloakAuthProvider, useKeycloakAuth } from '../contexts/KeycloakContext';
import BackToTop from "./BackToTop";

const AdminDashboard = () => {
  const { isAdmin, login } = useKeycloakAuth();

  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <h2>Odmowa dostępu</h2>
        <p>Aby uzyskać dostęp do tej strony, musisz mieć uprawnienia administratora.</p>
        <button onClick={login}>Zaloguj się jako Administrator</button>
      </div>
    );
  }

  return (
    <div>
    <Header />
    <Statistics />
  </div>
  );
};

const ProductsPage = () => {
  return (
    <div>
      <Header />
      <ProductsPageComponent />
      <BackToTop />
    </div>
  );
};

const UsersPage = () => {
  return (
    <div>
      <Header />
      <UserList />
    </div>
  );
}

const StatisticsPage = () => {
  return (
    <div>
      <Header />
      <Statistics />
    </div>
  );
};

const OrderPage = () => {
  return (
    <div>
      <Header />
      <OrderList />
    </div>
  );
};

const UserProfilePage = () => {
  return (
    <div>
      <Header />
      <UserProfileComponent />
    </div>
  );
}

const AdminProfilePage = () => {
  return (
    <div>
      <Header />
      <AdminProfileComponent />
    </div>
  );
}

const ShipmentsPage = () => {
  return (
    <div>
      <Header />
      <ShipmentComponent />
    </div>
  );
}

const MapPage = () => {
  return (
    <div>
      <Header />
      <MapComponent />
    </div>
  );
}


const App = () => {
  return (
    <KeycloakAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="*" element={<NotFoundComponent />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/profile" element={<AdminProfilePage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </Router>
    </KeycloakAuthProvider>
  );
}

export default App;
