import React from 'react';
import '../assets/style/style.css'; 

const ProductCard = ({ product }) => (
  <div className="product-card">
    <a href={`/product/${product.id}`}>
        <img src={product.image} alt={product.name} className="product-card-image" />
        <h2 className="product-card-title">{product.name}</h2>
        <p className="product-card-price">{product.price}</p>
        <a href={`/product/${product.id}`} className="product-card-link">Podgląd</a>
    </a>
  </div>
);

export default ProductCard;
