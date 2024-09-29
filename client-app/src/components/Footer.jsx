import React from 'react';
import logo from '../assets/images/logo-white.png';

const Footer = () => (
  <footer className="footer" id='footer' data-section>
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
          <li>
            <p className="footer-list-text bold">Warszawska 24</p>
          </li>
          <li>
            <p className="footer-list-text bold">31-155 Kraków</p>
          </li>
        </ul>
        <ul className="footer-list footer-list-sm">
          <li>
            <p className="footer-list-title">Obserwuj nas</p>
          </li>
          <div className='sm-buttons-list'>
          <li>
            <a href="https://www.tiktok.com" className="footer-link" target="_blank" rel="noopener noreferrer"><ion-icon name="logo-tiktok"></ion-icon></a></li>
            <li><a href="https://www.instagram.com" className="footer-link" target='_blank' rel="noopener noreferrer"><ion-icon name="logo-instagram"></ion-icon></a></li>
            <li><a href="https://www.facebook.com" className="footer-link" target='_blank' rel="noopener noreferrer"><ion-icon name="logo-facebook"></ion-icon></a></li>
            <li><a href="https://www.youtube.com" className="footer-link" target='_blank' rel="noopener noreferrer"><ion-icon name="logo-youtube"></ion-icon></a></li>
          </div>
        </ul>
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Informacje</p>
          </li>
          <li><a href="/regulations" className="footer-link">Regulamin</a></li>
          <li><a href="/faq" className="footer-link">FAQ</a></li>
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