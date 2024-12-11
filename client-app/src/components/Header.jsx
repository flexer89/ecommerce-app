import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { personOutline, bagHandleOutline } from 'ionicons/icons';
import { useCart } from '../contexts/CartContext';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import getKeycloak from '../auth/keycloak';
import '../assets/style/style.css';
import logo from '../assets/images/logo-brown.png';

const Header = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { cart, fetchCart } = useCart();
  let { isLogin, login, logout, keycloak } = useKeycloakAuth(); // Added keycloak object to access user info
  const navigate = useNavigate();

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleUserIconClick = () => {
    if (isLogin) {
      navigate('/profile');
    } else {
      login();
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('tempCartId');
  };

  // Inside useEffect hook of Header component
  useEffect(() => {
    if (isLogin) {
      keycloak = getKeycloak(); // Get Keycloak object
      const userId = keycloak.subject; // Get user ID from Keycloak
      fetchCart(userId); // Sync cart from backend
    }
  }, [isLogin, keycloak, fetchCart]);


  // Ensure the cart object is always defined and provide default values
  const totalAmount = cart?.total ? cart.total.toFixed(2) : '0.00';
  const totalQuantity = cart?.quantity ? cart.quantity : 0;

  return (
    <header className="header">
      <div className="alert">
        <p className="alert-text">Darmowa wysyłka powyżej 200 złotych</p>
      </div>
      <div className="header-top" data-header>
        <div className="container">
          <button
            className={`nav-open-btn ${isPanelOpen ? 'active' : ''}`}
            aria-label="open menu"
            onClick={togglePanel}
          >
            <span className="line line-1"></span>
            <span className="line line-2"></span>
            <span className="line line-3"></span>
          </button>
          <Link to="/" className="btn-link">
            <img src={logo} width="179" height="26" />
          </Link>
          <nav className="navbar">
            <ul className="navbar-list">
              <li><Link to="/" className="navbar-link has-after">Strona główna</Link></li>
              <li><Link to="/bestsellers" className="navbar-link has-after">Bestsellery</Link></li>
              <li><Link to="/products" className="navbar-link has-after">Oferta</Link></li>
              <li><Link to="/about" className="navbar-link has-after">O nas</Link></li>
            </ul>
          </nav>
          <div className="header-actions">
            {isLogin ? (
              <>
                {/* Only show the Profile and Logout buttons if the user is logged in */}
                <button className="header-action-btn" aria-label="user" onClick={handleUserIconClick}>
                  <IonIcon icon={personOutline} aria-hidden="true" />
                </button>
                <button className="header-action-btn" aria-label="logout" onClick={handleLogout}>
                  <IonIcon icon="log-out-outline" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button className="header-action-btn" aria-label="login" onClick={login}>
                <IonIcon icon={personOutline} aria-hidden="true" />
              </button>
            )}
            <Link to="/cart" className="header-action-btn" aria-label="cart item">
              <data className="btn-text" value={totalAmount}>{totalAmount} zł</data>
              <IonIcon icon={bagHandleOutline} aria-hidden="true" />
              <span className="btn-badge">{totalQuantity}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={`panel ${isPanelOpen ? 'active' : ''}`}>
        <button
          className="nav-close-btn"
          aria-label="close menu"
          onClick={togglePanel}
        >
          &times;
        </button>
        <nav className="navbar-mobile">
          <ul className="navbar-list">
            <li><Link to="/" className="navbar-link has-after" onClick={togglePanel}>Strona główna</Link></li>
            {/* Only show Profile link if the user is logged in */}
            {isLogin && <li><Link to="/profile" className="navbar-link has-after" onClick={togglePanel}>Profil</Link></li>}
            <li><Link to="/cart" className="navbar-link has-after" onClick={togglePanel}>Koszyk</Link></li>
            <li><Link to="/products" className="navbar-link has-after" onClick={togglePanel}>Oferta</Link></li>
            <li><Link to="/bestsellers" className="navbar-link has-after" onClick={togglePanel}>Bestsellery</Link></li>
            <li><Link to="/our-mission" className="navbar-link has-after" onClick={togglePanel}>O nas</Link></li>
          </ul>
        </nav>

        {/* Conditionally render the Logout/Login button based on authentication status */}
        {isLogin ? (
          <button
            className="header-action-btn log-in-out"
            aria-label="logoutt"
            onClick={handleLogout}
          >
            <IonIcon className='in-out-icon' icon="log-out-outline" aria-hidden="true" />
          </button>
        ) : (
          <button
            className="header-action-btn log-in-out"
            aria-label="loginn"
            onClick={login}
          >
            <IonIcon className='in-out-icon' icon={personOutline} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
