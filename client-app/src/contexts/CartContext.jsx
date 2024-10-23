import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import CartServiceClient from '../clients/CartsService';
import { useKeycloakAuth } from './KeycloakContext';
import getKeycloak from '../auth/keycloak';
import { v4 as uuidv4 } from 'uuid';

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

  const addItemToCart = async (product, weight) => {
    let productPrice = parseFloat(product.price * (product.discount > 0 ? (1 - product.discount) : 1));
    if (weight === 500) {
      productPrice *= 2;
    }

    const itemToAdd = {
      ...product,
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

  const removeItemFromCart = async (productId, weight, quantityToRemove) => {
    const existingProduct = cart.items.find(
      (item) => item.id === productId && item.weight === weight
    );
    if (!existingProduct) return;

    try {
      await CartServiceClient.post(`/remove/${cartId}`, {
        product_id: productId,
        quantity: quantityToRemove,
        weight,
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item from backend cart:', error);
    }
  };

  const deleteCart = async () => {
    try {
      await CartServiceClient.delete(`/delete/${cartId}`);
      setCart({ items: [], total: 0, quantity: 0 });
    } catch (error) {
      console.error('Error deleting cart:', error);
    }
  }

  return (
    <CartContext.Provider value={{ cart, addItemToCart, removeItemFromCart, fetchCart, deleteCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
