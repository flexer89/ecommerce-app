import React from 'react';
import logo from '../assets/images/logo.png';

const Footer = () => (
  <footer className="footer" data-section>
    <div className="container">
      <div className="footer-top">
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Company</p>
          </li>
          <li>
            <p className="footer-list-text">
              Find a location nearest you. See <a href="#" className="link">Our Stores</a>
            </p>
          </li>
          <li>
            <p className="footer-list-text bold">+391 (0)35 2568 4593</p>
          </li>
          <li>
            <p className="footer-list-text">hello@domain.com</p>
          </li>
        </ul>
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Useful links</p>
          </li>
          <li><a href="#" className="footer-link">New Products</a></li>
          <li><a href="#" className="footer-link">Best Sellers</a></li>
          <li><a href="#" className="footer-link">Bundle & Save</a></li>
          <li><a href="#" className="footer-link">Online Gift Card</a></li>
        </ul>
        <ul className="footer-list">
          <li>
            <p className="footer-list-title">Information</p>
          </li>
          <li><a href="#" className="footer-link">About Us</a></li>
          <li><a href="#" className="footer-link">Privacy Policy</a></li>
          <li><a href="#" className="footer-link">Terms & Conditions</a></li>
          <li><a href="#" className="footer-link">Contact Us</a></li>
        </ul>
      </div>
      <div className="footer-bottom">
        <a href="#" className="logo">
          <img src={logo} width="179" height="26" alt="Glowing" />
        </a>
        <ul className="social-list">
          <li><a href="#" className="social-link">Facebook</a></li>
          <li><a href="#" className="social-link">Twitter</a></li>
          <li><a href="#" className="social-link">Instagram</a></li>
        </ul>
        <p className="copyright">© 2022 Glowing. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;