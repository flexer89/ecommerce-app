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
            <h2 className="h2 card-title">Ekskluzywne Produkty</h2>
            <p className="card-text">Już od 29.99 zł</p>
            <button className="collection-card-button">Sprawdź</button>
            <div className="has-bg-image" style={{ backgroundImage: `url(${collection1})` }}></div>
          </div>
        </li>
        <li>
          <div className="collection-card has-before hover:shine">
            <h2 className="h2 card-title">Nowości</h2>
            <p className="card-text">Zobacz, co nowego w naszej ofercie</p>
            <button className="collection-card-button">Sprawdź</button>
            <div className="has-bg-image" style={{ backgroundImage: `url(${collection2})` }}></div>
          </div>
        </li>
        <li>
          <div className="collection-card has-before hover:shine">
            <h2 className="h2 card-title">Promocje</h2>
            <p className="card-text">Kup 1, otrzymaj 2 - najlepsze oferty</p>
            <button className="collection-card-button">Sprawdź</button>
            <div className="has-bg-image" style={{ backgroundImage: `url(${collection3})` }}></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
);

export default Collection;
