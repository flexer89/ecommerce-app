import React from 'react';
import '../assets/style/style.css';

const ProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <img src={product.image} alt={product.name} className="product-image" />
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
