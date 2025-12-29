
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CartItem, Product, ProductConfig, MaatwerkCartPayload } from '../types';
import { validateConfig } from '../utils/configValidation';
import { generateConfigHash } from '../utils/hash';
import { buildRenderSnapshot, type VerandaVisualizationConfig } from '../src/configurator/visual/verandaAssets';

// =============================================================================
// TYPES
// =============================================================================

export type ShippingMethod = 'pickup' | 'delivery';
export type CountryCode = 'NL' | 'BE' | 'DE';

export interface NormalizedAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface DeliveryAddress {
  street: string;
  postalCode: string;
  city: string;
  country: CountryCode;
  isValidated: boolean;
  normalizedAddress: NormalizedAddress | null;
}

interface ShippingState {
  method: ShippingMethod;
  address: DeliveryAddress;
  cost: number;
  isValid: boolean;
  isLocked: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, options: any) => void;
  addMaatwerkToCart: (payload: MaatwerkCartPayload) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  /** Update an existing cart item by index or by line-item id */
  updateCartItem: (lineItemIdOrIndex: number | string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // Shipping - address-based system with Google validation
  shippingMethod: ShippingMethod;
  shippingAddress: DeliveryAddress;
  shippingCost: number;
  shippingIsValid: boolean;
  isShippingLocked: boolean;
  setShippingMethod: (method: ShippingMethod) => void;
  setShippingAddress: (address: DeliveryAddress) => void;
  updateShippingCost: (cost: number, isValid: boolean) => void;
  lockShipping: () => void;
  unlockShipping: () => void;
  /** Total including shipping */
  grandTotal: number;
  // Legacy aliases (for backward compatibility)
  shippingCountry: CountryCode | null;
  shippingFee: number;
  shippingPostcode: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// =============================================================================
// CONSTANTS
// =============================================================================

const SHIPPING_STORAGE_KEY = 'hett_shipping_v2';

const DEFAULT_ADDRESS: DeliveryAddress = {
  street: '',
  postalCode: '',
  city: '',
  country: 'NL',
  isValidated: false,
  normalizedAddress: null,
};

const DEFAULT_SHIPPING_STATE: ShippingState = {
  method: 'delivery',
  address: DEFAULT_ADDRESS,
  cost: 0,
  isValid: false,
  isLocked: false,
};

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
        address: {
          street: parsed.address?.street || '',
          postalCode: parsed.address?.postalCode || '',
          city: parsed.address?.city || '',
          country: parsed.address?.country || 'NL',
          isValidated: parsed.address?.isValidated || false,
          normalizedAddress: parsed.address?.normalizedAddress || null,
        },
        cost: parsed.cost || 0,
        isValid: parsed.isValid || false,
        isLocked: parsed.isLocked || false,
      };
    }
  } catch (e) {
    console.warn('Failed to load shipping from storage:', e);
  }
  return { ...DEFAULT_SHIPPING_STATE };
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

  // Normalize maatwerk items for backward compatibility (no mutation)
  const normalizedCart = useMemo(() => {
    return cart.map((item) => {
      if (!item?.maatwerkPayload) return item;

      const data: any = item.config?.category === 'maatwerk_veranda' ? (item.config.data as any) : undefined;
      const width = data?.widthCm ?? data?.size?.width ?? item.maatwerkPayload?.size?.width;
      const depth = data?.depthCm ?? data?.size?.depth ?? item.maatwerkPayload?.size?.depth;

      return {
        ...item,
        type: item.type || 'custom_veranda',
        config:
          item.config?.category === 'maatwerk_veranda'
            ? {
                ...item.config,
                data: {
                  ...(item.config.data as any),
                  widthCm: typeof width === 'number' ? width : (item.config.data as any)?.widthCm,
                  depthCm: typeof depth === 'number' ? depth : (item.config.data as any)?.depthCm,
                },
              }
            : item.config,
      };
    });
  }, [cart]);

  // Calculate totals
  const total = normalizedCart.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = normalizedCart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Grand total including shipping (only if shipping is valid)
  const grandTotal = total + (shipping.isValid ? shipping.cost : 0);

  // Shipping setters (guarded by lock)
  const setShippingMethod = (method: ShippingMethod) => {
    if (shipping.isLocked) return;
    
    // If switching to pickup, mark as valid with 0 cost
    if (method === 'pickup') {
      setShipping(prev => ({
        ...prev,
        method,
        cost: 0,
        isValid: true,
      }));
    } else {
      // If switching to delivery, use address validation state
      setShipping(prev => ({
        ...prev,
        method,
        isValid: prev.address.isValidated,
        cost: prev.address.isValidated ? prev.cost : 0,
      }));
    }
  };
  
  const setShippingAddress = (address: DeliveryAddress) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({ ...prev, address }));
  };

  const updateShippingCost = (cost: number, isValid: boolean) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({ ...prev, cost, isValid }));
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

  /**
   * Add a maatwerk veranda item to cart.
   * Maatwerk items are custom-configured verandas not tied to product pages.
   */
  const addMaatwerkToCart = (payload: MaatwerkCartPayload) => {
    // Generate unique cart ID based on configuration
    const configString = JSON.stringify({
      size: payload.size,
      selections: payload.selections.map(s => s.choiceId).sort(),
    });
    const cartId = `maatwerk-${generateConfigHash({ data: configString })}`;

    // Build display summary
    const sizeSummary = `${payload.size.width}×${payload.size.depth}cm`;
    const optionsSummary = payload.selections
      .filter(s => s.choiceId !== 'geen' && s.price >= 0)
      .slice(0, 3)
      .map(s => s.choiceLabel)
      .join(', ');
    const displaySummary = `${sizeSummary} • ${optionsSummary}${payload.selections.length > 3 ? '...' : ''}`;

    const newItem: CartItem = {
      // Required contract flag
      type: 'custom_veranda',
      // Product-like fields for cart compatibility
      id: cartId,
      slug: 'maatwerk-veranda',
      title: payload.title,
      category: 'verandas', // Use verandas category for cart display logic
      price: payload.totalPrice,
      shortDescription: `Maatwerk veranda ${sizeSummary}`,
      description: 'Op maat geconfigureerde aluminium veranda',
      imageUrl: `/renders/veranda/${String(payload.selections.find(s => s.groupId === 'color')?.choiceId || 'ral7016')}/base.png`, // Default preview
      specs: {},
      requiresConfiguration: false, // Already configured

      // Cart item fields
      quantity: payload.quantity,
      totalPrice: payload.totalPrice,

      // Config props
      config: {
        category: 'maatwerk_veranda',
        data: {
          type: 'maatwerk_veranda',
          size: payload.size,
          widthCm: payload.size.width,
          depthCm: payload.size.depth,
          color: payload.selections.find(s => s.groupId === 'color')?.choiceId || 'ral7016',
          daktype: payload.selections.find(s => s.groupId === 'daktype')?.choiceId || '',
          goot: payload.selections.find(s => s.groupId === 'goot')?.choiceId || '',
          zijwand_links: payload.selections.find(s => s.groupId === 'zijwand_links')?.choiceId || 'geen',
          zijwand_rechts: payload.selections.find(s => s.groupId === 'zijwand_rechts')?.choiceId || 'geen',
          voorzijde: payload.selections.find(s => s.groupId === 'voorzijde')?.choiceId || 'geen',
          verlichting: payload.selections.some(s => s.groupId === 'verlichting'),
        },
      },
      configHash: cartId,
      displayConfigSummary: displaySummary,

      // Maatwerk-specific payload for breakdown display
      maatwerkPayload: payload,
      priceBreakdown: payload.priceBreakdown,

      // Details for legacy display
      details: [
        { label: 'Afmeting', value: sizeSummary },
        ...payload.selections.map(s => ({ label: s.groupLabel, value: s.choiceLabel })),
      ],
    };

    setCart(prev => {
      // Check if same configuration exists
      const existing = prev.find(i => i.id === cartId);
      if (existing) {
        return prev.map(i => 
          i.id === cartId 
            ? { ...i, quantity: i.quantity + 1, totalPrice: i.totalPrice + payload.totalPrice } 
            : i
        );
      }
      return [...prev, newItem];
    });

    // Note: We don't auto-open cart here - caller should handle that
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
  const updateCartItem = (lineItemIdOrIndex: number | string, updates: Partial<CartItem>) => {
    setCart(prev => {
      const index =
        typeof lineItemIdOrIndex === 'number'
          ? lineItemIdOrIndex
          : prev.findIndex(i => i.id === lineItemIdOrIndex);

      if (index < 0) return prev;

      return prev.map((item, i) => {
        if (i !== index) return item;
        return { ...item, ...updates };
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ 
      cart: normalizedCart, 
      addToCart,
      addMaatwerkToCart,
      removeFromCart, 
      updateQuantity, 
      updateCartItem, 
      clearCart, 
      total, 
      itemCount, 
      isCartOpen, 
      openCart, 
      closeCart,
      // Shipping - address-based system with Google validation
      shippingMethod: shipping.method,
      shippingAddress: shipping.address,
      shippingCost: shipping.cost,
      shippingIsValid: shipping.isValid,
      isShippingLocked: shipping.isLocked,
      setShippingMethod,
      setShippingAddress,
      updateShippingCost,
      lockShipping,
      unlockShipping,
      grandTotal,
      // Legacy aliases (for backward compatibility)
      shippingCountry: shipping.address.isValidated ? shipping.address.country : null,
      shippingFee: shipping.cost,
      shippingPostcode: shipping.address.postalCode,
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
