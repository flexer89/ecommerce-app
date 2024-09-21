import React from 'react';
import ProductsServiceClient from '../clients/ProductsService';
import '../assets/style/style.css'; 

const ProductCard = ({ product, onClick, onEdit, onDelete }) => {

  const handleDelete = (productId) => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć ten produkt?");
    if (confirmDelete) {
      try {
        ProductsServiceClient.delete(`/delete/${productId}`);
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      } catch (error) { 
        console.error('Error deleting product:', error);
      }

      window.location.reload();
    }
  };

  return (
    <div className="product-card">
      {product.discount > 0 && (
        <div className="discount-badge">
          Przecena! -{product.discount * 100}%
        </div>
      )}
      
      <div className="product-card-image-container" onClick={onClick}>
        <img src={product.image} alt={product.name} className="product-card-image" />
        <h2 className="product-card-title">{product.name}</h2>
        <p className="product-card-price">{(product.price - product.price * product.discount).toFixed(2)} zł</p>
      </div>
      <div className="product-card-actions">
        <a href={`/product/${product.id}`} className="product-card-link">Podgląd</a>
      </div>
    </div>
  );
};

export default ProductCard;


