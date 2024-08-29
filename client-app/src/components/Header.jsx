import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { personOutline, bagHandleOutline } from 'ionicons/icons';
import { useCart } from '../contexts/CartContext';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import '../assets/style/style.css';
import logo from '../assets/images/logo-brown.png';

const Header = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { cart } = useCart();
  const { isLogin, login, logout } = useKeycloakAuth();
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
  };

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
            <img src={logo} width="179" height="26" alt="Glowing" />
          </Link>
          <nav className="navbar">
            <ul className="navbar-list">
              {/* todo przerobić na buttony i dać onclick */}
              <li><Link to="/" className="navbar-link has-after">Strona główna</Link></li>
              <li><Link to="/bestsellers" className="navbar-link has-after">Bestsellery</Link></li>
              <li><Link to="/products" className="navbar-link has-after">Oferta</Link></li>
              <li><Link to="/about" className="navbar-link has-after">O nas</Link></li>
            </ul>
          </nav>
          <div className="header-actions">
            {isLogin ? (
              <>
                <button className="header-action-btn" aria-label="user" onClick={handleUserIconClick}>
                  <IonIcon icon={personOutline} aria-hidden="true" />
                </button>
                <button className="header-action-btn" aria-label="logout" onClick={handleLogout}>
                  <IonIcon icon="log-out-outline" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button className="header-action-btn" aria-label="user" onClick={handleUserIconClick}>
                <IonIcon icon={personOutline} aria-hidden="true" />
              </button>
            )}
            <Link to="/cart" className="header-action-btn" aria-label="cart item">
              <data className="btn-text" value={cart.total}>{cart.total.toFixed(2)} zł</data>
              <IonIcon icon={bagHandleOutline} aria-hidden="true" />
              <span className="btn-badge">{cart.quantity}</span>
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
            <li><a href="/" className="navbar-link has-after" onClick={togglePanel}>Strona główna</a></li>
            <li><a href="/profile" className="navbar-link has-after" onClick={togglePanel}>Profil</a></li>
            <li><a href="/cart" className="navbar-link has-after" onClick={togglePanel}>Koszyk</a></li>
            <li><a href="/products" className="navbar-link has-after" onClick={togglePanel}>Oferta</a></li>
            <li><a href="/bestsellers" className="navbar-link has-after" onClick={togglePanel}>Bestsellery</a></li>
            <li><a href="/our-mission" className="navbar-link has-after" onClick={togglePanel}>O nas</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
