
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CartItem, Product, ProductConfig } from '../types';
import { validateConfig } from '../utils/configValidation';
import { generateConfigHash } from '../utils/hash';
import { buildRenderSnapshot, type VerandaVisualizationConfig } from '../src/configurator/visual/verandaAssets';
import { 
  type ShippingMethod, 
  type CountryCode, 
  getShippingCost,
  validateShipping,
  SHIPPING_STORAGE_KEY,
  DEFAULT_SHIPPING_STATE,
} from '../src/utils/shipping';

// =============================================================================
// TYPES
// =============================================================================

interface ShippingState {
  method: ShippingMethod;
  postcode: string;
  country: CountryCode | null;
  cost: number;
  isValid: boolean;
  isLocked: boolean;
}

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
  // Shipping - new postcode-based system
  shippingMethod: ShippingMethod;
  shippingPostcode: string;
  shippingCountry: CountryCode | null;
  shippingCost: number;
  shippingIsValid: boolean;
  isShippingLocked: boolean;
  setShippingMethod: (method: ShippingMethod) => void;
  setShippingPostcode: (postcode: string) => void;
  updateShippingValidation: (isValid: boolean, country: CountryCode | null, cost: number) => void;
  lockShipping: () => void;
  unlockShipping: () => void;
  /** Total including shipping */
  grandTotal: number;
  // Legacy aliases (for backward compatibility)
  shippingCountry: CountryCode | null;
  shippingFee: number;
  setShippingCountry: (country: CountryCode) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// =============================================================================
// STORAGE HELPERS
// =============================================================================

function loadShippingFromStorage(): ShippingState {
  try {
    const stored = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        method: parsed.method || DEFAULT_SHIPPING_STATE.method,
        postcode: parsed.postcode || '',
        country: parsed.country || null,
        cost: parsed.cost || 0,
        isValid: parsed.isValid || false,
        isLocked: parsed.isLocked || false,
      };
    }
  } catch (e) {
    console.warn('Failed to load shipping from storage:', e);
  }
  return { ...DEFAULT_SHIPPING_STATE, isLocked: false };
}

function saveShippingToStorage(state: ShippingState): void {
  try {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save shipping to storage:', e);
  }
}

// =============================================================================
// PROVIDER
// =============================================================================

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // NOTE: Cart is intentionally NOT persisted (no localStorage/sessionStorage)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Shipping state - loaded from storage
  const [shipping, setShipping] = useState<ShippingState>(() => loadShippingFromStorage());

  // Persist shipping state to storage
  useEffect(() => {
    saveShippingToStorage(shipping);
  }, [shipping]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Calculate totals
  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Grand total including shipping (only if shipping is valid)
  const grandTotal = total + (shipping.isValid ? shipping.cost : 0);

  // Shipping setters (guarded by lock)
  const setShippingMethod = (method: ShippingMethod) => {
    if (shipping.isLocked) return;
    // Re-validate with new method
    const result = validateShipping(method, shipping.postcode);
    setShipping(prev => ({
      ...prev,
      method,
      isValid: result.isValid,
      country: result.country,
      cost: result.cost,
    }));
  };
  
  const setShippingPostcode = (postcode: string) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({ ...prev, postcode }));
  };

  const updateShippingValidation = (isValid: boolean, country: CountryCode | null, cost: number) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({ ...prev, isValid, country, cost }));
  };

  // Legacy setter for backward compatibility
  const setShippingCountry = (country: CountryCode) => {
    if (shipping.isLocked) return;
    const cost = getShippingCost('delivery', country);
    setShipping(prev => ({ ...prev, country, cost, isValid: true }));
  };

  // Shipping lock/unlock
  const lockShipping = () => setShipping(prev => ({ ...prev, isLocked: true }));
  const unlockShipping = () => setShipping(prev => ({ ...prev, isLocked: false }));

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

      // 6. Compute render snapshot for verandas (visual preview in cart/checkout)
      let renderSnapshot: CartItem['render'] | undefined;
      if (configCandidate.category === 'verandas') {
        const visualConfig: VerandaVisualizationConfig = {
          color: (configCandidate.data.color || configCandidate.data.kleur) as any,
          daktype: configCandidate.data.daktype,
          goot: configCandidate.data.goot,
          zijwand_links: configCandidate.data.zijwand_links,
          zijwand_rechts: configCandidate.data.zijwand_rechts,
          voorzijde: configCandidate.data.voorzijde,
          verlichting: configCandidate.data.verlichting,
        };
        renderSnapshot = buildRenderSnapshot(visualConfig);
      }

      const newItem: CartItem = {
        ...product,
        id: cartId, // Override ID for cart uniqueness
        slug: product.id, // Keep original slug/id ref
        quantity,
        totalPrice: (options.price || product.price) * quantity,
        config: configCandidate,
        configHash,
        displayConfigSummary: summary,
        // Store detailed breakdown for config popup
        priceBreakdown: options.priceBreakdown,
        details: options.details,
        // Store render snapshot for visual preview
        render: renderSnapshot,
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
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateCartItem, 
      clearCart, 
      total, 
      itemCount, 
      isCartOpen, 
      openCart, 
      closeCart,
      // Shipping - new postcode-based system
      shippingMethod: shipping.method,
      shippingPostcode: shipping.postcode,
      shippingCountry: shipping.country,
      shippingCost: shipping.cost,
      shippingIsValid: shipping.isValid,
      isShippingLocked: shipping.isLocked,
      setShippingMethod,
      setShippingPostcode,
      updateShippingValidation,
      lockShipping,
      unlockShipping,
      grandTotal,
      // Legacy aliases
      shippingFee: shipping.cost,
      setShippingCountry,
    }}>
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
