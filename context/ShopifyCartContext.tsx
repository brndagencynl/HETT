/**
 * Shopify Cart React Context
 * Provides React-friendly cart operations with Shopify Storefront API
 * Can work alongside or replace the existing local CartContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCart,
  addToCart as shopifyAddToCart,
  addLinesToCart,
  updateCartLine,
  removeCartLine,
  clearCart as shopifyClearCart,
  resetCart,
  isShopifyConfigured,
} from '../src/lib/shopify';
import type {
  ShopifyCart,
  ShopifyCartLine,
  ShopifyCartLineAttribute,
  CartLineInput,
} from '../src/lib/shopify/types';
import {
  getConfigType,
  getPreviewImageUrl,
  formatAttributesForDisplay,
  hasConfiguration,
  type ConfigType,
} from '../src/lib/shopify/attributeHelpers';

// =============================================================================
// TYPES
// =============================================================================

export interface ShopifyCartItem {
  id: string; // Line ID
  variantId: string;
  productId: string;
  productHandle: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl: string | null;
  previewImageUrl: string | null;
  attributes: ShopifyCartLineAttribute[];
  configType: ConfigType | null;
  displayDetails: Array<{ label: string; value: string }>;
  isConfigured: boolean;
}

interface ShopifyCartContextType {
  // State
  cart: ShopifyCart | null;
  items: ShopifyCartItem[];
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  
  // Computed
  totalQuantity: number;
  subtotal: number;
  total: number;
  checkoutUrl: string | null;
  
  // Actions
  addItem: (
    variantId: string,
    quantity?: number,
    attributes?: ShopifyCartLineAttribute[]
  ) => Promise<void>;
  addItems: (lines: CartLineInput[]) => Promise<void>;
  updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Checkout
  redirectToCheckout: () => void;
}

const ShopifyCartContext = createContext<ShopifyCartContextType | undefined>(undefined);

// =============================================================================
// HELPERS
// =============================================================================

function transformCartLine(line: ShopifyCartLine): ShopifyCartItem {
  const price = parseFloat(line.cost.amountPerQuantity.amount);
  const totalPrice = parseFloat(line.cost.totalAmount.amount);
  const configType = getConfigType(line.attributes);
  const previewImageUrl = getPreviewImageUrl(line.attributes);
  const displayDetails = formatAttributesForDisplay(line.attributes);
  
  return {
    id: line.id,
    variantId: line.merchandise.id,
    productId: line.merchandise.product.id,
    productHandle: line.merchandise.product.handle,
    title: line.merchandise.product.title,
    variantTitle: line.merchandise.title,
    quantity: line.quantity,
    price,
    totalPrice,
    imageUrl: previewImageUrl || line.merchandise.image?.url || line.merchandise.product.featuredImage?.url || null,
    previewImageUrl,
    attributes: line.attributes,
    configType,
    displayDetails,
    isConfigured: hasConfiguration(line.attributes),
  };
}

// =============================================================================
// PROVIDER
// =============================================================================

export const ShopifyCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isConfigured = isShopifyConfigured();

  // Transform cart lines to our item format
  const items = useMemo(() => {
    if (!cart) return [];
    return cart.lines.edges.map(edge => transformCartLine(edge.node));
  }, [cart]);

  // Computed values
  const totalQuantity = cart?.totalQuantity ?? 0;
  const subtotal = cart ? parseFloat(cart.cost.subtotalAmount.amount) : 0;
  const total = cart ? parseFloat(cart.cost.totalAmount.amount) : 0;
  const checkoutUrl = cart?.checkoutUrl ?? null;

  // Load cart on mount
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadCart = async () => {
      try {
        const existingCart = await getCart();
        setCart(existingCart);
      } catch (err) {
        console.error('[ShopifyCart] Failed to load cart:', err);
        setError('Failed to load cart');
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isConfigured]);

  // Add single item
  const addItem = useCallback(async (
    variantId: string,
    quantity: number = 1,
    attributes: ShopifyCartLineAttribute[] = []
  ) => {
    if (!isConfigured) {
      setError('Shopify not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await shopifyAddToCart(variantId, quantity, attributes);
      setCart(updatedCart);
    } catch (err) {
      console.error('[ShopifyCart] Add item failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // Add multiple items
  const addItems = useCallback(async (lines: CartLineInput[]) => {
    if (!isConfigured) {
      setError('Shopify not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await addLinesToCart(lines);
      setCart(updatedCart);
    } catch (err) {
      console.error('[ShopifyCart] Add items failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add items');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // Update item quantity
  const updateItemQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (!isConfigured || !cart) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await updateCartLine(lineId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error('[ShopifyCart] Update quantity failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, cart]);

  // Remove item
  const removeItem = useCallback(async (lineId: string) => {
    if (!isConfigured || !cart) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await removeCartLine(lineId);
      setCart(updatedCart);
    } catch (err) {
      console.error('[ShopifyCart] Remove item failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, cart]);

  // Clear cart
  const clearCartAction = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const clearedCart = await shopifyClearCart();
      setCart(clearedCart);
    } catch (err) {
      console.error('[ShopifyCart] Clear cart failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      // Still reset local state
      resetCart();
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const refreshedCart = await getCart();
      setCart(refreshedCart);
    } catch (err) {
      console.error('[ShopifyCart] Refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh cart');
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  // Redirect to Shopify checkout
  const redirectToCheckout = useCallback(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      setError('No checkout URL available');
    }
  }, [checkoutUrl]);

  const value = useMemo(() => ({
    cart,
    items,
    isLoading,
    error,
    isConfigured,
    totalQuantity,
    subtotal,
    total,
    checkoutUrl,
    addItem,
    addItems,
    updateItemQuantity,
    removeItem,
    clearCart: clearCartAction,
    refreshCart,
    redirectToCheckout,
  }), [
    cart,
    items,
    isLoading,
    error,
    isConfigured,
    totalQuantity,
    subtotal,
    total,
    checkoutUrl,
    addItem,
    addItems,
    updateItemQuantity,
    removeItem,
    clearCartAction,
    refreshCart,
    redirectToCheckout,
  ]);

  return (
    <ShopifyCartContext.Provider value={value}>
      {children}
    </ShopifyCartContext.Provider>
  );
};

// =============================================================================
// HOOK
// =============================================================================

export function useShopifyCart(): ShopifyCartContextType {
  const context = useContext(ShopifyCartContext);
  if (!context) {
    throw new Error('useShopifyCart must be used within a ShopifyCartProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not within provider
 * Useful for components that might render outside the provider
 */
export function useShopifyCartOptional(): ShopifyCartContextType | null {
  return useContext(ShopifyCartContext) ?? null;
}
