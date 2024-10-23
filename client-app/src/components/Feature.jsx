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
                alt="Innowacyjne podejście"
                className="card-icon"
              />
              <h3 className="h3 card-title">Innowacyjne Podejście</h3>
              <p className="card-text">
                Stale poszukujemy nowych, innowacyjnych metod produkcji i dystrybucji, aby dostarczać Ci produkty najwyższej jakości.
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
                alt="Szybka Dostawa"
                className="card-icon"
              />
              <h3 className="h3 card-title">Szybka Dostawa</h3>
              <p className="card-text">
                Zapewniamy szybką i niezawodną dostawę, abyś mógł cieszyć się naszymi produktami bez zbędnych opóźnień.
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
                alt="Szeroki Asortyment"
                className="card-icon"
              />
              <h3 className="h3 card-title">Szeroki Asortyment</h3>
              <p className="card-text">
                Oferujemy bogaty wybór produktów, które spełnią potrzeby nawet najbardziej wymagających klientów.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Feature;
