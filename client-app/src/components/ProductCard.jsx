import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/style.css';

const ProductCard = ({ product, onClick, isBestseller }) => {
  // Check if the product is available based on its stock
  const isAvailable = product.stock > 0;

  return (
    <div className="product-card">
      {product.discount > 0 && (
        <div className="discount-badge">
          Przecena! -{product.discount * 100}%
        </div>
      )}

      <div className="product-card-image-container" onClick={isAvailable ? onClick : null}>
        <img src={product.image} alt={product.name} className="product-card-image" />
        {!isAvailable && (
          <div className="unavailable-overlay">
            Niedostępny
          </div>
        )}
        {isBestseller && <span className="card-badge">Bestseller</span>}
        <h2 className="product-card-title">{product.name}</h2>
        <p className="product-card-price">
          {(product.price - product.price * product.discount).toFixed(2)} zł
        </p>
      </div>
      <div className="product-card-actions">
        <Link to={`/product/${product.id}`} className="product-card-link">Podgląd</Link>
      </div>
    </div>
  );
};

export default ProductCard;
