import React from 'react';
import '../assets/style/style.css';
import logo from '../assets/images/logo.png';

const Header = () => (
  <header className="header">
    <div className="alert">
      <div className="container">
        <p className="alert-text">Free Shipping On All U.S. Orders $50+</p>
      </div>
    </div>
    <div className="header-top" data-header>
      <div className="container">
        <button className="nav-open-btn" aria-label="open menu" data-nav-toggler>
          <span className="line line-1"></span>
          <span className="line line-2"></span>
          <span className="line line-3"></span>
        </button>
        <div className="input-wrapper">
          <input type="search" name="search" placeholder="Search product" className="search-field" />
          <button className="search-submit" aria-label="search">
            <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
          </button>
        </div>
        <a href="#" className="logo">
          <img src={logo} width="179" height="26" alt="Glowing" />
        </a>
        <div className="header-actions">
          <button className="header-action-btn" aria-label="user">
            <ion-icon name="person-outline" aria-hidden="true"></ion-icon>
          </button>
          <button className="header-action-btn" aria-label="favourite item">
            <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
            <span className="btn-badge">0</span>
          </button>
          <button className="header-action-btn" aria-label="cart item">
            <data className="btn-text" value="0">$0.00</data>
            <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
            <span className="btn-badge">0</span>
          </button>
        </div>
        <nav className="navbar">
          <ul className="navbar-list">
            <li><a href="#home" className="navbar-link has-after">Home</a></li>
            <li><a href="#collection" className="navbar-link has-after">Collection</a></li>
            <li><a href="#shop" className="navbar-link has-after">Shop</a></li>
            <li><a href="#offer" className="navbar-link has-after">Offer</a></li>
            <li><a href="#blog" className="navbar-link has-after">Blog</a></li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;
