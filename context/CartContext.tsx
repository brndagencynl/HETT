
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductConfig, MaatwerkCartPayload } from '../types';
import { validateConfig } from '../utils/configValidation';
import { generateConfigHash } from '../utils/hash';
import { buildRenderSnapshot, type VerandaVisualizationConfig } from '../src/configurator/visual/verandaAssets';
import { normalizeQuantity } from '../src/lib/cart/quantity';
import { addCents, fromCents, mulCents, toCents } from '../src/utils/money';
import {
  fetchShippingQuote,
  type ShippingMode,
} from '../src/services/shippingQuote';
import {
  type ShippingCountry,
  getShippingProduct,
  calculateShippingFromDistance,
  createShippingLineItem,
  isShippingLineItem,
  findShippingLine,
  getProductsOnly,
  type ShippingLineItem,
  type ShippingQuoteResult,
} from '../src/services/shipping';
// Use shared LED addon service for both standard and maatwerk configurators
import {
  getLedSpotCountForWidthCm,
  extractWidthFromHandle,
  extractWidthFromSize,
  extractWidthFromCartItem,
  hasLedEnabled,
  LED_UNIT_PRICE_CENTS,
  isLedConfigured,
  type LedLineItem,
  type LedCartItem,
} from '../src/services/addons/led';

// =============================================================================
// TYPES
// =============================================================================

export type { ShippingMode, ShippingCountry, ShippingLineItem, ShippingQuoteResult };

// Re-export for backward compatibility
export type CountryCode = ShippingCountry;

export interface ShippingAddress {
  street: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalCode: string;
  city: string;
}

export { isShippingLineItem, findShippingLine, getProductsOnly };

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
  country: ShippingCountry;
  address: ShippingAddress;
  isLocked: boolean;
  isCalculating: boolean;
  error: string | null;
}

interface CartContextType {
  /** Full cart including shipping line item */
  cart: CartItem[];
  /** Cart items without shipping line item (products only) */
  cartProducts: CartItem[];
  /** Shipping line item if exists */
  shippingLineItem: ShippingLineItem | null;
  /** LED spots line item (auto-computed from veranda items with verlichting) */
  ledLineItem: LedLineItem | null;
  addToCart: (product: Product, quantity: number, options: any) => void;
  addMaatwerkToCart: (payload: MaatwerkCartPayload) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  /** Update an existing cart item by index or by line-item id */
  updateCartItem: (lineItemIdOrIndex: number | string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  /** Products subtotal (excluding shipping) */
  subtotal: number;
  subtotalCents: number;
  /** @deprecated Use subtotal instead */
  total: number;
  /** @deprecated Use subtotalCents instead */
  totalCents: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // Shipping - new line item based system
  shippingMode: ShippingMode;
  shippingCountry: ShippingCountry;
  shippingAddress: ShippingAddress;
  shippingQuote: ShippingQuoteResult | null;
  shippingCost: number;
  shippingCostCents: number;
  shippingIsValid: boolean;
  shippingIsCalculating: boolean;
  shippingError: string | null;
  isShippingLocked: boolean;
  setShippingMode: (mode: ShippingMode) => void;
  setShippingCountry: (country: ShippingCountry) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  /** Calculate shipping and add/update shipping line item in cart */
  calculateAndApplyShipping: () => Promise<boolean>;
  /** Remove shipping line item from cart */
  removeShippingLine: () => void;
  lockShipping: () => void;
  unlockShipping: () => void;
  /** Total including shipping line item */
  grandTotal: number;
  grandTotalCents: number;
  // Legacy aliases (for backward compatibility with AddressDeliverySelector)
  /** @deprecated Use shippingAddress instead */
  shippingAddressLegacy: DeliveryAddress;
  /** @deprecated Use calculateAndApplyShipping instead */
  updateShippingCost: (costCents: number, isValid: boolean) => void;
  /** @deprecated Use setShippingAddress instead */
  setShippingAddressLegacy: (address: DeliveryAddress) => void;
  /** @deprecated Use calculateAndApplyShipping instead */
  fetchShippingQuote: () => Promise<boolean>;
  /** @deprecated Use removeShippingLine instead */
  clearShippingQuote: () => void;
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
  country: 'NL',
  address: DEFAULT_ADDRESS,
  isLocked: false,
  isCalculating: false,
  error: null,
};

// =============================================================================
// STORAGE HELPERS
// =============================================================================

interface StoredShippingState {
  mode: ShippingMode;
  country: ShippingCountry;
  address: ShippingAddress;
  isLocked: boolean;
}

function loadShippingFromStorage(): ShippingState {
  try {
    const stored = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<StoredShippingState>;
      return {
        mode: parsed.mode || DEFAULT_SHIPPING_STATE.mode,
        country: parsed.country || DEFAULT_SHIPPING_STATE.country,
        address: {
          street: parsed.address?.street || '',
          houseNumber: parsed.address?.houseNumber || '',
          postalCode: parsed.address?.postalCode || '',
          city: parsed.address?.city || '',
        },
        isLocked: parsed.isLocked || false,
        isCalculating: false,
        error: null,
      };
    }
  } catch (e) {
    console.warn('Failed to load shipping from storage:', e);
  }
  return { ...DEFAULT_SHIPPING_STATE };
}

function saveShippingToStorage(state: ShippingState): void {
  try {
    const toStore: StoredShippingState = {
      mode: state.mode,
      country: state.country,
      address: state.address,
      isLocked: state.isLocked,
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
  const [shipping, setShipping] = useState<ShippingState>(() => loadShippingFromStorage());

  // Persist shipping state to storage
  useEffect(() => {
    saveShippingToStorage(shipping);
  }, [shipping]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Separate products and shipping line item
  const cartProducts = useMemo(() => getProductsOnly(cart), [cart]);
  const shippingLineItem = useMemo(() => findShippingLine(cart) || null, [cart]);
  
  // Shipping quote from line item
  const shippingQuote = useMemo<ShippingQuoteResult | null>(() => {
    if (!shippingLineItem?.shippingMeta) return null;
    return {
      distanceKm: shippingLineItem.shippingMeta.distanceKm,
      quantityKm: shippingLineItem.shippingMeta.quantityKm,
      totalCents: shippingLineItem.lineTotalCents || 0,
      totalEur: fromCents(shippingLineItem.lineTotalCents || 0),
    };
  }, [shippingLineItem]);

  // Normalize maatwerk items for backward compatibility (no mutation)
  // Only process product items, not shipping line
  const normalizedCart = useMemo(() => {
    return cartProducts.map((item) => {
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
  }, [cartProducts]);

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

  // ==========================================================================
  // LED SPOTS LINE (computed from veranda items with verlichting)
  // Uses shared LED addon service for both standard and maatwerk configurators
  // ==========================================================================
  const ledLineItem = useMemo<LedLineItem | null>(() => {
    console.log('[CartContext LED] Computing LED line item...');
    const parentItems: LedLineItem['parentItems'] = [];
    
    for (const item of cartWithCents) {
      const identifier = item.handle || item.slug || item.id || 'unknown';
      
      // Create LedCartItem for shared helpers (cast to any for type compatibility)
      const ledItem: LedCartItem = {
        id: item.id,
        handle: item.handle,
        slug: item.slug,
        type: item.type,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        config: item.config as any,
        maatwerkPayload: item.maatwerkPayload as any,
      };
      
      // Use shared helper to check if LED is enabled
      if (!hasLedEnabled(ledItem)) {
        console.log(`[CartContext LED] ${identifier}: LED not enabled, skipping`);
        continue;
      }
      
      // Determine config type
      const configType = item.type === 'custom_veranda' ? 'maatwerk' : 
                        item.config?.category === 'maatwerk_veranda' ? 'maatwerk' : 'veranda';
      
      // Use shared helper to extract width
      const widthCm = extractWidthFromCartItem(ledItem);
      
      if (widthCm) {
        const ledQty = getLedSpotCountForWidthCm(widthCm);
        if (ledQty === 0) {
          console.log(`[CartContext LED] ${identifier}: no LED mapping for width=${widthCm}cm, skipping`);
          continue;
        }
        console.log(`[CartContext LED] ${identifier}: type=${configType}, width=${widthCm}cm, qty=${ledQty}`);
        parentItems.push({
          handle: identifier,
          configType,
          widthCm,
          itemQuantity: item.quantity,
          ledQty,
        });
      } else {
        console.log(`[CartContext LED] ${identifier}: LED enabled but no width found, skipping`);
      }
    }
    
    if (parentItems.length === 0) {
      console.log('[CartContext LED] No LED items found');
      return null;
    }
    
    // Calculate total LED quantity
    const totalQty = parentItems.reduce((sum, p) => sum + (p.ledQty * p.itemQuantity), 0);
    const lineTotalCents = mulCents(LED_UNIT_PRICE_CENTS, totalQty);
    
    console.log(`[CartContext LED] Total: ${totalQty} spots, ${fromCents(lineTotalCents)} EUR`);
    
    return {
      id: 'auto-led',
      type: 'led-spots',
      title: 'LED verlichting (spots)',
      quantity: totalQty,
      unitPriceCents: LED_UNIT_PRICE_CENTS,
      lineTotalCents,
      readonly: true,
      source: 'auto-led',
      parentItems,
    };
  }, [cartWithCents]);

  // Calculate totals in cents (products only - canonical)
  const productSubtotalCents = cartWithCents.reduce((sum, item) => sum + (item.lineTotalCents || 0), 0);
  // Add LED line to subtotal
  const ledTotalCents = ledLineItem?.lineTotalCents || 0;
  const subtotalCents = addCents(productSubtotalCents, ledTotalCents);
  const subtotal = fromCents(subtotalCents);
  // Legacy aliases
  const totalCents = subtotalCents;
  const total = subtotal;
  
  // Item count (products only, not shipping)
  const itemCount = normalizedCart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Shipping costs from line item
  const shippingCostCents = shippingLineItem?.lineTotalCents || 0;
  const shippingCost = fromCents(shippingCostCents);
  const shippingIsValid = shippingLineItem !== null || shipping.mode === 'pickup';
  
  // Grand total = products + shipping
  const grandTotalCents = addCents(subtotalCents, shippingCostCents);
  const grandTotal = fromCents(grandTotalCents);

  // Shipping setters
  const setShippingMode = useCallback((mode: ShippingMode) => {
    if (shipping.isLocked) return;
    
    setShipping(prev => ({
      ...prev,
      mode,
      error: null,
    }));
    
    // Remove shipping line when switching modes
    setCart(prev => prev.filter(item => !isShippingLineItem(item)));
  }, [shipping.isLocked]);

  const setShippingCountry = useCallback((country: ShippingCountry) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({
      ...prev,
      country,
      error: null,
    }));
    // Remove shipping line when country changes
    setCart(prev => prev.filter(item => !isShippingLineItem(item)));
  }, [shipping.isLocked]);
  
  const setShippingAddressNew = useCallback((address: ShippingAddress) => {
    if (shipping.isLocked) return;
    setShipping(prev => ({
      ...prev,
      address,
      error: null,
    }));
    // Remove shipping line when address changes
    setCart(prev => prev.filter(item => !isShippingLineItem(item)));
  }, [shipping.isLocked]);

  // Remove shipping line item from cart
  const removeShippingLine = useCallback(() => {
    setCart(prev => prev.filter(item => !isShippingLineItem(item)));
  }, []);

  // Calculate and apply shipping as cart line item
  const calculateAndApplyShipping = useCallback(async (): Promise<boolean> => {
    if (shipping.isLocked) return false;

    // Pickup mode: no shipping line needed
    if (shipping.mode === 'pickup') {
      // Remove any existing shipping line
      setCart(prev => prev.filter(item => !isShippingLineItem(item)));
      return true;
    }

    // NL delivery: free shipping, no line needed
    if (shipping.country === 'NL') {
      setCart(prev => prev.filter(item => !isShippingLineItem(item)));
      return true;
    }

    // BE/DE delivery: calculate distance and add shipping line
    // Validate required fields
    if (!shipping.address.postalCode) {
      setShipping(prev => ({
        ...prev,
        error: 'Vul een postcode in.',
      }));
      return false;
    }

    // Set calculating state
    setShipping(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      // Fetch distance from Google API
      const result = await fetchShippingQuote({
        mode: 'delivery',
        country: shipping.country,
        postalCode: shipping.address.postalCode,
        houseNumber: shipping.address.houseNumber,
        street: shipping.address.street,
        city: shipping.address.city,
      });

      if (!result.ok) {
        setShipping(prev => ({
          ...prev,
          isCalculating: false,
          error: 'message' in result ? result.message : 'Kan afstand niet berekenen. Controleer het adres.',
        }));
        return false;
      }

      // Get shipping product from Shopify
      const shippingProduct = await getShippingProduct();
      if (!shippingProduct) {
        setShipping(prev => ({
          ...prev,
          isCalculating: false,
          error: 'Verzendkosten product niet gevonden. Neem contact op met support.',
        }));
        return false;
      }

      // Calculate quantity and create line item
      // result.km is the distance from Google API
      const quoteResult = calculateShippingFromDistance(result.km, shipping.country);
      
      // Create the shipping selection for line item metadata
      const selection = {
        method: 'delivery' as const,
        country: shipping.country,
        postalCode: shipping.address.postalCode,
        houseNumber: shipping.address.houseNumber,
        street: shipping.address.street,
        city: shipping.address.city,
      };
      
      const shippingLine = createShippingLineItem(shippingProduct, quoteResult, selection);

      // Add or update shipping line in cart (only if there's a cost)
      setCart(prev => {
        // Remove any existing shipping line
        const withoutShipping = prev.filter(item => !isShippingLineItem(item));
        // Add new shipping line if not null (has cost)
        if (shippingLine) {
          return [...withoutShipping, shippingLine];
        }
        return withoutShipping;
      });

      setShipping(prev => ({
        ...prev,
        isCalculating: false,
        error: null,
      }));

      console.log('[Shipping] Applied shipping line:', {
        distanceKm: quoteResult.distanceKm,
        quantityKm: quoteResult.quantityKm,
        totalCents: quoteResult.totalCents,
        totalEur: quoteResult.totalEur,
      });

      return true;
    } catch (error) {
      console.error('[Shipping] Error:', error);
      setShipping(prev => ({
        ...prev,
        isCalculating: false,
        error: error instanceof Error ? error.message : 'Er is een fout opgetreden.',
      }));
      return false;
    }
  }, [shipping.isLocked, shipping.mode, shipping.country, shipping.address]);

  // Legacy: clearShippingQuote - now just removes shipping line
  const clearShippingQuote = useCallback(() => {
    if (shipping.isLocked) return;
    setCart(prev => prev.filter(item => !isShippingLineItem(item)));
  }, [shipping.isLocked]);

  // Legacy: updateShippingCost - deprecated, does nothing now
  const updateShippingCost = useCallback((_costCents: number, _isValid: boolean) => {
    console.warn('[Shipping] updateShippingCost is deprecated. Use calculateAndApplyShipping instead.');
  }, []);

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
      country: address.country,
      error: null,
    }));
    // Remove shipping line when address changes
    setCart(prev => prev.filter(item => !isShippingLineItem(item)));
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

      // NOTE: options.price from configurator includes options surcharge.
      // At Shopify checkout, main product line uses Shopify variant price (base),
      // and surcharge lines add option costs separately.
      // For LOCAL cart display, we use the full price (base + options) so users
      // see accurate totals. The InlineSurchargeBreakdown component shows the
      // breakdown of what's included.
      const unitPriceCents = toCents(options.price ?? fromCents(product.priceCents));
      const lineTotalCents = mulCents(unitPriceCents, safeQuantity);
      
      // Store base price for reference (used by bundle grouping utility)
      const basePriceCents = product.priceCents;

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
      imageUrl: `/renders/veranda/${String(payload.selections.find(s => s.groupId === 'color')?.choiceId || 'ral7016')}/base.webp`, // Default preview
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

  // Build the full cart with cents for export (includes shipping line)
  const fullCartWithCents = useMemo(() => {
    // Combine product items with shipping line if exists
    if (shippingLineItem) {
      return [...cartWithCents, shippingLineItem];
    }
    return cartWithCents;
  }, [cartWithCents, shippingLineItem]);

  return (
    <CartContext.Provider value={{ 
      cart: fullCartWithCents,
      cartProducts: cartWithCents,
      shippingLineItem,
      ledLineItem,
      addToCart,
      addMaatwerkToCart,
      removeFromCart, 
      updateQuantity, 
      updateCartItem, 
      clearCart, 
      subtotal,
      subtotalCents,
      total,
      totalCents,
      itemCount, 
      isCartOpen, 
      openCart, 
      closeCart,
      // Shipping - new line item based system
      shippingMode: shipping.mode,
      shippingCountry: shipping.country,
      shippingAddress: shipping.address,
      shippingQuote,
      shippingCostCents,
      shippingCost,
      shippingIsValid,
      shippingIsCalculating: shipping.isCalculating,
      shippingError: shipping.error,
      isShippingLocked: shipping.isLocked,
      setShippingMode,
      setShippingCountry,
      setShippingAddress: setShippingAddressNew,
      calculateAndApplyShipping,
      removeShippingLine,
      lockShipping,
      unlockShipping,
      grandTotal,
      grandTotalCents,
      // Legacy aliases
      shippingAddressLegacy: {
        ...DEFAULT_LEGACY_ADDRESS,
        street: shipping.address.street,
        houseNumber: shipping.address.houseNumber,
        postalCode: shipping.address.postalCode,
        city: shipping.address.city,
        country: shipping.country,
        isValidated: shippingIsValid,
      },
      updateShippingCost,
      setShippingAddressLegacy,
      fetchShippingQuote: calculateAndApplyShipping,
      clearShippingQuote,
      shippingFeeCents: shippingCostCents,
      shippingFee: shippingCost,
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
