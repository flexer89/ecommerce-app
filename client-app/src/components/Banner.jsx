import React from 'react';
import banner1 from '../assets/images/beans-coffee.jpg';
import banner2 from '../assets/images/ground-coffee.jpg';

const Banner = () => (
  <section className="section banner" aria-label="banner" data-section>
    <div className="container">
      <ul className="banner-list">
        <li>
          <div className="banner-card banner-card-1 has-before hover:shine">
            <p className="card-subtitle">Stworzone z pasją, dostarczone z zaangażowaniem</p>
            <h2 className="h2 card-title">Odkryj naszą ofertę</h2>
            <a href="/products" className="btn btn-secondary">Sprawdź</a>
            <div className="has-bg-image" style={{ backgroundImage: `url(${banner1})` }}></div>
          </div>
        </li>
        <li>
          <div className="banner-card banner-card-2 has-before hover:shine">
            <p className="card-subtitle">Idealne rozwiązania dla każdego.</p>
            <h2 className="h2 card-title">Odkryj naszą ofertę</h2>
            <a href="/products" className="btn btn-secondary">Sprawdź</a>
            <div className="has-bg-image" style={{ backgroundImage: `url(${banner2})` }}></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
);

export default Banner;
