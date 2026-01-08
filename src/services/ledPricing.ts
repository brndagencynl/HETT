/**
 * LED Spot Pricing Service
 * ========================
 * 
 * LED lighting pricing depends on veranda width.
 * LED spots are added as a SEPARATE Shopify cart line.
 * 
 * LED RULES:
 * 306 cm  → 4 spots
 * 406 cm  → 6 spots
 * 506 cm  → 8 spots
 * 606 cm  → 10 spots
 * 706 cm  → 12 spots
 * 806 cm  → 14 spots
 * 906 cm  → 16 spots
 * 1006 cm → 18 spots
 * 1106 cm → 20 spots
 * 1206 cm → 22 spots
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** LED spot product handle in Shopify */
export const LED_SPOT_PRODUCT_HANDLE = "led-spot-per-stuk";

/** LED product variant ID from Shopify */
export const LED_VARIANT_ID = "gid://shopify/ProductVariant/53089038565703";

/** LED spot unit price in EUR (for local cart display) */
export const LED_UNIT_PRICE_EUR = 29.99;

/** LED spot unit price in cents */
export const LED_UNIT_PRICE_CENTS = 2999;

/** Minimum width for LED calculation */
const MIN_WIDTH_CM = 306;

/** Maximum width for LED calculation */
const MAX_WIDTH_CM = 1206;

/** Minimum LED quantity */
const MIN_LED_QTY = 4;

/** Maximum LED quantity */
const MAX_LED_QTY = 22;

// =============================================================================
// LED QUANTITY CALCULATION
// =============================================================================

/**
 * Calculate number of LED spots based on veranda width
 * 
 * Formula: Start at 4 spots for 306cm, add 2 spots per 100cm increase
 * Width is clamped to [306, 1206] range
 * 
 * @param widthCm - Veranda width in centimeters
 * @returns Number of LED spots (4-22)
 */
export function getLedQuantity(widthCm: number): number {
  // Clamp width to valid range
  const clamped = Math.min(Math.max(widthCm, MIN_WIDTH_CM), MAX_WIDTH_CM);
  
  // Calculate step (each 100cm adds 2 spots)
  const step = Math.round((clamped - MIN_WIDTH_CM) / 100);
  const qty = MIN_LED_QTY + step * 2;
  
  // Clamp result to valid range
  const result = Math.min(Math.max(qty, MIN_LED_QTY), MAX_LED_QTY);
  
  console.log(`[LED] widthCm=${widthCm} → qty=${result}`);
  
  return result;
}

/**
 * Snap width to nearest supported step (306, 406, 506, ..., 1206)
 * 
 * @param widthCm - Raw width in centimeters
 * @returns Snapped width (306, 406, 506, etc.)
 */
export function snapToLedWidth(widthCm: number): number {
  const clamped = Math.min(Math.max(widthCm, MIN_WIDTH_CM), MAX_WIDTH_CM);
  const step = Math.round((clamped - MIN_WIDTH_CM) / 100);
  return MIN_WIDTH_CM + step * 100;
}

// =============================================================================
// WIDTH EXTRACTION HELPERS
// =============================================================================

/**
 * Extract width from a Shopify product handle
 * 
 * @example
 * extractWidthFromHandle('aluminium-veranda-706-x-400-cm') → 706
 * extractWidthFromHandle('veranda-506-x-300') → 506
 * 
 * @param handle - Shopify product handle
 * @returns Width in cm, or null if not found
 */
export function extractWidthFromHandle(handle: string): number | null {
  // Pattern: -{width}-x- (e.g., -706-x-400)
  const match = handle.match(/-(\d{3,4})-x-/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract width from product size string
 * 
 * @example
 * extractWidthFromSize('706x400') → 706
 * extractWidthFromSize('600x300') → 600
 * 
 * @param size - Size string in format "WIDTHxDEPTH"
 * @returns Width in cm, or null if not found
 */
export function extractWidthFromSize(size: string): number | null {
  const match = size.match(/^(\d{3,4})x\d{3,4}$/);
  return match ? parseInt(match[1], 10) : null;
}

// =============================================================================
// CART ITEM LED DETECTION
// =============================================================================

/**
 * Check if LED variant ID is configured
 */
export function isLedConfigured(): boolean {
  return !!LED_VARIANT_ID && LED_VARIANT_ID.startsWith('gid://');
}

/**
 * LED line item type for local cart display
 */
export interface LedLineItem {
  id: 'auto-led';
  type: 'led-spots';
  title: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  readonly: true;
  source: 'auto-led';
  parentItems: Array<{
    handle: string;
    configType: string;
    widthCm: number;
    itemQuantity: number;
    ledQty: number;
  }>;
}

/**
 * Shopify cart line input for LED spots
 */
export interface LedCartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes: Array<{ key: string; value: string }>;
}

/**
 * Build LED Shopify cart line input
 * 
 * @param totalQuantity - Total LED spots to add
 * @param sourceItems - Source veranda items for attribution
 * @returns CartLineInput for Shopify, or null if LED not configured
 */
export function buildLedCartLine(
  totalQuantity: number,
  sourceItems: Array<{ configType: string; handle: string; widthCm: number }>
): LedCartLineInput | null {
  if (!isLedConfigured() || totalQuantity <= 0) {
    return null;
  }
  
  console.log(`[LED] adding Shopify line qty=${totalQuantity} variant=LED`);
  
  // Combine source info for attribution
  const widths = sourceItems.map(s => s.widthCm).join(',');
  const handles = sourceItems.map(s => s.handle).join(',');
  const types = [...new Set(sourceItems.map(s => s.configType))].join(',');
  
  return {
    merchandiseId: LED_VARIANT_ID,
    quantity: totalQuantity,
    attributes: [
      { key: 'source', value: 'auto-led' },
      { key: 'parent_type', value: types },
      { key: 'parent_handles', value: handles },
      { key: 'widths_cm', value: widths },
    ],
  };
}
