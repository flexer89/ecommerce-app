// src/components/ProductPageComponent.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import '../assets/style/style.css';

const ProductPageComponent = () => {
  const { id } = useParams();
  const { addItemToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedGrind, setSelectedGrind] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`https://jolszak.test/api/products/getbyid/${id}`);
        const productData = response.data;

        // Fetch image separately if needed
        const imageResponse = await axios.get(`https://jolszak.test/api/products/download/${id}`, {
          responseType: 'arraybuffer'
        });
        const base64Image = btoa(
          new Uint8Array(imageResponse.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        productData.image = base64Image;

        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleGrindClick = (grind) => {
    setSelectedGrind(grind);
    console.log(`Selected Grind: ${grind}`);
  };

  const handleWeightClick = (weight) => {
    setSelectedWeight(weight);
    console.log(`Selected Weight: ${weight}`);
  };

  const handleAddToCart = () => {
    if (selectedGrind && selectedWeight) {
      addItemToCart(product, selectedGrind, selectedWeight);
      console.log(`Added to cart: ${product.name}, Grind: ${selectedGrind}, Weight: ${selectedWeight}`);
    } else {
      alert("Please select grind and weight options.");
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-page">
      <div className="product-image">
        {product.image ? (
          <img src={`data:image/${product.file_extension};base64,${product.image}`} alt={product.name} />
        ) : (
          <div>No image available</div>
        )}
      </div>
      <div className="product-details">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>{product.price}</p>
        <div className="product-options">
          <div className="option-group">
            <h2>Grind</h2>
            <button 
              className={selectedGrind === 'Całe ziarna' ? 'selected' : ''} 
              onClick={() => handleGrindClick('Całe ziarna')}
            >
              Całe ziarna
            </button>
            <button 
              className={selectedGrind === 'Grubo mielone' ? 'selected' : ''} 
              onClick={() => handleGrindClick('Grubo mielone')}
            >
              Grubo mielone
            </button>
            <button 
              className={selectedGrind === 'Mocno zmielone' ? 'selected' : ''} 
              onClick={() => handleGrindClick('Mocno zmielone')}
            >
              Mocno zmielone
            </button>
          </div>
          <div className="option-group">
            <h2>Weight</h2>
            <button 
              className={selectedWeight === '250g' ? 'selected' : ''} 
              onClick={() => handleWeightClick('250g')}
            >
              250g
            </button>
            <button 
              className={selectedWeight === '500g' ? 'selected' : ''} 
              onClick={() => handleWeightClick('500g')}
            >
              500g
            </button>
          </div>
        </div>
        <div className="product-actions">
          <button onClick={handleAddToCart}>Dodaj do koszyka</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPageComponent;
