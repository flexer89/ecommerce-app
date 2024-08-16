import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundComponent = () => {
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="our-mission-button">Go Back to Home</Link>
    </div>
  );
};

export default NotFoundComponent;
