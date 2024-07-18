// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Create a provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0, quantity: 0 };
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItemToCart = (product, grind, weight) => {
    const existingProduct = cart.items.find(item => item.id === product.id && item.grind === grind && item.weight === weight);
    let updatedCart;
    const productPrice = parseFloat(product.price);  // No need to trim, assuming it's a number

    if (existingProduct) {
      updatedCart = {
        items: cart.items.map(item => 
          item.id === product.id && item.grind === grind && item.weight === weight 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ),
        total: cart.total + productPrice,
        quantity: cart.quantity + 1
      };
    } else {
      updatedCart = {
        items: [...cart.items, { ...product, grind, weight, quantity: 1 }],
        total: cart.total + productPrice,
        quantity: cart.quantity + 1
      };
    }
    setCart(updatedCart);
  };

  const removeItemFromCart = (productId, grind, weight, quantityToRemove) => {
    const productPrice = parseFloat(cart.items.find(item => item.id === productId && item.grind === grind && item.weight === weight).price);
    const existingProduct = cart.items.find(item => item.id === productId && item.grind === grind && item.weight === weight);
    
    if (existingProduct.quantity > quantityToRemove) {
      const updatedCart = {
        items: cart.items.map(item => 
          item.id === productId && item.grind === grind && item.weight === weight 
            ? { ...item, quantity: item.quantity - quantityToRemove } 
            : item
        ),
        total: cart.total - (productPrice * quantityToRemove),
        quantity: cart.quantity - quantityToRemove
      };
      setCart(updatedCart);
    } else {
      const updatedCart = {
        items: cart.items.filter(item => !(item.id === productId && item.grind === grind && item.weight === weight)),
        total: cart.total - (productPrice * existingProduct.quantity),
        quantity: cart.quantity - existingProduct.quantity
      };
      setCart(updatedCart);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItemToCart, removeItemFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Create a hook to use the cart context
export const useCart = () => {
  return useContext(CartContext);
};
