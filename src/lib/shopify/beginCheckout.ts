/**
 * Shopify Checkout Integration
 * Syncs local cart to Shopify and redirects to checkout
 */

import { createCart, resetCart, isShopifyConfigured, ShopifyError } from './index';
import type { CartLineInput } from './types';
import type { CartItem } from '../../../types';
import { resolveMerchandiseForCartItem } from '../../shopify/shopifyMerchandiseMap';
import { toShopifyLineAttributes } from '../../services/config/formatConfigAttributes';
import { isShippingLineItem, type ShippingLineItem } from '../../services/shipping';

// =============================================================================
// MAIN CHECKOUT FUNCTION
// =============================================================================

export interface BeginCheckoutOptions {
  /** Called before Shopify API call */
  onStart?: () => void;
  /** Called after cart created, before redirect */
  onCartCreated?: (cartId: string, checkoutUrl: string) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Local cart items to sync (including shipping line if present) */
  cartItems: CartItem[];
  /** Optional: clear local cart after successful redirect setup */
  clearLocalCart?: () => void;
}

export interface BeginCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  cartId?: string;
  error?: string;
}

/**
 * Begin Shopify checkout flow:
 * 1. Creates a fresh Shopify cart with all local items
 * 2. Returns the checkout URL for redirect
 * 
 * Note: We create a fresh cart each time to ensure sync.
 * Cart ID is persisted for potential recovery.
 */
export async function beginCheckout(
  options: BeginCheckoutOptions
): Promise<BeginCheckoutResult> {
  const { cartItems, onStart, onCartCreated, onError, clearLocalCart } = options;
  
  // Validate configuration
  if (!isShopifyConfigured()) {
    const error = new Error('Shopify is not configured. Please check environment variables.');
    onError?.(error);
    return { success: false, error: error.message };
  }
  
  // Validate cart has items
  if (!cartItems || cartItems.length === 0) {
    const error = new Error('Cart is empty');
    onError?.(error);
    return { success: false, error: error.message };
  }
  
  onStart?.();
  
  try {
    // Reset any existing cart - we'll create fresh
    resetCart();
    
    // Build cart lines from local cart
    const lines: CartLineInput[] = [];
    
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      
      // Special handling for shipping line item
      if (isShippingLineItem(item)) {
        const shippingItem = item as ShippingLineItem;
        const meta = shippingItem.shippingMeta;
        
        // Build shipping-specific attributes
        const shippingAttributes = [
          { key: 'shipping_method', value: meta.method },
          { key: 'destination_country', value: meta.country },
          { key: 'destination_postcode', value: meta.postalCode },
          { key: 'destination_house_number', value: meta.houseNumber || '' },
          { key: 'distance_km', value: meta.distanceKm.toFixed(2) },
          { key: 'shipping_total_eur', value: (shippingItem.lineTotalCents! / 100).toFixed(2) },
        ];
        
        console.log('[beginCheckout] shipping line', {
          title: shippingItem.title,
          variantId: shippingItem.shopifyVariantId,
          quantity: shippingItem.quantity,
          attributes: shippingAttributes,
        });
        
        lines.push({
          merchandiseId: shippingItem.shopifyVariantId!,
          quantity: shippingItem.quantity,
          attributes: shippingAttributes,
        });
        
        continue;
      }
      
      // Regular product items
      const { mappingKey, merchandiseId } = resolveMerchandiseForCartItem(item);
      
      // Use new clean attribute formatter
      const attributes = toShopifyLineAttributes(item);

      // Debug helper (requested)
      console.log('[beginCheckout] item', {
        title: item.title,
        internalType: item.type,
        slug: item.slug,
        category: item.category,
        mappingKey,
        merchandiseId,
        attributeCount: attributes.length,
      });

      lines.push({
        merchandiseId,
        quantity: item.quantity,
        attributes: attributes.length > 0 ? attributes : undefined,
      });
    }
    
    if (lines.length === 0) {
      throw new Error('No valid items could be added to Shopify cart');
    }
    
    // Create Shopify cart with all lines
    const cart = await createCart(lines);
    
    if (!cart.checkoutUrl) {
      throw new Error('Shopify did not return a checkout URL');
    }
    
    onCartCreated?.(cart.id, cart.checkoutUrl);
    
    return {
      success: true,
      checkoutUrl: cart.checkoutUrl,
      cartId: cart.id,
    };
    
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error during checkout');
    console.error('[beginCheckout] Failed:', error);
    onError?.(error);
    
    return {
      success: false,
      error: error instanceof ShopifyError 
        ? `Shopify error: ${error.message}` 
        : error.message,
    };
  }
}

/**
 * Redirect to Shopify checkout
 * Convenience wrapper that handles the full flow
 */
export async function redirectToShopifyCheckout(
  cartItems: CartItem[],
  clearLocalCart?: () => void
): Promise<void> {
  const result = await beginCheckout({
    cartItems,
    onError: (err) => console.error('[Checkout] Error:', err),
  });
  
  if (result.success && result.checkoutUrl) {
    // Clear local cart before redirect
    clearLocalCart?.();
    // Redirect to Shopify checkout
    window.location.href = result.checkoutUrl;
  } else {
    throw new Error(result.error || 'Failed to create checkout');
  }
}
