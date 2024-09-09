import React from 'react';
import '../assets/style/style.css'; 

const ProductCard = ({ product, onClick }) => (
  <div className="product-card" onClick={onClick}>
      <img src={product.image} alt={product.name} className="product-card-image" />
      <h2 className="product-card-title">{product.name}</h2>
      <p className="product-card-price">{product.price.toFixed(2)} zł</p>
      <a href={`/product/${product.id}`} className="product-card-link">Podgląd</a>
  </div>
);

export default ProductCard;
