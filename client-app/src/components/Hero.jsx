import React from 'react';
import heroBanner1 from '../assets/images/hero-banner-1.jpg';
import heroBanner2 from '../assets/images/hero-banner-2.jpg';
import heroBanner3 from '../assets/images/hero-banner-3.jpg';

const Hero = () => (
  <section className="section hero" id="home" aria-label="hero" data-section>
    <div className="container">
      <ul className="has-scrollbar">
        <li className="scrollbar-item">
          <div className="hero-card has-bg-image" style={{ backgroundImage: `url(${heroBanner1})` }}>
            <div className="card-content">
              <h1 className="h1 hero-title">Reveal The <br /> Beauty of Skin</h1>
              <p className="hero-text">Made using clean, non-toxic ingredients, our products are designed for everyone.</p>
              <p className="price">Starting at $7.99</p>
              <a href="#" className="btn btn-primary">Shop Now</a>
            </div>
          </div>
        </li>
        <li className="scrollbar-item">
          <div className="hero-card has-bg-image" style={{ backgroundImage: `url(${heroBanner2})` }}>
            <div className="card-content">
              <h1 className="h1 hero-title">Reveal The <br /> Beauty of Skin</h1>
              <p className="hero-text">Made using clean, non-toxic ingredients, our products are designed for everyone.</p>
              <p className="price">Starting at $7.99</p>
              <a href="#" className="btn btn-primary">Shop Now</a>
            </div>
          </div>
        </li>
        <li className="scrollbar-item">
          <div className="hero-card has-bg-image" style={{ backgroundImage: `url(${heroBanner3})` }}>
            <div className="card-content">
              <h1 className="h1 hero-title">Reveal The <br /> Beauty of Skin</h1>
              <p className="hero-text">Made using clean, non-toxic ingredients, our products are designed for everyone.</p>
              <p className="price">Starting at $7.99</p>
              <a href="#" className="btn btn-primary">Shop Now</a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
);

export default Hero;
