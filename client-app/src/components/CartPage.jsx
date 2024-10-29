import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useKeycloakAuth } from '../contexts/KeycloakContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductsServiceClient from '../clients/ProductsService';
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

  const handleRemoveFromCart = async (id, weight, quantity) => {
    // call update-quantity to update stock (if we remove from cart, we add to stock)
    // Create the items payload as expected by the API
    // check if product is in cart

    const updateQuantityPayload = {
      items: [
        {
          product_id: id,
          quantity: weight === 500 ? -2 : -1 // If weight is 500g, set quantity as 2, otherwise 1
        }
      ]
    };

    // Make the API call to check and update the product quantity
    const response = await ProductsServiceClient.post(`/update-quantity`, updateQuantityPayload);
    console.log(response);
    if (response.status !== 200) {
      toast.error('Nie udało się zaktualizować stanu magazynowego!', { autoClose: 3000 });
      return;
    }
    removeItemFromCart(id, weight, quantity);
    toast.success(`Usunięto ${quantity} sztuk produktu z koszyka!`, { autoClose: 3000 });
  };

const handleAddToCart = async (item) => {
  try {
    // Fetch the latest stock info before adding to the cart
    const response = await ProductsServiceClient.get(`/getbyid/${item.id}`);
    const productData = response.data;

    // Check if adding this item would exceed available stock
    const cartItem = cart.items.find(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.weight === item.weight
    );

    const quantityInCart = cartItem ? cartItem.quantity : 0;
    const newQuantity = quantityInCart + 1;

    if (newQuantity > productData.stock) {
      toast.error('Przekroczono dostępny stan magazynowy!', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Add the item to the cart if the stock check passes
    addItemToCart(item, item.weight);
    toast.success(`Dodano 1 sztukę ${item.name} do koszyka!`, {
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (error) {
    console.error('Error fetching product data:', error);
    toast.error('Wystąpił błąd podczas dodawania do koszyka.', {
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};


const handleClearCart = async (id, weight) => {
  // Find the item in the cart to determine its quantity
  const cartItem = cart.items.find(item => item.id === id && item.weight === weight);
  const quantityToRemove = cartItem ? cartItem.quantity : 0;

  if (quantityToRemove === 0) {
    toast.error('Nie ma produktów do usunięcia.', { autoClose: 3000 });
    return;
  }

  try {
    // Create the payload to update the stock by adding back the removed quantity
    const updateQuantityPayload = {
      items: [
        {
          product_id: id,
          quantity: weight === 500 ? -2 * quantityToRemove : -1 * quantityToRemove,
        },
      ],
    };

    // Make the API call to update the stock quantity
    const response = await ProductsServiceClient.post(`/update-quantity`, updateQuantityPayload);

    if (response.status !== 200) {
      toast.error('Nie udało się zaktualizować stanu magazynowego!', { autoClose: 3000 });
      return;
    }

    // Remove the item from the cart after the stock update
    removeItemFromCart(id, weight, quantityToRemove);
    toast.success('Usunięto wszystkie produkty z koszyka!', { autoClose: 3000 });
  } catch (error) {
    console.error('Error updating stock when clearing cart:', error);
    toast.error('Wystąpił błąd podczas usuwania produktów z koszyka.', {
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
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
              <div key={`${item.id}-${item.weight}`} className="cart-item">
                <div className="cart-item-details">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                  ) : (
                    <div className='cart-item-no-image'>No image available</div>
                  )}
                  <div className="cart-item-details-text">
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <p>Waga: {item.weight}g</p>
                    <p>Cena jednostkowa: {item.price.toFixed(2)} zł</p>
                    <p>Ilość: {item.quantity}</p>
                    <p>Cena całkowita: {(parseFloat(item.price) * item.quantity).toFixed(2)} zł</p>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => handleRemoveFromCart(item.id, item.weight, 1)}>Usuń 1</button>
                  <button onClick={() => handleAddToCart(item)}>Dodaj 1</button>
                  <button onClick={() => handleClearCart(item.id, item.weight)}>Usuń wszystkie</button>
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
