
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { isConfigOnly } from '../utils/productRules';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, options: any) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity: number, options: any) => {
    // GUARD: Check if product requires configuration
    if (isConfigOnly(product)) {
      // Check for valid configuration "signature"
      const hasConfig = options &&
        (options.isConfigured === true || options.width || options.depth || options.sizeKey);

      if (!hasConfig) {
        console.warn('Blocked add-to-cart: Product requires configuration', product.title);
        // In a real app, you might trigger a toast or redirect here.
        // For now, we block and return. The UI should have prevented this.
        return;
      }
    }

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
    setIsCartOpen(true); // Auto-open drawer
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, itemCount, isCartOpen, openCart, closeCart }}>
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
