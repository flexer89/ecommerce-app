import React from 'react';
import logo from '../assets/images/logo-white.png';

const Footer = () => (
  <footer className="footer" data-section>
    <div className="container">
      <div className="footer-top">
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Kontakt</p>
          </li>
          <li>
            <p className="footer-list-text bold">+48 123 456 789</p>
          </li>
          <li>
            <p className="footer-list-text bold">jolszak@jolszak.com</p>
          </li>
        </ul>
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Obserwuj nas</p>
          </li>
          <li><a href="#" className="footer-link">TikTok</a></li>
          <li><a href="#" className="footer-link">Instagram</a></li>
          <li><a href="#" className="footer-link">Facebook</a></li>
          <li><a href="#" className="footer-link">YouTube</a></li>
        </ul>
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Informacje</p>
          </li>
          <li><a href="#" className="footer-link">Regulamin</a></li>
          <li><a href="#" className="footer-link">Płatności</a></li>
          <li><a href="#" className="footer-link">FAQ</a></li>
        </ul>
      </div>
      <div className="footer-bottom">
        <a href="#" className="logo">
          <img src={logo} width="179" height="26" alt="Glowing" />
        </a>
        <p className="copyright">© 2024 Jakub Olszak</p>
      </div>
    </div>
  </footer>
);

export default Footer;