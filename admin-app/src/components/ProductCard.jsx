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
      <div className="product-card-image-container" onClick={onClick}>
        <img src={product.image} alt={product.name} className="product-card-image" />
        <h2 className="product-card-title">{product.name}</h2>
        <p className="product-card-price">{product.price.toFixed(2)} zł</p>
      </div>
      <div className="product-card-actions">
        <button onClick={() => onEdit(product.id)} className="product-card-link">Edytuj</button>
        <button onClick={() => handleDelete(product.id)} className="product-card-link btn-delete">Usuń</button>
      </div>
    </div>
  );
};

export default ProductCard;
