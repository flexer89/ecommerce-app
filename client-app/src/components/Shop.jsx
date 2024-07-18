import React from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { bagHandleOutline } from 'ionicons/icons';
import product1 from '../assets/images/product-01.png';

const Shop = () => (
  <section className="section shop" id="shop" aria-label="shop" data-section>
    <div className="container">
      <div className="title-wrapper">
        <h2 className="h2 section-title">Nasze Bestsellery</h2>
        <Link to="/products" className="btn-link">
          <span className="span">Zobacz wszystkie produkty</span>
          <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
        </Link>
      </div>
      <ul className="has-scrollbar">
        <li className="scrollbar-item">
          <a href={'/product/1'}>
          <div className="shop-card">
            <div className="card-banner img-holder" style={{ "--width": 540, "--height": 720 }}>
              <img src={product1} width="540" height="720" loading="lazy" alt="Arabica" className="img-cover" />
              <span className="badge" aria-label="20% off">Bestseller</span>
              <div className="card-actions">
                <button className="action-btn" aria-label="add to cart">
                  <IonIcon icon={bagHandleOutline} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="price">
                <span className="span">$39.00</span>
              </div>
            </div>
          </div>
          </a>
        </li>
        <li className="scrollbar-item">
          <a href={'/product/2'}>
          <div className="shop-card">
            <div className="card-banner img-holder" style={{ "--width": 540, "--height": 720 }}>
              <img src={product1} width="540" height="720" loading="lazy" alt="Arabica" className="img-cover" />
              <span className="badge" aria-label="20% off">Bestseller</span>
              <div className="card-actions">
                <button className="action-btn" aria-label="add to cart">
                  <IonIcon icon={bagHandleOutline} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="price">
                <span className="span">$39.00</span>
              </div>
            </div>
          </div>
          </a>
        </li>
        <li className="scrollbar-item">
          <a href={'/product/2'}>
          <div className="shop-card">
            <div className="card-banner img-holder" style={{ "--width": 540, "--height": 720 }}>
              <img src={product1} width="540" height="720" loading="lazy" alt="Arabica" className="img-cover" />
              <span className="badge" aria-label="20% off">Bestseller</span>
              <div className="card-actions">
                <button className="action-btn" aria-label="add to cart">
                  <IonIcon icon={bagHandleOutline} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="price">
                <span className="span">$39.00</span>
              </div>
            </div>
          </div>
          </a>
        </li>
      </ul>
    </div>
  </section>
);

export default Shop;
