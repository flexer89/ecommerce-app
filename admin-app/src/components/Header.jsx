import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { personOutline, bagHandleOutline } from 'ionicons/icons';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import '../assets/style/style.css';
import logo from '../assets/images/logo-brown-admin.png';

const Header = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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
          <Link to="/statistics" className="btn-link">
            <img src={logo} width="179" height="26" alt="Glowing" />
          </Link>
          <nav className="navbar">
            <ul className="navbar-list">
              <li><Link to="/statistics" className="navbar-link has-after">Statystyki</Link></li>
              <li><Link to="/products" className="navbar-link has-after">Produkty</Link></li>
              <li><Link to="/users" className="navbar-link has-after">Użytkownicy</Link></li>
              <li><Link to="/orders" className="navbar-link has-after">Zamówienia</Link></li>
              <li><Link to="/shipments" className="navbar-link has-after">Wysyłki</Link></li>
              <li><a href="https://dashboard.stripe.com/test/dashboard" target="_blank" rel="noopener noreferrer" className='navbar-link has-after'>Płatności</a></li>
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
              <button className="header-action-btn" aria-label="login" onClick={login}>
                <IonIcon icon={personOutline} aria-hidden="true" />
              </button>
            )}
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
            <li><Link to="/profile" className="navbar-link has-after" onClick={togglePanel}>Profil</Link></li>
            <li><Link to="/products" className="navbar-link has-after" onClick={togglePanel}>Oferta</Link></li>
            <li><Link to="/bestsellers" className="navbar-link has-after" onClick={togglePanel}>Bestsellery</Link></li>
            <li><Link to="/our-mission" className="navbar-link has-after" onClick={togglePanel}>O nas</Link></li>
          </ul>
        </nav>
        {isLogin ? (
          <button 
            className="header-action-btn log-in-out" 
            aria-label="logout" 
            onClick={handleLogout}
          >
            <IonIcon className='in-out-icon' icon="log-out-outline" aria-hidden="true" />
          </button>
        ) : (
          <button 
            className="header-action-btn log-in-out" 
            aria-label="login" 
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
