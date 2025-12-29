
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { filterVisibleProducts } from '../src/catalog/productVisibility';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Get only visible products for initial wishlist
const visibleProducts = filterVisibleProducts(PRODUCTS);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hett_wishlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we only store valid products
        setWishlist(Array.isArray(parsed) ? parsed.filter(p => p && p.id) : []);
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    } else {
        // Initialize with valid visible products for demo purposes
        setWishlist(visibleProducts.slice(0, 2));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('hett_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    if (product && !isInWishlist(product.id)) {
        setWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(wishlist.filter(p => p && p.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p && p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (!product) return;
    if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
    } else {
        addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
