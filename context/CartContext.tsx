
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductConfig, MaatwerkCartPayload } from '../types';
import { validateConfig } from '../utils/configValidation';
import { generateConfigHash } from '../utils/hash';
import { buildRenderSnapshot, type VerandaVisualizationConfig } from '../src/configurator/visual/verandaAssets';
import { normalizeQuantity } from '../src/lib/cart/quantity';
import { addCents, fromCents, mulCents, toCents } from '../src/utils/money';
import {
  fetchShippingQuote,
  toShippingQuote,
  type ShippingMode,
  type ShippingCountry,
  type ShippingAddress,
  type ShippingQuote,
} from '../src/services/shippingQuote';

// =============================================================================
// TYPES
// =============================================================================

export type { ShippingMode, ShippingCountry, ShippingAddress, ShippingQuote };

// Re-export for backward compatibility
export type CountryCode = ShippingCountry;

export interface NormalizedAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface DeliveryAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: ShippingCountry;
  isValidated: boolean;
  normalizedAddress: NormalizedAddress | null;
}

interface ShippingState {
  mode: ShippingMode;
  address: ShippingAddress; // Simple address without validation state
  costCents: number;
  isValid: boolean;
  isLocked: boolean;
  quote: ShippingQuote | null;
  isCalculating: boolean;
  error: string | null;
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
  totalCents: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // Shipping - new quote-based system
  shippingMode: ShippingMode;
  shippingCountry: ShippingCountry;
  shippingAddress: ShippingAddress;
  shippingQuote: ShippingQuote | null;
  shippingCost: number;
  shippingCostCents: number;
  shippingIsValid: boolean;
  shippingIsCalculating: boolean;
  shippingError: string | null;
  isShippingLocked: boolean;
  setShippingMode: (mode: ShippingMode) => void;
  setShippingCountry: (country: ShippingCountry) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  fetchShippingQuote: () => Promise<boolean>;
  clearShippingQuote: () => void;
  lockShipping: () => void;
  unlockShipping: () => void;
  /** Total including shipping */
  grandTotal: number;
  grandTotalCents: number;
  // Legacy aliases (for backward compatibility with AddressDeliverySelector)
  /** @deprecated Use shippingAddress instead */
  shippingAddressLegacy: DeliveryAddress;
  /** @deprecated Use updateShippingCost instead */
  updateShippingCost: (costCents: number, isValid: boolean) => void;
  /** @deprecated Use setShippingAddress instead */
  setShippingAddressLegacy: (address: DeliveryAddress) => void;
  shippingFee: number;
  shippingFeeCents: number;
  shippingPostcode: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// =============================================================================
// CONSTANTS
// =============================================================================

const SHIPPING_STORAGE_KEY = 'hett_shipping_v3';

const DEFAULT_ADDRESS: ShippingAddress = {
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
};

const DEFAULT_LEGACY_ADDRESS: DeliveryAddress = {
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
  country: 'NL',
  isValidated: false,
  normalizedAddress: null,
};

const DEFAULT_SHIPPING_STATE: ShippingState = {
  mode: 'delivery',
  address: DEFAULT_ADDRESS,
  costCents: 0,
  isValid: false,
  isLocked: false,
  quote: null,
  isCalculating: false,
  error: null,
};

// Country is stored separately for persistence
const DEFAULT_COUNTRY: ShippingCountry = 'NL';

// =============================================================================
// STORAGE HELPERS
// =============================================================================

interface StoredShippingState {
  mode: ShippingMode;
  country: ShippingCountry;
  address: ShippingAddress;
  costCents: number;
  isValid: boolean;
  isLocked: boolean;
  quote: ShippingQuote | null;
}

function loadShippingFromStorage(): { shipping: ShippingState; country: ShippingCountry } {
  try {
    const stored = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<StoredShippingState>;
      return {
        shipping: {
          mode: parsed.mode || DEFAULT_SHIPPING_STATE.mode,
          address: {
            street: parsed.address?.street || '',
            houseNumber: parsed.address?.houseNumber || '',
            postalCode: parsed.address?.postalCode || '',
            city: parsed.address?.city || '',
          },
          costCents: parsed.costCents ?? 0,
          isValid: parsed.isValid || false,
          isLocked: parsed.isLocked || false,
          quote: parsed.quote || null,
          isCalculating: false,
          error: null,
        },
        country: parsed.country || DEFAULT_COUNTRY,
      };
    }
  } catch (e) {
    console.warn('Failed to load shipping from storage:', e);
  }
  return { shipping: { ...DEFAULT_SHIPPING_STATE }, country: DEFAULT_COUNTRY };
}

function saveShippingToStorage(state: ShippingState, country: ShippingCountry): void {
  try {
    const toStore: StoredShippingState = {
      mode: state.mode,
      country,
      address: state.address,
      costCents: state.costCents,
      isValid: state.isValid,
      isLocked: state.isLocked,
      quote: state.quote,
    };
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(toStore));
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
  const [shipping, setShipping] = useState<ShippingState>(() => loadShippingFromStorage().shipping);
  const [shippingCountry, setShippingCountryState] = useState<ShippingCountry>(() => loadShippingFromStorage().country);

  // Persist shipping state to storage
  useEffect(() => {
    saveShippingToStorage(shipping, shippingCountry);
  }, [shipping, shippingCountry]);

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

  // Ensure cents fields exist (defensive: older items in memory may not have them)
  const cartWithCents = useMemo(() => {
    return normalizedCart.map((item) => {
      const qty = item.quantity || 1;

      const unitPriceCents =
        typeof item.unitPriceCents === 'number'
          ? item.unitPriceCents
          : (typeof item.priceCents === 'number' ? item.priceCents : toCents(item.price));

      const lineTotalCents =
        typeof item.lineTotalCents === 'number'
          ? item.lineTotalCents
          : mulCents(unitPriceCents, qty);

      return {
        ...item,
        unitPriceCents,
        lineTotalCents,
        // Keep legacy euro fields derived from cents
        price: fromCents(unitPriceCents),
        totalPrice: fromCents(lineTotalCents),
      };
    });
  }, [normalizedCart]);

  // Calculate totals in cents (canonical)
  const totalCents = cartWithCents.reduce((sum, item) => sum + (item.lineTotalCents || 0), 0);
  const total = fromCents(totalCents);
  const itemCount = normalizedCart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Grand total including shipping (only if shipping is valid)
  const grandTotalCents = addCents(totalCents, shipping.isValid ? shipping.costCents : 0);
  const grandTotal = fromCents(grandTotalCents);

  // Shipping setters
  const setShippingMode = useCallback((mode: ShippingMode) => {
    if (shipping.isLocked) return;
    
    if (mode === 'pickup') {
      // Pickup is always free and valid
      setShipping(prev => ({
        ...prev,
        mode,
        costCents: 0,
        isValid: true,
        quote: {
          km: 0,
          price: 0,
          currency: 'EUR',
          formattedPrice: 'Gratis',
          origin: 'Hoppenkuil 17, 5626DD Eindhoven',
          destination: 'Afhalen',
          lastUpdated: Date.now(),
        },
        error: null,
      }));
    } else {
      // Delivery - reset validation until quote is fetched
      setShipping(prev => ({
        ...prev,
        mode,
        isValid: false,
        quote: null,
        error: null,
      }));
    }
  }, [shipping.isLocked]);

  const setShippingCountry = useCallback((country: ShippingCountry) => {
    if (shipping.isLocked) return;
    setShippingCountryState(country);
    // Reset quote when country changes
    setShipping(prev => ({
      ...prev,
      isValid: false,
      quote: null,
      error: null,
    }));
  }, [shipping.isLocked]);
  
  const setShippingAddressNew = useCallback((address: ShippingAddress) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({
      ...prev,
      address,
      isValid: false,
      quote: null,
      error: null,
    }));
  }, [shipping.isLocked]);

  // Fetch shipping quote from API
  const doFetchShippingQuote = useCallback(async (): Promise<boolean> => {
    if (shipping.isLocked) return false;

    // Pickup is always free
    if (shipping.mode === 'pickup') {
      setShipping(prev => ({
        ...prev,
        costCents: 0,
        isValid: true,
        quote: {
          km: 0,
          price: 0,
          currency: 'EUR',
          formattedPrice: 'Gratis',
          origin: 'Hoppenkuil 17, 5626DD Eindhoven',
          destination: 'Afhalen',
          lastUpdated: Date.now(),
        },
        error: null,
      }));
      return true;
    }

    // Validate required fields for delivery
    if (!shipping.address.postalCode || !shipping.address.city) {
      setShipping(prev => ({
        ...prev,
        error: 'Vul postcode en plaats in.',
        isValid: false,
      }));
      return false;
    }

    // Set calculating state
    setShipping(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      const result = await fetchShippingQuote({
        mode: 'delivery',
        country: shippingCountry,
        postalCode: shipping.address.postalCode,
        houseNumber: shipping.address.houseNumber,
        street: shipping.address.street,
        city: shipping.address.city,
      });

      if (result.ok) {
        const quote = toShippingQuote(result);
        setShipping(prev => ({
          ...prev,
          costCents: toCents(result.price),
          isValid: true,
          quote,
          isCalculating: false,
          error: null,
        }));
        return true;
      } else {
        setShipping(prev => ({
          ...prev,
          costCents: 0,
          isValid: false,
          quote: null,
          isCalculating: false,
          error: 'message' in result ? result.message : 'Onbekende fout',
        }));
        return false;
      }
    } catch (error) {
      console.error('[Shipping] Unexpected error:', error);
      setShipping(prev => ({
        ...prev,
        costCents: 0,
        isValid: false,
        quote: null,
        isCalculating: false,
        error: 'Er is een fout opgetreden. Probeer het opnieuw.',
      }));
      return false;
    }
  }, [shipping.isLocked, shipping.mode, shipping.address, shippingCountry]);

  const clearShippingQuote = useCallback(() => {
    if (shipping.isLocked) return;
    setShipping(prev => ({
      ...prev,
      costCents: 0,
      isValid: false,
      quote: null,
      error: null,
    }));
  }, [shipping.isLocked]);

  // Legacy: updateShippingCost for backward compatibility with AddressDeliverySelector
  const updateShippingCost = useCallback((costCents: number, isValid: boolean) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({ ...prev, costCents, isValid }));
  }, [shipping.isLocked]);

  // Legacy: setShippingAddress for backward compatibility with AddressDeliverySelector
  const setShippingAddressLegacy = useCallback((address: DeliveryAddress) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({
      ...prev,
      address: {
        street: address.street,
        houseNumber: (address as any).houseNumber || '',
        postalCode: address.postalCode,
        city: address.city,
      },
    }));
    setShippingCountryState(address.country);
  }, [shipping.isLocked]);

  // Shipping lock/unlock
  const lockShipping = useCallback(() => setShipping(prev => ({ ...prev, isLocked: true })), []);
  const unlockShipping = useCallback(() => setShipping(prev => ({ ...prev, isLocked: false })), []);

  // =========================================================================
  // ADD TO CART - Main entry point
  // =========================================================================

  const addToCart = (product: Product, quantity: number, options: any) => {
    const safeQuantity = normalizeQuantity(quantity);
    const category = product.category;

    // Logging for debugging
    console.log('[CartContext] addToCart called', {
      handle: product.id,
      title: product.title,
      category: category,
      quantity: safeQuantity,
      shopifyVariantId: product.shopifyVariantId,
      options: options,
    });

    // =========================================================================
    // CONFIGURABLE PRODUCTS (verandas, sandwichpanelen)
    // =========================================================================
    if (category === 'verandas' || category === 'sandwichpanelen') {
      const configCandidate = options?.config as ProductConfig | undefined;

      if (!configCandidate) {
        console.warn(`[CartContext] Blocked: ${product.title} requires configuration.`);
        alert('Kies eerst je opties in de configurator voordat je toevoegt aan winkelwagen.');
        return;
      }

      const validation = validateConfig(category, configCandidate);
      if (!validation.ok) {
        console.warn(`[CartContext] Blocked: Invalid config`, validation.errors);
        alert(`Configuratie incompleet: ${validation.errors.join(', ')}`);
        return;
      }

      const configHash = generateConfigHash(configCandidate.data);
      const summary =
        typeof options?.displayConfigSummary === 'string'
          ? options.displayConfigSummary
          : configCandidate.category === 'verandas'
            ? `Dak: ${configCandidate.data.daktype}, Goot: ${configCandidate.data.goot?.charAt(0).toUpperCase() + configCandidate.data.goot?.slice(1) || '-'}, Voorzijde: ${configCandidate.data.voorzijde || 'Geen'}`
            : `Sandwichpaneel`;

      const cartId = `${product.id}-${configHash}`;

      const unitPriceCents = toCents(options.price ?? fromCents(product.priceCents));
      const lineTotalCents = mulCents(unitPriceCents, safeQuantity);

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
        id: cartId,
        slug: product.id,
        type: options?.type,
        quantity: safeQuantity,
        unitPriceCents,
        lineTotalCents,
        price: fromCents(unitPriceCents),
        totalPrice: fromCents(lineTotalCents),
        config: configCandidate,
        configHash,
        displayConfigSummary: summary,
        priceBreakdown: options.priceBreakdown,
        pricing: options.pricing,
        details: options.details,
        render: renderSnapshot,
        selectedColor: 'Configured',
        selectedSize: 'Custom'
      };

      setCart(prev => {
        const existing = prev.find(i => i.id === cartId);
        if (existing) {
          const nextQty = existing.quantity + safeQuantity;
          const nextLineTotalCents = (existing.lineTotalCents || 0) + lineTotalCents;
          return prev.map(i =>
            i.id === cartId
              ? {
                  ...i,
                  quantity: nextQty,
                  unitPriceCents: i.unitPriceCents ?? unitPriceCents,
                  lineTotalCents: nextLineTotalCents,
                  price: fromCents(i.unitPriceCents ?? unitPriceCents),
                  totalPrice: fromCents(nextLineTotalCents),
                }
              : i
          );
        }
        return [...prev, newItem];
      });
      
      console.log('[CartContext] Configured item added to cart:', cartId);
      setIsCartOpen(true);
      return;
    }

    // =========================================================================
    // ACCESSOIRES (and any other simple products)
    // =========================================================================
    // Check for Shopify variant ID - required for Shopify checkout
    if (!product.shopifyVariantId) {
      console.error('[CartContext] ERROR: No shopifyVariantId for accessory:', product.id);
      alert('Dit product heeft geen beschikbare variant in Shopify. Neem contact op met support.');
      return;
    }

    console.log('[CartContext] Adding accessory to cart:', {
      productId: product.id,
      variantId: product.shopifyVariantId,
      quantity: safeQuantity,
      unitPrice: product.price,
    });

    const newItem: CartItem = {
      ...product,
      id: product.id,
      slug: product.id,
      type: 'product',
      quantity: safeQuantity,
      selectedColor: options?.color || 'Standaard',
      selectedSize: options?.size || 'Standaard',
      unitPriceCents: toCents(options?.price ?? fromCents(product.priceCents)),
      lineTotalCents: mulCents(toCents(options?.price ?? fromCents(product.priceCents)), safeQuantity),
      price: fromCents(toCents(options?.price ?? fromCents(product.priceCents))),
      totalPrice: fromCents(mulCents(toCents(options?.price ?? fromCents(product.priceCents)), safeQuantity)),
    };

    setCart(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) {
        console.log('[CartContext] Updating existing item quantity');
        const nextQty = existing.quantity + safeQuantity;
        const nextLineTotalCents = (existing.lineTotalCents || 0) + (newItem.lineTotalCents || 0);
        return prev.map(i =>
          i.id === newItem.id
            ? {
                ...i,
                quantity: nextQty,
                unitPriceCents: i.unitPriceCents ?? newItem.unitPriceCents,
                lineTotalCents: nextLineTotalCents,
                price: fromCents(i.unitPriceCents ?? (newItem.unitPriceCents || 0)),
                totalPrice: fromCents(nextLineTotalCents),
              }
            : i
        );
      }
      console.log('[CartContext] Adding new item to cart');
      return [...prev, newItem];
    });
    
    console.log('[CartContext] Accessory added, opening cart drawer');
    setIsCartOpen(true);
  };

  /**
   * Add a maatwerk veranda item to cart.
   * Maatwerk items are custom-configured verandas not tied to product pages.
   */
  const addMaatwerkToCart = (payload: MaatwerkCartPayload) => {
      const unitPriceCents = toCents(payload.totalPrice);
      const lineTotalCents = mulCents(unitPriceCents, payload.quantity);
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
      shopifyVariantId: payload.shopifyVariantId,
      priceCents: unitPriceCents,
      price: fromCents(unitPriceCents),
      shortDescription: `Maatwerk veranda ${sizeSummary}`,
      description: 'Op maat geconfigureerde aluminium veranda',
      imageUrl: `/renders/veranda/${String(payload.selections.find(s => s.groupId === 'color')?.choiceId || 'ral7016')}/base.png`, // Default preview
      specs: {},
      requiresConfiguration: false, // Already configured

      // Cart item fields
      quantity: payload.quantity,
      unitPriceCents,
      lineTotalCents,
      totalPrice: fromCents(lineTotalCents),

      // Config props
      config: {
        category: 'maatwerk_veranda',
        data: {
          type: 'maatwerk_veranda',
          size: payload.size,
          widthCm: payload.size.width,
          depthCm: payload.size.depth,
          bucketWidthCm: payload.bucketWidthCm,
          bucketDepthCm: payload.bucketDepthCm,
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
            ? {
                ...i,
                quantity: i.quantity + 1,
                unitPriceCents: i.unitPriceCents ?? unitPriceCents,
                lineTotalCents: (i.lineTotalCents || 0) + unitPriceCents,
                price: fromCents(i.unitPriceCents ?? unitPriceCents),
                totalPrice: fromCents((i.lineTotalCents || 0) + unitPriceCents),
              }
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

        const unitPriceCents = item.unitPriceCents ?? toCents(item.price);
        const nextLineTotalCents = mulCents(unitPriceCents, quantity);
        return {
          ...item,
          quantity,
          unitPriceCents,
          lineTotalCents: nextLineTotalCents,
          price: fromCents(unitPriceCents),
          totalPrice: fromCents(nextLineTotalCents),
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
      cart: cartWithCents,
      addToCart,
      addMaatwerkToCart,
      removeFromCart, 
      updateQuantity, 
      updateCartItem, 
      clearCart, 
      total, 
      totalCents,
      itemCount, 
      isCartOpen, 
      openCart, 
      closeCart,
      // Shipping - new quote-based system
      shippingMode: shipping.mode,
      shippingCountry,
      shippingAddress: shipping.address,
      shippingQuote: shipping.quote,
      shippingCostCents: shipping.costCents,
      shippingCost: fromCents(shipping.costCents),
      shippingIsValid: shipping.isValid,
      shippingIsCalculating: shipping.isCalculating,
      shippingError: shipping.error,
      isShippingLocked: shipping.isLocked,
      setShippingMode,
      setShippingCountry,
      setShippingAddress: setShippingAddressNew,
      fetchShippingQuote: doFetchShippingQuote,
      clearShippingQuote,
      lockShipping,
      unlockShipping,
      grandTotal,
      grandTotalCents,
      // Legacy aliases (for backward compatibility with AddressDeliverySelector)
      shippingAddressLegacy: {
        ...DEFAULT_LEGACY_ADDRESS,
        street: shipping.address.street,
        houseNumber: shipping.address.houseNumber,
        postalCode: shipping.address.postalCode,
        city: shipping.address.city,
        country: shippingCountry,
        isValidated: shipping.isValid,
      },
      updateShippingCost,
      setShippingAddressLegacy,
      shippingFeeCents: shipping.costCents,
      shippingFee: fromCents(shipping.costCents),
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
