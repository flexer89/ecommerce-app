// src/pages/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import axios from 'axios';
import '../assets/style/style.css';

const CartPage = () => {
  const { cart, removeItemFromCart } = useCart();
  const { isLogin } = useKeycloakAuth();
  const navigate = useNavigate();
  const [cartItemsWithImages, setCartItemsWithImages] = useState([]);

  useEffect(() => {
    const fetchProductImages = async () => {
      const itemsWithImages = await Promise.all(cart.items.map(async (item) => {
        try {
          const imageResponse = await axios.get(`https://jolszak.test/api/products/download/${item.id}`, {
            responseType: 'arraybuffer'
          });
          const base64Image = btoa(
            new Uint8Array(imageResponse.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return { ...item, image: `data:image/${item.file_extension};base64,${base64Image}` };
        } catch (error) {
          console.error(`Error fetching image for product ${item.id}:`, error);
          return { ...item, image: null };
        }
      }));
      setCartItemsWithImages(itemsWithImages);
    };

    fetchProductImages();
  }, [cart.items]);

  const handleRemoveFromCart = (id, grind, weight, quantity) => {
    removeItemFromCart(id, grind, weight, quantity);
  };

  const handleCheckout = () => {
    if (isLogin) {
      navigate('/checkout');
    } else {
      navigate('/login-or-register');
    }
  };

  return (
    <div className="cart-page">
      <div className='container'>
        <h1>Twój koszyk</h1>
        {cart.items.length === 0 ? (
          <p>Twój koszyk jest pusty</p>
        ) : (
          <div className="cart-items">
            {cartItemsWithImages.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                ) : (
                  <div className='cart-item-no-image'>No image available</div>
                )}
                <div className="cart-item-details-text">
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <p>Stopień zmielenia: {item.grind}</p>
                  <p>Waga: {item.weight}</p>
                  <p>Cena jednostkowa: {item.price}</p>
                  <p>Ilość: {item.quantity}</p>
                  <p>Cena całkowita: {(parseFloat(item.price) * item.quantity).toFixed(2)} zł</p>
                </div>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => handleRemoveFromCart(item.id, item.grind, item.weight, 1)}>Usuń 1</button>
                  <button onClick={() => handleRemoveFromCart(item.id, item.grind, item.weight, -1)}>Dodaj 1</button>
                  <button onClick={() => handleRemoveFromCart(item.id, item.grind, item.weight, item.quantity)}>Usuń wszystkie</button>
                </div>
              </div>
            ))}
            <div className="cart-total">
              <h2>Cena: {cart.total.toFixed(2)} zł</h2>
            </div>
            <button className="checkout-button" onClick={handleCheckout}>Przejdź do zapłaty</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
