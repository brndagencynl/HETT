/**
 * Shopify Checkout Integration
 * Syncs local cart to Shopify and redirects to checkout
 */

import { createCart, resetCart, isShopifyConfigured, ShopifyError } from './index';
import type { CartLineInput, ShopifyCartLineAttribute } from './types';
import type { CartItem } from '../../../types';
import { ATTRIBUTE_KEYS } from './attributeHelpers';
import { resolveMerchandiseForCartItem } from '../../shopify/shopifyMerchandiseMap';

// =============================================================================
// CONFIG TYPE DETECTION
// =============================================================================

type ConfigTypeValue = 'veranda' | 'maatwerk' | 'sandwichpaneel' | 'accessoire';

function detectConfigType(item: CartItem): ConfigTypeValue {
  // Maatwerk veranda
  if (item.type === 'custom_veranda' || item.maatwerkPayload) {
    return 'maatwerk';
  }
  
  // Sandwichpanelen
  if (item.type === 'sandwichpanelen' || item.config?.category === 'sandwichpanelen') {
    return 'sandwichpaneel';
  }
  
  // Standard veranda
  if (item.config?.category === 'verandas') {
    return 'veranda';
  }
  
  // Accessoire (default)
  return 'accessoire';
}

// =============================================================================
// ATTRIBUTE BUILDERS
// =============================================================================

/**
 * Build Shopify line attributes from a cart item's configuration
 */
function buildLineAttributes(item: CartItem): ShopifyCartLineAttribute[] {
  const configType = detectConfigType(item);

  const configJson = JSON.stringify({
    title: item.title,
    slug: item.slug,
    category: item.category,
    type: item.type,
    quantity: item.quantity,
    config: item.config,
    maatwerk: item.maatwerkPayload
      ? {
          size: item.maatwerkPayload.size,
          anchorSizeKey: item.maatwerkPayload.anchorSizeKey,
          selections: item.maatwerkPayload.selections.map((s) => ({
            groupId: s.groupId,
            groupLabel: s.groupLabel,
            choiceId: s.choiceId,
            choiceLabel: s.choiceLabel,
            price: s.price,
          })),
        }
      : undefined,
    pricing: item.pricing
      ? {
          basePrice: item.pricing.basePrice,
          extrasTotal: item.pricing.extrasTotal,
          total: item.pricing.total,
        }
      : undefined,
  });

  const attrs: ShopifyCartLineAttribute[] = [
    { key: ATTRIBUTE_KEYS.CONFIG_TYPE, value: configType },
    { key: 'config', value: configJson },
  ];
  
  // Add preview image if available
  const previewImage = item.render?.baseImageUrl || item.maatwerkPayload?.renderPreview;
  if (previewImage) {
    attrs.push({ key: ATTRIBUTE_KEYS.PREVIEW_IMAGE_URL, value: previewImage });
  }
  
  // Handle maatwerk veranda
  if (configType === 'maatwerk' && item.maatwerkPayload) {
    const payload = item.maatwerkPayload;
    attrs.push(
      { key: ATTRIBUTE_KEYS.CUSTOM_WIDTH_CM, value: String(payload.size.width) },
      { key: ATTRIBUTE_KEYS.CUSTOM_DEPTH_CM, value: String(payload.size.depth) },
      { key: ATTRIBUTE_KEYS.BASE_PRICE, value: String(payload.basePrice) },
      { key: ATTRIBUTE_KEYS.OPTIONS_TOTAL, value: String(payload.optionsTotal) },
      { key: ATTRIBUTE_KEYS.TOTAL_PRICE, value: String(payload.totalPrice) }
    );
    
    if (payload.anchorSizeKey) {
      attrs.push({ key: ATTRIBUTE_KEYS.ANCHOR_SIZE_KEY, value: payload.anchorSizeKey });
    }
    
    // Add selections as simplified attributes
    payload.selections.forEach(sel => {
      if (sel.choiceLabel && sel.choiceLabel.toLowerCase() !== 'geen') {
        attrs.push({ key: sel.groupId, value: sel.choiceLabel });
      }
    });
    
    return attrs;
  }
  
  // Handle standard veranda
  if (configType === 'veranda' && item.config?.category === 'verandas') {
    const config = item.config.data;
    
    // Product size from selected size or product title
    if (item.selectedSize) {
      attrs.push({ key: ATTRIBUTE_KEYS.PRODUCT_SIZE, value: item.selectedSize });
    }
    
    // Color
    const color = config.color || config.kleur;
    if (color) {
      attrs.push({ key: ATTRIBUTE_KEYS.KLEUR, value: color });
    }
    
    // Daktype
    if (config.daktype) {
      attrs.push({ key: ATTRIBUTE_KEYS.DAKTYPE, value: config.daktype });
    }
    
    // Goot
    if (config.goot) {
      attrs.push({ key: ATTRIBUTE_KEYS.GOOT, value: config.goot });
    }
    
    // Side walls
    if (config.zijwand_links && config.zijwand_links !== 'geen') {
      attrs.push({ key: ATTRIBUTE_KEYS.ZIJWAND_LINKS, value: config.zijwand_links });
    }
    if (config.zijwand_rechts && config.zijwand_rechts !== 'geen') {
      attrs.push({ key: ATTRIBUTE_KEYS.ZIJWAND_RECHTS, value: config.zijwand_rechts });
    }
    
    // Front wall
    if (config.voorzijde && config.voorzijde !== 'geen') {
      attrs.push({ key: ATTRIBUTE_KEYS.VOORZIJDE, value: config.voorzijde });
    }
    
    // Lighting
    if (config.verlichting) {
      attrs.push({ key: ATTRIBUTE_KEYS.VERLICHTING, value: 'true' });
    }
    
    return attrs;
  }
  
  // Handle sandwichpanelen
  if (configType === 'sandwichpaneel' && item.config?.category === 'sandwichpanelen') {
    const config = item.config.data;
    
    // Color
    const color = config.color || config.kleur;
    if (color) {
      attrs.push({ key: ATTRIBUTE_KEYS.KLEUR, value: color });
    }
    
    // Length
    if (config.lengthMm || config.length) {
      attrs.push({ key: ATTRIBUTE_KEYS.LENGTE_MM, value: String(config.lengthMm || config.length) });
    }
    
    // U-profiles
    if (config.extras?.uProfiles?.enabled) {
      attrs.push(
        { key: ATTRIBUTE_KEYS.U_PROFIELEN_ENABLED, value: 'true' },
        { key: ATTRIBUTE_KEYS.U_PROFIELEN_METERS, value: String(config.extras.uProfiles.meters) }
      );
    }
    
    // Pricing info
    if (item.pricing) {
      attrs.push(
        { key: ATTRIBUTE_KEYS.BASE_PRICE, value: String(item.pricing.basePrice) },
        { key: ATTRIBUTE_KEYS.OPTIONS_TOTAL, value: String(item.pricing.extrasTotal) },
        { key: ATTRIBUTE_KEYS.TOTAL_PRICE, value: String(item.pricing.total) }
      );
    }
    
    return attrs;
  }
  
  // Accessoires - minimal attributes
  if (item.details && item.details.length > 0) {
    item.details.forEach(detail => {
      attrs.push({ key: detail.label.toLowerCase().replace(/\s+/g, '_'), value: detail.value });
    });
  }
  
  return attrs;
}

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
  /** Local cart items to sync */
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
    
    for (const item of cartItems) {
      const { mappingKey, merchandiseId } = resolveMerchandiseForCartItem(item);
      const attributes = buildLineAttributes(item);

      // Debug helper (requested)
      console.log('[beginCheckout] item', {
        title: item.title,
        internalType: item.type,
        slug: item.slug,
        category: item.category,
        mappingKey,
        merchandiseId,
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
