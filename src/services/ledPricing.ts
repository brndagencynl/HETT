/**
 * LED Spot Pricing Service
 * ========================
 * 
 * LED lighting pricing depends on veranda width.
 * LED spots are added as a SEPARATE Shopify cart line.
 * 
 * LED RULES (EXACT MAPPING - width must match key exactly):
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

/** LED product variant ID from Shopify (Storefront GID) */
export const LED_VARIANT_ID = "gid://shopify/ProductVariant/53089038565703";

/** LED spot unit price in EUR */
export const LED_UNIT_PRICE_EUR = 29.99;

/** LED spot unit price in cents */
export const LED_UNIT_PRICE_CENTS = 2999;

/** 
 * EXACT width→LED quantity mapping table
 * Width must match one of these keys EXACTLY to get LED spots
 */
const LED_WIDTH_MAPPING: Record<number, number> = {
  306: 4,
  406: 6,
  506: 8,
  606: 10,
  706: 12,
  806: 14,
  906: 16,
  1006: 18,
  1106: 20,
  1206: 22,
};

/** Supported width keys */
export const SUPPORTED_LED_WIDTHS = Object.keys(LED_WIDTH_MAPPING).map(Number);

// =============================================================================
// LED QUANTITY CALCULATION
// =============================================================================

/**
 * Get LED spot count for a given width in cm.
 * Uses EXACT mapping - width must match one of the supported keys.
 * 
 * @param widthCm - Veranda width in centimeters
 * @returns Number of LED spots, or 0 if width doesn't match any key
 */
export function getLedSpotCountForWidthCm(widthCm: number): number {
  const qty = LED_WIDTH_MAPPING[widthCm] ?? 0;
  
  console.log(`[LED] widthCm=${widthCm}`);
  console.log(`[LED] qty=${qty}`);
  
  if (qty === 0) {
    console.log(`[LED] No mapping for width ${widthCm}, skipping`);
  }
  
  return qty;
}

/**
 * Get total LED price for a given width in cm.
 * 
 * @param widthCm - Veranda width in centimeters
 * @returns Total price in EUR (qty × unit price), or 0 if no mapping
 */
export function getLedTotalForWidthCm(widthCm: number): number {
  const qty = getLedSpotCountForWidthCm(widthCm);
  return qty * LED_UNIT_PRICE_EUR;
}

/**
 * @deprecated Use getLedSpotCountForWidthCm instead
 */
export function getLedQuantity(widthCm: number): number {
  return getLedSpotCountForWidthCm(widthCm);
}

/**
 * Normalize width to nearest supported LED width key.
 * Only use this for maatwerk slider values that need snapping.
 * 
 * @param widthCm - Raw width in centimeters
 * @returns Nearest supported width key, or null if out of range
 */
export function normalizeToLedWidth(widthCm: number): number | null {
  if (widthCm < 256 || widthCm > 1256) return null; // Too far out of range
  
  // Find nearest supported width
  let nearest = SUPPORTED_LED_WIDTHS[0];
  let minDiff = Math.abs(widthCm - nearest);
  
  for (const w of SUPPORTED_LED_WIDTHS) {
    const diff = Math.abs(widthCm - w);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = w;
    }
  }
  
  return nearest;
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
 * @returns CartLineInput for Shopify, or null if qty is 0 or LED not configured
 */
export function buildLedCartLine(
  totalQuantity: number,
  sourceItems: Array<{ configType: string; handle: string; widthCm: number }>
): LedCartLineInput | null {
  if (!isLedConfigured() || totalQuantity <= 0) {
    return null;
  }
  
  console.log(`[LED] added line with GID=${LED_VARIANT_ID} qty=${totalQuantity}`);
  
  // Use first source item for primary attribution (or combine if multiple)
  const widthCm = sourceItems[0]?.widthCm ?? 0;
  
  return {
    merchandiseId: LED_VARIANT_ID,
    quantity: totalQuantity,
    attributes: [
      { key: 'config_type', value: 'addon' },
      { key: 'addon', value: 'led_spots' },
      { key: 'width_cm', value: String(widthCm) },
      { key: 'unit_price', value: String(LED_UNIT_PRICE_EUR) },
      { key: 'derived_qty', value: String(totalQuantity) },
    ],
  };
}
