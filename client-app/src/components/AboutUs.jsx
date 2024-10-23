import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/style.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h2 className="h2-large section-title">Naprawdę kochamy to, co robimy</h2>
      <p className="subtitle">Trochę o nas...</p>
      <p className="description">
        Od 2024 roku pasjonujemy się dostarczaniem najwyższej jakości produktów do naszych klientów.
        Współpracujemy z lokalnymi i międzynarodowymi dostawcami, aby oferować autentyczne, starannie wybrane produkty, które zaspokoją nawet najbardziej wymagające gusta.
      </p>
      <div className="button-container">
        <button className="our-mission-button">
          <Link to='/our-mission'>Nasza misja</Link>
        </button>
        <button className="contact-us-button">
          <a href='#footer'>Kontakt</a>
        </button>
      </div>
    </div>
  );
};

export default AboutUs;
