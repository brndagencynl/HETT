
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, options: any) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity: number, options: any) => {
    const newItem: CartItem = {
      ...product,
      quantity,
      selectedColor: options.color,
      selectedSize: options.size,
      selectedRoof: options.roof,
      details: options.details,
      totalPrice: (options.price || product.price) * quantity
    };
    setCart([...cart, newItem]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
