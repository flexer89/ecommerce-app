import React from 'react';
import '../assets/style/style.css';
import feature1 from '../assets/images/bulb-outline.svg';
import feature2 from '../assets/images/cube-outline.svg';
import feature3 from '../assets/images/cafe-outline.svg';

const Feature = () => {
  return (
    <section className="section feature" id="feature" aria-label="feature" data-section>
      <div className="container">
        <h2 className="h2-large section-title">Dlaczego my?</h2>
        <ul className="flex-list">
          <li className="flex-item">
            <div className="feature-card">
              <img
                src={feature1}
                width="204"
                height="236"
                loading="lazy"
                alt="Guaranteed PURE"
                className="card-icon"
              />
              <h3 className="h3 card-title">Innowacyjne Metody</h3>
              <p className="card-text">
              Stale poszukujemy nowych, innowacyjnych metod obróbki i parzenia kawy, aby dostarczać Ci najlepsze doznania smakowe.
              </p>
            </div>
          </li>
          <li className="flex-item">
            <div className="feature-card">
              <img
                src={feature2}
                width="204"
                height="236"
                loading="lazy"
                alt="Completely Cruelty-Free"
                className="card-icon"
              />
              <h3 className="h3 card-title">Szybka Dostawa</h3>
              <p className="card-text">
              Zapewniamy szybką i niezawodną dostawę, abyś mógł cieszyć się świeżą kawą bez żadnych opóźnień.
              </p>
            </div>
          </li>
          <li className="flex-item">
            <div className="feature-card">
              <img
                src={feature3}
                width="204"
                height="236"
                loading="lazy"
                alt="Ingredient Sourcing"
                className="card-icon"
              />
              <h3 className="h3 card-title">Bogata Oferta</h3>
              <p className="card-text">
              Oferujemy szeroki wybór kaw, od klasycznych po ekskluzywne mieszanki, aby każdy miłośnik kawy znalazł coś dla siebie.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Feature;
