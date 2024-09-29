import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import CartServiceClient from '../clients/CartsService';
import { useKeycloakAuth } from './KeycloakContext';
import getKeycloak from '../auth/keycloak';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID library

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isLogin } = useKeycloakAuth();
  const keycloakMemo = useMemo(() => getKeycloak(), [isLogin]); // Memoize keycloak
  const [cart, setCart] = useState({ items: [], total: 0, quantity: 0 });
  const [cartId, setCartId] = useState(null); // Store the cart ID (UUID or user ID)

  // Generate or retrieve a temporary cart ID for unauthenticated users
  useEffect(() => {
    if (!isLogin) {
      let tempCartId = localStorage.getItem('tempCartId');
      if (!tempCartId) {
        tempCartId = uuidv4(); // Generate a new UUID
        localStorage.setItem('tempCartId', tempCartId);
      }
      setCartId(tempCartId);
    } 
    else {
      localStorage.setItem('tempCartId', keycloakMemo.subject);
      setCartId(keycloakMemo.subject);
    }
  }, [isLogin, keycloakMemo]);

  // Fetch the cart from the backend
  const fetchCart = useCallback(async () => {
    try {
      const response = await CartServiceClient.get(`/get/${cartId}`);

      // If the cart is not found, initialize an empty one
      if (response.status === 404) {
        setCart({ items: [], total: 0, quantity: 0 });
        return;
      }

      // Set the cart state with the data from the backend
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [cartId]);

  // Fetch the cart whenever the cartId changes or is set
  useEffect(() => {
    if (cartId) {
      fetchCart();
    }
  }, [cartId, fetchCart]);

  const addItemToCart = async (product, grind, weight) => {
    let productPrice = parseFloat(product.price * (product.discount > 0 ? (1 - product.discount) : 1));
    if (weight === '500g') {
      productPrice *= 2;
    }
  
    const itemToAdd = {
      ...product,
      grind,
      weight,
      price: productPrice,
      quantity: 1,
    };
  
    try {
      await CartServiceClient.post(`/add/${cartId}`, {
        items: [itemToAdd],
      });
      fetchCart();
    } catch (error) {
      console.error('Error adding item to backend cart:', error);
    }
  };

  const removeItemFromCart = async (productId, grind, weight, quantityToRemove) => {
    const existingProduct = cart.items.find(
      (item) => item.id === productId && item.grind === grind && item.weight === weight
    );
    if (!existingProduct) return;

    try {
      await CartServiceClient.post(`/remove/${cartId}`, {
        product_id: productId,
        quantity: quantityToRemove,
        grind,
        weight,
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item from backend cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItemToCart, removeItemFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
