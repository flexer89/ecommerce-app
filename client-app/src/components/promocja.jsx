import React from 'react';
import product1 from '../assets/images/product-01.png';

const Shop = () => (
  <section className="section shop" id="shop" aria-label="shop" data-section>
    <div className="container">
      <div className="title-wrapper">
        <h2 className="h2 section-title">Nasze Bestsellery</h2>
        <a href="#" className="btn-link">
          <span className="span">Zobacz wszystkie produkty</span>
          <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
        </a>
      </div>
      <ul className="has-scrollbar">
        <li className="scrollbar-item">
          <div className="shop-card">
            <div className="card-banner img-holder" style={{ "--width": 540, "--height": 720 }}>
              <img src={product1} width="540" height="720" loading="lazy" alt="Arabica" className="img-cover" />
              <span className="badge" aria-label="20% off">Bestseller</span>
              <div className="card-actions">
                <button className="action-btn" aria-label="add to cart">
                  <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                </button>
                <button className="action-btn" aria-label="add to wishlist">
                  <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
                </button>
                <button className="action-btn" aria-label="compare">
                  <ion-icon name="repeat-outline" aria-hidden="true"></ion-icon>
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="price">
                <del className="del">$39.00</del>
                <span className="span">$29.00</span>
              </div>
              <h3>
                <a href="#" className="card-title">Arabica</a>
              </h3>
            </div>
          </div>
        </li>
        <li className="scrollbar-item">
          <div className="shop-card">
            <div className="card-banner img-holder" style={{ "--width": 540, "--height": 720 }}>
              <img src={product1} width="540" height="720" loading="lazy" alt="Arabica" className="img-cover" />
              <span className="badge" aria-label="20% off">Bestseller</span>
              <div className="card-actions">
                <button className="action-btn" aria-label="add to cart">
                  <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                </button>
                <button className="action-btn" aria-label="add to wishlist">
                  <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
                </button>
                <button className="action-btn" aria-label="compare">
                  <ion-icon name="repeat-outline" aria-hidden="true"></ion-icon>
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="price">
                <del className="del">$39.00</del>
                <span className="span">$29.00</span>
              </div>
              <h3>
                <a href="#" className="card-title">Arabica</a>
              </h3>
            </div>
          </div>
        </li>
        <li className="scrollbar-item">
          <div className="shop-card">
            <div className="card-banner img-holder" style={{ "--width": 540, "--height": 720 }}>
              <img src={product1} width="540" height="720" loading="lazy" alt="Arabica" className="img-cover" />
              <span className="badge" aria-label="20% off">Bestseller</span>
              <div className="card-actions">
                <button className="action-btn" aria-label="add to cart">
                  <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
                </button>
                <button className="action-btn" aria-label="add to wishlist">
                  <ion-icon name="star-outline" aria-hidden="true"></ion-icon>
                </button>
                <button className="action-btn" aria-label="compare">
                  <ion-icon name="repeat-outline" aria-hidden="true"></ion-icon>
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="price">
                <del className="del">$39.00</del>
                <span className="span">$29.00</span>
              </div>
              <h3>
                <a href="#" className="card-title">Arabica</a>
              </h3>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
);

export default Shop;
