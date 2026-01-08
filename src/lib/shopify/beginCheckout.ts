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
// Use shared LED addon service
import {
  getLedSpotCountForWidthCm,
  extractWidthFromHandle,
  extractWidthFromSize,
  buildLedCartLine,
  isLedConfigured,
  extractWidthFromCartItem,
  hasLedEnabled,
  type LedCartItem,
} from '../../services/addons/led';
// Configuration surcharge lines (Route A)
import {
  buildConfigSurchargeLines,
} from '../../services/configSurchargeLines';

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
    
    // ==========================================================================
    // LED SPOTS LINE (aggregate from all veranda items with verlichting)
    // Uses shared LED addon service for both standard and maatwerk configurators
    // ==========================================================================
    console.log('[LED Checkout] ========== Starting LED aggregation ==========');
    console.log(`[LED Checkout] isLedConfigured()=${isLedConfigured()}`);
    
    if (isLedConfigured()) {
      const ledSourceItems: Array<{ configType: string; handle: string; widthCm: number; itemQty: number; ledQty: number }> = [];
      
      for (const item of cartItems) {
        // Skip shipping line
        if (isShippingLineItem(item)) continue;
        
        const identifier = item.handle || item.slug || item.id || 'unknown';
        console.log(`[LED Checkout] Processing item: ${identifier}`);
        
        // Use shared helper to check LED enabled (cast for type compatibility)
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
        
        const hasLed = hasLedEnabled(ledItem);
        
        if (!hasLed) {
          console.log(`[LED Checkout] → skipped (verlichting not enabled)`);
          continue;
        }
        
        // Determine config type (veranda or maatwerk)
        const configType = item.type === 'custom_veranda' ? 'maatwerk' : 
                          item.config?.category === 'maatwerk_veranda' ? 'maatwerk' : 'veranda';
        console.log(`[LED Checkout] → configType=${configType}`);
        
        // Use shared helper to extract width
        const widthCm = extractWidthFromCartItem(ledItem);
        console.log(`[LED Checkout] → widthCm=${widthCm}`);
        
        if (widthCm) {
          // Get LED qty using EXACT mapping
          const ledQty = getLedSpotCountForWidthCm(widthCm);
          
          if (ledQty > 0) {
            console.log(`[LED Checkout] → ADDED: qty=${ledQty} for width=${widthCm}cm, itemQty=${item.quantity}`);
            ledSourceItems.push({
              configType,
              handle: identifier,
              widthCm,
              itemQty: item.quantity,
              ledQty,
            });
          } else {
            console.log(`[LED Checkout] → skipped (no LED mapping for width=${widthCm}cm)`);
          }
        } else {
          console.log(`[LED Checkout] → skipped (could not extract width)`);
        }
      }
      
      // Calculate total LED quantity and add line
      if (ledSourceItems.length > 0) {
        let totalLedQty = 0;
        
        for (const src of ledSourceItems) {
          totalLedQty += src.ledQty * src.itemQty;
        }
        
        console.log(`[LED Checkout] ========== LED SUMMARY ==========`);
        console.log(`[LED Checkout] Total LED qty: ${totalLedQty}`);
        console.log(`[LED Checkout] Source items: ${ledSourceItems.length}`);
        for (const src of ledSourceItems) {
          console.log(`[LED Checkout]   - ${src.handle}: ${src.ledQty}×${src.itemQty} = ${src.ledQty * src.itemQty} spots`);
        }
        
        const ledLine = buildLedCartLine(
          totalLedQty,
          ledSourceItems.map(s => ({ configType: s.configType, handle: s.handle, widthCm: s.widthCm }))
        );
        
        if (ledLine) {
          lines.push(ledLine);
        }
      } else {
        console.log(`[LED Checkout] no LED items to add`);
      }
    }

    // ==========================================================================
    // CONFIGURATION SURCHARGE LINES (Route A)
    // Uses "prijs-stappen" product variants to represent option surcharges
    // LED is handled separately above - this excludes LED
    // ==========================================================================
    console.log('[Config Surcharge] ========== Starting surcharge lines ==========');
    
    // Filter out shipping lines for surcharge calculation
    const productItems = cartItems.filter(item => !isShippingLineItem(item));
    
    if (productItems.length > 0) {
      const surchargeResult = buildConfigSurchargeLines(
        productItems,
        'Configuratie opties',
        'config-surcharge'
      );

      if (surchargeResult.lines.length > 0) {
        console.log(`[Config Surcharge] Adding ${surchargeResult.lines.length} price step lines`);
        console.log(`[Config Surcharge] Total: €${surchargeResult.totalEur.toFixed(2)}`);
        console.log(`[Config Surcharge] Summary: ${surchargeResult.summary}`);
        
        for (const line of surchargeResult.lines) {
          lines.push(line);
        }
      } else {
        console.log('[Config Surcharge] No surcharge lines to add (optionsTotal = 0 or error)');
      }
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
