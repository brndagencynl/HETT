/**
 * Shopify Checkout Integration
 * Syncs local cart to Shopify and redirects to checkout
 */

import { createCart, resetCart, isShopifyConfigured, ShopifyError } from './index';
import type { CartLineInput } from './types';
import type { CartItem } from '../../../types';
import { resolveMerchandiseForCartItem } from '../../shopify/shopifyMerchandiseMap';
// Use new clean attribute builder
import { toCleanShopifyLineAttributes } from '../../services/cart/lineItemAttributes';
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
// Bundle key utilities for grouping related lines (use prefixed keys)
import {
  generateBundleKey,
} from '../../utils/bundleKey';

// Internal attribute keys (underscore prefix to minimize checkout display)
const INTERNAL_BUNDLE_KEY = '_bundle_key';
const INTERNAL_KIND = '_kind';
const INTERNAL_KINDS = {
  MAIN_PRODUCT: 'main_product',
  LED_ADDON: 'led_addon',
  CONFIG_SURCHARGE: 'config_surcharge',
} as const;

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
    
    // Track bundle keys for each cart item (index -> bundleKey)
    // This allows LED and surcharge lines to reference the same bundle
    const bundleKeyMap = new Map<number, string>();
    
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      
      // Special handling for shipping line item
      if (isShippingLineItem(item)) {
        const shippingItem = item as ShippingLineItem;
        const meta = shippingItem.shippingMeta;
        
        // Get readable country name
        const countryNames: Record<string, string> = {
          NL: 'Nederland',
          BE: 'België',
          DE: 'Duitsland',
        };
        const countryName = countryNames[meta.country] || meta.country;
        
        // Build CUSTOMER-FACING shipping attributes
        // Format destination nicely
        const destinationParts = [meta.postalCode, meta.houseNumber].filter(Boolean);
        const destination = destinationParts.join(' ') || countryName;
        
        // Determine tariff display based on shipping type
        let tariefValue = '€ 1,00 per km';
        if (meta.shippingType === 'accessories') {
          tariefValue = 'Vast tarief accessoires € 29,99';
        } else if (meta.shippingType === 'veranda_flat') {
          tariefValue = 'Vast tarief veranda > 300 km: € 299,99';
        } else if (meta.shippingType === 'free') {
          tariefValue = 'Gratis bezorging';
        }
        
        const shippingAttributes = [
          { key: 'Bestemming', value: `${destination}, ${countryName}` },
          { key: 'Afstand', value: `${meta.distanceKm.toFixed(1)} km` },
          { key: 'Tarief', value: tariefValue },
        ];
        
        console.log('[Checkout Props] shipping', shippingAttributes);
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
      
      // Generate bundle_key for this cart item (links main + LED + surcharge lines)
      const bundleKey = generateBundleKey();
      bundleKeyMap.set(i, bundleKey);
      
      // Regular product items
      const { mappingKey, merchandiseId } = resolveMerchandiseForCartItem(item);
      
      // Use new clean attribute formatter (customer-facing only)
      const attributes = toCleanShopifyLineAttributes(item);
      
      // Add INTERNAL bundle grouping attributes (underscore prefix)
      attributes.push(
        { key: INTERNAL_BUNDLE_KEY, value: bundleKey },
        { key: INTERNAL_KIND, value: INTERNAL_KINDS.MAIN_PRODUCT }
      );

      // Debug log for testing
      console.log('[Checkout Props] main', attributes.filter(a => !a.key.startsWith('_')));
      console.log('[beginCheckout] item', {
        title: item.title,
        internalType: item.type,
        slug: item.slug,
        category: item.category,
        mappingKey,
        merchandiseId,
        bundleKey,
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
      const ledSourceItems: Array<{ cartIndex: number; configType: string; handle: string; widthCm: number; itemQty: number; ledQty: number; bundleKey: string }> = [];
      
      for (let idx = 0; idx < cartItems.length; idx++) {
        const item = cartItems[idx];
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
        
        // Get bundle key for this item
        const bundleKey = bundleKeyMap.get(idx) || '';
        
        if (widthCm) {
          // Get LED qty using EXACT mapping
          const ledQty = getLedSpotCountForWidthCm(widthCm);
          
          if (ledQty > 0) {
            console.log(`[LED Checkout] → ADDED: qty=${ledQty} for width=${widthCm}cm, itemQty=${item.quantity}, bundleKey=${bundleKey}`);
            ledSourceItems.push({
              cartIndex: idx,
              configType,
              handle: identifier,
              widthCm,
              itemQty: item.quantity,
              ledQty,
              bundleKey,
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
          console.log(`[LED Checkout]   - ${src.handle}: ${src.ledQty}×${src.itemQty} = ${src.ledQty * src.itemQty} spots (${src.bundleKey})`);
        }
        
        // Collect bundle keys from all source items
        const ledBundleKeys = ledSourceItems.map(s => s.bundleKey).filter(Boolean);
        
        const ledLine = buildLedCartLine(
          totalLedQty,
          ledSourceItems.map(s => ({ configType: s.configType, handle: s.handle, widthCm: s.widthCm })),
          ledBundleKeys
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
    
    // Filter out shipping lines for surcharge calculation, and collect bundle keys
    const productItemsWithBundleKeys: Array<{ item: CartItem; bundleKey: string }> = [];
    for (let idx = 0; idx < cartItems.length; idx++) {
      const item = cartItems[idx];
      if (!isShippingLineItem(item)) {
        const bundleKey = bundleKeyMap.get(idx) || '';
        productItemsWithBundleKeys.push({ item, bundleKey });
      }
    }
    
    if (productItemsWithBundleKeys.length > 0) {
      // Collect all bundle keys for the surcharge lines
      const surchargeBundleKeys = productItemsWithBundleKeys.map(p => p.bundleKey).filter(Boolean);
      
      const surchargeResult = buildConfigSurchargeLines(
        productItemsWithBundleKeys.map(p => p.item),
        'Configuratie opties',
        'config-surcharge',
        surchargeBundleKeys
      );

      if (surchargeResult.lines.length > 0) {
        console.log(`[Config Surcharge] Adding ${surchargeResult.lines.length} price step lines`);
        console.log(`[Config Surcharge] Total: €${surchargeResult.totalEur.toFixed(2)}`);
        console.log(`[Config Surcharge] Summary: ${surchargeResult.summary}`);
        console.log(`[Config Surcharge] Bundle keys: ${surchargeBundleKeys.join(',')}`);
        
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
