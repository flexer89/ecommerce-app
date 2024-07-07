// src/components/ProductPageComponent.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../assets/style/style.css';

import image1 from '../assets/images/product-01.png';

const products = [
  { id: 1, name: '111', price: '£7.95', description: 'Blackcurrant • Lemongrass • Wine', image: image1 },
  { id: 2, name: '222', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 3, name: '333', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 4, name: '444', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 5, name: '555', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 6, name: '666', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 7, name: '777', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 8, name: '888', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  { id: 9, name: '999', price: '£8.95', description: 'Orange • Cocoa • Nutmeg', image: image1 },
  // Add more mocked products here
];

const ProductPageComponent = () => {
  const { id } = useParams();
  const { addItemToCart } = useCart();
  const product = products.find((p) => p.id === parseInt(id));

  const [selectedGrind, setSelectedGrind] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);

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

  return (
    <div className="product-page">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
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
              onClick={() => handleGrindClick('Whole bean')}
            >
              Whole bean
            </button>
            <button 
              className={selectedGrind === 'Grubo mielone' ? 'selected' : ''} 
              onClick={() => handleGrindClick('Coarse')}
            >
              Grubo mielone
            </button>
            <button 
              className={selectedGrind === 'Mocno zmielone' ? 'selected' : ''} 
              onClick={() => handleGrindClick('Fine')}
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
