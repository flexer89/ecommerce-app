import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/style.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h2 className="h2-large section-title">Naprawdę kochamy kawę</h2>
      <p className="subtitle">Trochę o nas...</p>
      <p className="description">
        Naszą miłość do kawy zaczęliśmy szerzyć w 2024 roku. Od tego czasu niestrudzenie współpracujemy ze społecznościami z całego świata, aby dostarczać autentyczną kawę do Twojej filiżanki.
      </p>
      <div className="button-container">
        <button className="our-mission-button"><Link to='/our-mission'>Nasza misja</Link></button>
        <button className="contact-us-button"><a href='#footer'>Kontakt</a></button>
      </div>
    </div>
  );
};

export default AboutUs;
