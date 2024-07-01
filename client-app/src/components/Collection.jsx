import React from 'react';
import collection1 from '../assets/images/collection-1.jpg';
import collection2 from '../assets/images/collection-2.jpg';
import collection3 from '../assets/images/collection-3.jpg';

const Collection = () => (
  <section className="section collection" id="collection" aria-label="collection" data-section>
    <div className="container">
      <ul className="collection-list">
        <li>
          <div className="collection-card has-before hover:shine">
            <h2 className="h2 card-title">Summer Collection</h2>
            <p className="card-text">Starting at $17.99</p>
            <a href="#" className="btn-link">
              <span className="span">Shop Now</span>
              <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
            </a>
            <div className="has-bg-image" style={{ backgroundImage: `url(${collection1})` }}></div>
          </div>
        </li>
        <li>
          <div className="collection-card has-before hover:shine">
            <h2 className="h2 card-title">What’s New?</h2>
            <p className="card-text">Get the glow</p>
            <a href="#" className="btn-link">
              <span className="span">Discover Now</span>
              <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
            </a>
            <div className="has-bg-image" style={{ backgroundImage: `url(${collection2})` }}></div>
          </div>
        </li>
        <li>
          <div className="collection-card has-before hover:shine">
            <h2 className="h2 card-title">Buy 1 Get 1</h2>
            <p className="card-text">Starting at $7.99</p>
            <a href="#" className="btn-link">
              <span className="span">Discover Now</span>
              <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
            </a>
            <div className="has-bg-image" style={{ backgroundImage: `url(${collection3})` }}></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
);

export default Collection;
