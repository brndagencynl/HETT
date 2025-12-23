
import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product, ProductConfig } from '../types';
import { validateConfig } from '../utils/configValidation';
import { generateConfigHash } from '../utils/hash';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, options: any) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // NOTE: Cart is intentionally NOT persisted (no localStorage/sessionStorage)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // New imports needed at top:
  // import { validateConfig } from '../utils/configValidation';
  // import { generateConfigHash } from '../utils/hash';
  // import { ProductConfig } from '../types';

  const addToCart = (product: Product, quantity: number, options: any) => {
    // 1. Determine Category
    const category = product.category;

    // 2. Strict Guard for Configurable Categories
    if (category === 'verandas' || category === 'sandwichpanelen') {
      // "options" here is expected to be the ProductConfig object or contain it. 
      // Adapting to existing usage: usually "options" passed was a mix. 
      // We now expect the caller to pass the full `ProductConfig` wrapper or we construct it?
      // The prompt says: "Cart line items must include... config object".
      // Let's assume the `options` argument CONTAINS the `config` property if coming from new flow,
      // OR we try to construct it from legacy args if possible (but we want strict).

      // Let's expect `options.config` to be the `ProductConfig` type.
      const configCandidate = options?.config as ProductConfig | undefined;

      if (!configCandidate) {
        console.warn(`Blocked add-to-cart: ${product.title} requires configuration.`);
        alert('Kies eerst je opties in de configurator before adding to cart.');
        return;
      }

      const validation = validateConfig(category, configCandidate);
      if (!validation.ok) {
        console.warn(`Blocked add-to-cart: Invalid config`, validation.errors);
        alert(`Configuratie incompleet: ${validation.errors.join(', ')}`);
        return;
      }

      // 3. Compute Hash
      const configHash = generateConfigHash(configCandidate.data);

      // 4. Create summary string
      // Logic to create a readable string from config data
      // For now simple JSON dump or specific field map
      const summary = configCandidate.category === 'verandas'
        ? `Dak: ${configCandidate.data.daktype}, Goot: ${configCandidate.data.goot?.charAt(0).toUpperCase() + configCandidate.data.goot?.slice(1) || '-'}, Voorzijde: ${configCandidate.data.voorzijde || 'Geen'}`
        : `Sandwichpaneel`; // todo better summary

      // 5. Add/Update Item
      // Check if item with same ID AND same Hash exists?
      // Actually, simple cart usually just adds. Duplicate ID might merge quantity.
      // With hash, we treat them as unique variants. 
      // Let's generate a unique cart ID: product.id + hash
      const cartId = `${product.id}-${configHash}`;

      const newItem: CartItem = {
        ...product,
        id: cartId, // Override ID for cart uniqueness
        slug: product.id, // Keep original slug/id ref
        quantity,
        totalPrice: (options.price || product.price) * quantity,
        config: configCandidate,
        configHash,
        displayConfigSummary: summary,
        // Legacy mapping for UI safety until updated
        selectedColor: 'Configured',
        selectedSize: 'Custom'
      };

      // If exists, update quantity? Or just append?
      // Simple append for now or merge
      setCart(prev => {
        const existing = prev.find(i => i.id === cartId);
        if (existing) {
          return prev.map(i => i.id === cartId ? { ...i, quantity: i.quantity + quantity, totalPrice: i.totalPrice + (newItem.totalPrice) } : i);
        }
        return [...prev, newItem];
      });
      setIsCartOpen(true);
      return;
    }

    // 3. Accessoires (Pass-through)
    if (category === 'accessoires') {
      const newItem: CartItem = {
        ...product,
        id: product.id, // Simple ID
        slug: product.id,
        quantity,
        selectedColor: options.color || 'N/A',
        selectedSize: options.size || 'N/A',
        totalPrice: (options.price || product.price) * quantity,
      };
      setCart(prev => {
        const existing = prev.find(i => i.id === newItem.id);
        if (existing) {
          return prev.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + quantity, totalPrice: i.totalPrice + newItem.totalPrice } : i);
        }
        return [...prev, newItem];
      });
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return;

    setCart(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const currentQty = item.quantity || 1;
        const unitPrice = currentQty > 0 ? item.totalPrice / currentQty : item.totalPrice;
        return {
          ...item,
          quantity,
          totalPrice: unitPrice * quantity,
        };
      })
    );
  };

  /**
   * Update an existing cart item with new values (used for editing configurations).
   * Preserves the item's position in cart and updates only the provided fields.
   */
  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    if (index < 0) return;

    setCart(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return { ...item, ...updates };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateCartItem, clearCart, total, itemCount, isCartOpen, openCart, closeCart }}>
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
