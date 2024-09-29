import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/style.css';

const CartPage = () => {
  const { cart, removeItemFromCart, addItemToCart } = useCart();
  const { isLogin } = useKeycloakAuth();
  const navigate = useNavigate();
  const [cartItemsWithImages, setCartItemsWithImages] = useState([]);

  useEffect(() => {
    const fetchProductImages = async () => {
      const itemsWithImages = await Promise.all(cart.items.map(async (item) => {
        try {
          const imageResponse = await axios.get(`https://jolszak.test/api/products/download/bin/${item.id}`, {
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
    toast.success(`Usunięto ${quantity} sztuk produktu z koszyka!`, { autoClose: 3000 });
  };

  const handleAddToCart = (item) => {
    // Call addItemToCart with the full item object, grind, and weight
    addItemToCart(item, item.grind, item.weight);
    toast.success(`Dodano 1 sztukę ${item.name} do koszyka!`, { autoClose: 3000 });
  };

  const handleClearCart = (id, grind, weight) => {
    removeItemFromCart(id, grind, weight, cart.items.find(item => item.id === id).quantity);
    toast.success('Usunięto wszystkie produkty z koszyka!', { autoClose: 3000 });
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
      <ToastContainer />
      <div className='container'>
        <h1>Twój koszyk</h1>
        {cart.items.length === 0 ? (
          <p>Twój koszyk jest pusty</p>
        ) : (
          <div className="cart-items">
            {cartItemsWithImages.map((item) => (
              // Use a composite key combining id, weight, and grind
              <div key={`${item.id}-${item.weight}-${item.grind}`} className="cart-item">
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
                    <p>Cena jednostkowa: {item.price.toFixed(2)} zł</p>
                    <p>Ilość: {item.quantity}</p>
                    <p>Cena całkowita: {(parseFloat(item.price) * item.quantity).toFixed(2)} zł</p>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => handleRemoveFromCart(item.id, item.grind, item.weight, 1)}>Usuń 1</button>
                  <button onClick={() => handleAddToCart(item)}>Dodaj 1</button>
                  <button onClick={() => handleClearCart(item.id, item.grind, item.weight)}>Usuń wszystkie</button>
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
