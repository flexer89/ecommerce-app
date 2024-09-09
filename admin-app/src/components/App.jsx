import { React } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import NotFoundComponent from "./NotFoundComponent";
import Statistics from "./Statistics";
import ProductsPageComponent from "./ProductsPageComponent";
import UserList from "./UserList";
import { KeycloakAuthProvider, useKeycloakAuth } from '../contexts/KeycloakContext';

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
    <main>
    </main>
  </div>
  );
};

const ProductsPage = () => {
  return (
    <div>
      <Header />
      <ProductsPageComponent />
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
          </Routes>
        </Router>
    </KeycloakAuthProvider>
  );
}

export default App;
