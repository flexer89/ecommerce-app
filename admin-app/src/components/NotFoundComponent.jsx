import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundComponent = () => {
  return (
    <div className="not-found-page">
      <h1>404 - Nie znaleziono</h1>
      <p>Strona, której szukasz, nie istnieje.</p>
      <Link to="/" className="our-mission-button">Wróć do strony głównej</Link>
    </div>
  );
};

export default NotFoundComponent;
