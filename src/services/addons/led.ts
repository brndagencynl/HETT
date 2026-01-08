/**
 * LED Addon Service
 * ==================
 * Shared LED addon helper for BOTH standard veranda and maatwerk configurators.
 * 
 * This module re-exports the core LED pricing utilities and provides
 * additional helpers for parsing width from various config sources.
 * 
 * USAGE:
 * - Standard veranda: widthCm from product handle or config.widthCm
 * - Maatwerk veranda: widthCm from slider size.width
 * 
 * WIDTH→QTY MAPPING (EXACT):
 * 306 cm  → 4 spots    806 cm  → 14 spots
 * 406 cm  → 6 spots    906 cm  → 16 spots
 * 506 cm  → 8 spots    1006 cm → 18 spots
 * 606 cm  → 10 spots   1106 cm → 20 spots
 * 706 cm  → 12 spots   1206 cm → 22 spots
 */

// Re-export core LED functions from ledPricing
export {
  LED_SPOT_PRODUCT_HANDLE,
  LED_VARIANT_ID,
  LED_UNIT_PRICE_EUR,
  LED_UNIT_PRICE_CENTS,
  SUPPORTED_LED_WIDTHS,
  getLedSpotCountForWidthCm,
  getLedTotalForWidthCm,
  getLedTotals,
  normalizeToLedWidth,
  extractWidthFromHandle,
  extractWidthFromSize,
  isLedConfigured,
  buildLedCartLine,
  type LedLineItem,
  type LedCartLineInput,
} from '../ledPricing';

// Import for internal use
import {
  getLedSpotCountForWidthCm,
  extractWidthFromHandle,
  extractWidthFromSize,
} from '../ledPricing';

// =============================================================================
// CART ITEM CONFIG TYPES
// =============================================================================

/** Generic cart item config that may contain LED/width info */
export interface CartItemConfig {
  category?: string;
  data?: Record<string, unknown> & {
    verlichting?: boolean;
    widthCm?: number;
    ledWidthCm?: number;
    size?: { width?: number; depth?: number };
  };
}

/** Maatwerk payload shape */
export interface MaatwerkPayload {
  size?: { width: number; depth: number };
  selections?: Array<{ groupId: string; choiceId: string }>;
}

/** Generic cart item for LED extraction */
export interface LedCartItem {
  id?: string;
  handle?: string;
  slug?: string;
  type?: string;
  quantity: number;
  selectedSize?: string;
  // Use any to accept the various cart item config shapes
  config?: { category?: string; data?: Record<string, unknown> };
  maatwerkPayload?: { size?: { width: number; depth: number }; selections?: Array<{ groupId: string; choiceId: string }> };
}

// =============================================================================
// LED DETECTION
// =============================================================================

/**
 * Check if a cart item has LED (verlichting) enabled.
 * Works for BOTH standard veranda and maatwerk configurations.
 * 
 * @param item - Cart item to check
 * @returns true if verlichting is enabled
 */
export function hasLedEnabled(item: LedCartItem): boolean {
  const config = item.config?.data as Record<string, unknown> | undefined;
  
  // Standard veranda: verlichting boolean
  if (config?.verlichting === true) {
    console.log(`[LED Addon] hasLedEnabled: true (config.verlichting) for ${item.handle || item.id}`);
    return true;
  }
  
  // Maatwerk: check selections for verlichting group
  const maatwerkLed = item.maatwerkPayload?.selections?.some(
    (s) => s.groupId === 'verlichting' && s.choiceId !== 'geen'
  );
  
  if (maatwerkLed) {
    console.log(`[LED Addon] hasLedEnabled: true (maatwerk selection) for ${item.handle || item.id}`);
    return true;
  }
  
  console.log(`[LED Addon] hasLedEnabled: false for ${item.handle || item.id}`);
  return false;
}

// =============================================================================
// WIDTH EXTRACTION
// =============================================================================

/**
 * Extract width from a cart item, trying multiple sources.
 * Priority order:
 * 1. maatwerkPayload.size.width (maatwerk slider)
 * 2. config.data.widthCm
 * 3. config.data.ledWidthCm (standard veranda stores this)
 * 4. config.data.size.width
 * 5. selectedSize string (e.g., "606x400")
 * 6. handle/slug (e.g., "veranda-706-x-400-cm")
 * 
 * @param item - Cart item to extract width from
 * @returns Width in cm, or null if not found
 */
export function extractWidthFromCartItem(item: LedCartItem): number | null {
  const config = item.config?.data as Record<string, unknown> | undefined;
  const identifier = item.handle || item.slug || item.id || 'unknown';
  
  // 1. Maatwerk payload (slider value)
  if (item.maatwerkPayload?.size?.width) {
    const width = item.maatwerkPayload.size.width;
    console.log(`[LED Addon] extractWidth: ${width}cm from maatwerkPayload for ${identifier}`);
    return width;
  }
  
  // 2. Config widthCm
  const widthCm = config?.widthCm;
  if (widthCm && typeof widthCm === 'number') {
    console.log(`[LED Addon] extractWidth: ${widthCm}cm from config.widthCm for ${identifier}`);
    return widthCm;
  }
  
  // 3. Config ledWidthCm (standard veranda stores this from prop)
  const ledWidthCm = config?.ledWidthCm;
  if (ledWidthCm && typeof ledWidthCm === 'number') {
    console.log(`[LED Addon] extractWidth: ${ledWidthCm}cm from config.ledWidthCm for ${identifier}`);
    return ledWidthCm;
  }
  
  // 4. Config size.width
  const size = config?.size as { width?: number; depth?: number } | undefined;
  if (size?.width && typeof size.width === 'number') {
    console.log(`[LED Addon] extractWidth: ${size.width}cm from config.size.width for ${identifier}`);
    return size.width;
  }
  
  // 5. Selected size string
  if (item.selectedSize) {
    const width = extractWidthFromSize(item.selectedSize);
    if (width) {
      console.log(`[LED Addon] extractWidth: ${width}cm from selectedSize "${item.selectedSize}" for ${identifier}`);
      return width;
    }
  }
  
  // 6. Handle/slug parsing
  const handleOrSlug = item.handle || item.slug || item.id;
  if (handleOrSlug) {
    const width = extractWidthFromHandle(handleOrSlug);
    if (width) {
      console.log(`[LED Addon] extractWidth: ${width}cm from handle "${handleOrSlug}"`);
      return width;
    }
  }
  
  console.log(`[LED Addon] extractWidth: null (no source found) for ${identifier}`);
  return null;
}

// =============================================================================
// LED CALCULATION FOR CART ITEM
// =============================================================================

/** LED calculation result for a single cart item */
export interface LedCalcResult {
  hasLed: boolean;
  widthCm: number | null;
  ledQty: number;
  configType: 'veranda' | 'maatwerk';
  identifier: string;
}

/**
 * Calculate LED quantity for a cart item.
 * Returns full calculation result with all metadata.
 * 
 * @param item - Cart item to calculate LED for
 * @returns Calculation result with hasLed, widthCm, ledQty, configType
 */
export function calculateLedForCartItem(item: LedCartItem): LedCalcResult {
  const identifier = item.handle || item.slug || item.id || 'unknown';
  
  // Determine config type
  const configType: 'veranda' | 'maatwerk' = 
    item.type === 'custom_veranda' || item.config?.category === 'maatwerk_veranda'
      ? 'maatwerk'
      : 'veranda';
  
  // Check if LED enabled
  const hasLed = hasLedEnabled(item);
  
  if (!hasLed) {
    return {
      hasLed: false,
      widthCm: null,
      ledQty: 0,
      configType,
      identifier,
    };
  }
  
  // Extract width
  const widthCm = extractWidthFromCartItem(item);
  
  if (!widthCm) {
    console.log(`[LED Addon] calculateLed: LED enabled but no width found for ${identifier}`);
    return {
      hasLed: true,
      widthCm: null,
      ledQty: 0,
      configType,
      identifier,
    };
  }
  
  // Get LED quantity using exact mapping
  const ledQty = getLedSpotCountForWidthCm(widthCm);
  
  console.log(`[LED Addon] calculateLed: ${identifier} → type=${configType}, width=${widthCm}cm, qty=${ledQty}`);
  
  return {
    hasLed: true,
    widthCm,
    ledQty,
    configType,
    identifier,
  };
}

// =============================================================================
// AGGREGATE LED FROM MULTIPLE ITEMS
// =============================================================================

/** Aggregated LED result for checkout */
export interface AggregatedLedResult {
  totalQty: number;
  sourceItems: Array<{
    configType: 'veranda' | 'maatwerk';
    handle: string;
    widthCm: number;
    itemQty: number;
    ledQty: number;
  }>;
}

/**
 * Aggregate LED quantities from multiple cart items.
 * Used at checkout to build a single LED line item.
 * 
 * @param items - Array of cart items to aggregate
 * @returns Aggregated LED result with total qty and source items
 */
export function aggregateLedFromCartItems(items: LedCartItem[]): AggregatedLedResult {
  console.log(`[LED Addon] aggregateLed: processing ${items.length} items`);
  
  const sourceItems: AggregatedLedResult['sourceItems'] = [];
  
  for (const item of items) {
    const result = calculateLedForCartItem(item);
    
    if (result.hasLed && result.ledQty > 0 && result.widthCm) {
      sourceItems.push({
        configType: result.configType,
        handle: result.identifier,
        widthCm: result.widthCm,
        itemQty: item.quantity,
        ledQty: result.ledQty,
      });
    }
  }
  
  // Calculate total LED quantity (ledQty × itemQty for each source)
  const totalQty = sourceItems.reduce(
    (sum, src) => sum + src.ledQty * src.itemQty,
    0
  );
  
  console.log(`[LED Addon] aggregateLed: totalQty=${totalQty} from ${sourceItems.length} source items`);
  
  return {
    totalQty,
    sourceItems,
  };
}

/**
 * Get LED count for a given width (convenience alias)
 * @param widthCm - Width in centimeters
 * @returns Number of LED spots
 */
export const getLedCountForWidthCm = getLedSpotCountForWidthCm;
