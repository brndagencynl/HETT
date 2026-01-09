/**
 * Glass Sliding Wall Pricing
 * ==========================
 * 
 * Shared pricing module for "Glazen schuifwand" (helder / getint) options.
 * Used by BOTH normal veranda and maatwerk veranda configurators.
 * 
 * Width is in CM. For normal veranda products, width is derived from
 * the product size (e.g., 706x400 => width_cm = 706).
 * For maatwerk, width_cm comes from the slider/input.
 */

// =============================================================================
// TYPES
// =============================================================================

export type GlassVariant = 'helder' | 'getint';

// =============================================================================
// PRICE TABLE
// =============================================================================

/**
 * Glass sliding wall price table by width in cm.
 * Keys are the supported width values.
 */
export const GLASS_WALL_PRICE_TABLE: Record<number, { helder: number; getint: number }> = {
  306: { helder: 599.00, getint: 749.00 },
  406: { helder: 799.00, getint: 949.00 },
  506: { helder: 999.00, getint: 1149.00 },
  606: { helder: 1150.00, getint: 1299.00 },
  706: { helder: 1450.00, getint: 1599.00 },
  806: { helder: 1599.00, getint: 1749.00 },
  906: { helder: 1799.00, getint: 1949.00 },
  1006: { helder: 1999.00, getint: 2149.00 },
  1106: { helder: 2199.00, getint: 2349.00 },
  1206: { helder: 2399.00, getint: 2549.00 },
};

/**
 * Supported width keys (sorted ascending)
 */
export const SUPPORTED_WIDTHS = Object.keys(GLASS_WALL_PRICE_TABLE)
  .map(Number)
  .sort((a, b) => a - b);

const MIN_WIDTH = SUPPORTED_WIDTHS[0]; // 306
const MAX_WIDTH = SUPPORTED_WIDTHS[SUPPORTED_WIDTHS.length - 1]; // 1206

// =============================================================================
// NORMALIZATION
// =============================================================================

/**
 * Normalize a width value to the nearest supported table key.
 * 
 * Rules:
 * - If width is exactly one of the supported keys, return that key.
 * - If width is not exact, snap to the nearest HIGHER supported step (ceiling).
 * - Never return below MIN_WIDTH (306) or above MAX_WIDTH (1206).
 * 
 * @param widthCm - Width in centimeters
 * @returns The normalized width key from the price table
 */
export function normalizeWidthToKey(widthCm: number): number {
  // Clamp to valid range
  if (widthCm < MIN_WIDTH) {
    console.warn('[GlassWallPrice] width below minimum, clamping to', MIN_WIDTH, { widthCm });
    return MIN_WIDTH;
  }
  if (widthCm > MAX_WIDTH) {
    console.warn('[GlassWallPrice] width above maximum, clamping to', MAX_WIDTH, { widthCm });
    return MAX_WIDTH;
  }

  // If exact match, return it
  if (SUPPORTED_WIDTHS.includes(widthCm)) {
    return widthCm;
  }

  // Find the nearest higher key (ceiling to closest key >= widthCm)
  for (const key of SUPPORTED_WIDTHS) {
    if (key >= widthCm) {
      return key;
    }
  }

  // Fallback (shouldn't reach here due to MAX_WIDTH clamp)
  return MAX_WIDTH;
}

// =============================================================================
// PRICE LOOKUP
// =============================================================================

/**
 * Get the glass sliding wall price for a given width and variant.
 * 
 * @param widthCm - Width in centimeters (from product size or maatwerk slider)
 * @param variant - 'helder' (clear) or 'getint' (tinted)
 * @returns Price in EUR with 2 decimal precision
 */
export function getGlassWallPrice(widthCm: number, variant: GlassVariant): number {
  const normalizedKey = normalizeWidthToKey(widthCm);
  
  // Log if snapping occurred
  if (normalizedKey !== widthCm) {
    console.warn('[GlassWallPrice] width snapped', { widthCm, key: normalizedKey });
  }

  const priceEntry = GLASS_WALL_PRICE_TABLE[normalizedKey];
  if (!priceEntry) {
    console.error('[GlassWallPrice] No price entry for key', normalizedKey);
    return 0;
  }

  const price = priceEntry[variant];

  console.log(
    '[GlassWallPrice] widthCm=', widthCm,
    'normalized=', normalizedKey,
    'variant=', variant,
    'price=', price
  );

  // Return with 2 decimal precision
  return Math.round(price * 100) / 100;
}

// =============================================================================
// WIDTH DETECTION HELPER
// =============================================================================

/**
 * Extract width in cm from a product size string or handle.
 * 
 * Supports formats like:
 * - "706x400" => 706
 * - "veranda-706x400" => 706
 * - "706 x 400" => 706
 * 
 * @param sizeOrHandle - Product size string or handle
 * @returns Width in cm, or null if not found
 */
export function extractWidthFromSizeString(sizeOrHandle: string): number | null {
  if (!sizeOrHandle) return null;
  
  // Match patterns like "706x400", "706 x 400", "veranda-706x400"
  const match = sizeOrHandle.match(/(\d{3,4})\s*x\s*\d+/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Get width in cm from product or config data.
 * 
 * Priority:
 * 1. Direct widthCm property
 * 2. selectedSize (e.g., "706x400")
 * 3. handle/slug (e.g., "veranda-706x400")
 * 4. title (e.g., "Veranda 706x400")
 * 
 * @param product - Product or cart item object
 * @param config - Optional config data
 * @returns Width in cm, or 606 as fallback
 */
export function getWidthCmFromProductOrConfig(
  product: {
    selectedSize?: string;
    handle?: string;
    slug?: string;
    title?: string;
    widthCm?: number;
    config?: { data?: Record<string, unknown> };
  },
  config?: { width?: number; size?: { width: number } }
): number {
  // 1. Direct widthCm property
  if (product.widthCm && product.widthCm > 0) {
    return product.widthCm;
  }

  // 2. Config data (for maatwerk)
  if (config?.width && config.width > 0) {
    return config.width;
  }
  if (config?.size?.width && config.size.width > 0) {
    return config.size.width;
  }

  // 3. selectedSize property
  if (product.selectedSize) {
    const width = extractWidthFromSizeString(product.selectedSize);
    if (width) return width;
  }

  // 4. handle/slug
  const handleOrSlug = product.handle || product.slug;
  if (handleOrSlug) {
    const width = extractWidthFromSizeString(handleOrSlug);
    if (width) return width;
  }

  // 5. title
  if (product.title) {
    const width = extractWidthFromSizeString(product.title);
    if (width) return width;
  }

  // 6. config.data (nested)
  const configData = product.config?.data;
  if (configData) {
    if (typeof configData.width === 'number' && configData.width > 0) {
      return configData.width;
    }
    if (typeof configData.widthCm === 'number' && configData.widthCm > 0) {
      return configData.widthCm;
    }
  }

  // Default fallback
  console.warn('[GlassWallPrice] Could not determine width, using fallback 606', product);
  return 606;
}
