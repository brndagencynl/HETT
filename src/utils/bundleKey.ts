/**
 * Bundle Key Utility
 * ==================
 * 
 * Generates and manages bundle keys for grouping related cart lines together.
 * A "bundle" consists of:
 * - 1 Main product line (the configurable product)
 * - 0-1 LED spots line (if verlichting enabled)
 * - 0-N Config surcharge step lines (price step variants for options)
 * 
 * The bundle_key is a unique identifier that links all related lines
 * so they can be displayed as a single visual unit in the cart.
 */

// =============================================================================
// BUNDLE KEY GENERATION
// =============================================================================

/**
 * Generate a unique bundle key for a cart item.
 * This key is attached to all related lines (main, LED, surcharge).
 * 
 * Format: bundle_{timestamp}_{random}
 */
export function generateBundleKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `bundle_${timestamp}_${random}`;
}

/**
 * Generate a bundle key from cart item properties.
 * Uses the item's unique identifiers to create a deterministic key.
 * 
 * This is used when adding items to cart so that subsequent
 * checkout operations can reference the same bundle.
 */
export function generateBundleKeyFromItem(
  itemId: string,
  configHash?: string,
  timestamp?: number
): string {
  const ts = (timestamp || Date.now()).toString(36);
  const idPart = itemId.slice(0, 8);
  const hashPart = configHash ? configHash.slice(0, 6) : Math.random().toString(36).slice(2, 8);
  return `bundle_${ts}_${idPart}_${hashPart}`;
}

// =============================================================================
// BUNDLE KEY ATTRIBUTE CONSTANTS
// =============================================================================

/** Attribute key for bundle identification */
export const BUNDLE_KEY_ATTR = 'bundle_key';

/** Attribute key for line kind identification */
export const KIND_ATTR = 'kind';

/** Line kinds for identifying line types */
export const LINE_KINDS = {
  /** Main product line */
  MAIN_PRODUCT: 'main_product',
  /** LED addon line */
  LED_ADDON: 'led_addon',
  /** Configuration surcharge step line */
  CONFIG_SURCHARGE: 'config_surcharge_step',
} as const;

// =============================================================================
// ATTRIBUTE HELPERS
// =============================================================================

export interface LineAttribute {
  key: string;
  value: string;
}

/**
 * Create bundle key attribute
 */
export function createBundleKeyAttribute(bundleKey: string): LineAttribute {
  return { key: BUNDLE_KEY_ATTR, value: bundleKey };
}

/**
 * Create kind attribute for main product
 */
export function createMainProductKindAttribute(): LineAttribute {
  return { key: KIND_ATTR, value: LINE_KINDS.MAIN_PRODUCT };
}

/**
 * Create kind attribute for LED addon
 */
export function createLedAddonKindAttribute(): LineAttribute {
  return { key: KIND_ATTR, value: LINE_KINDS.LED_ADDON };
}

/**
 * Extract bundle key from line attributes
 */
export function getBundleKeyFromAttributes(attributes: LineAttribute[]): string | null {
  const attr = attributes.find(a => a.key === BUNDLE_KEY_ATTR);
  return attr?.value || null;
}

/**
 * Extract kind from line attributes
 */
export function getKindFromAttributes(attributes: LineAttribute[]): string | null {
  const attr = attributes.find(a => a.key === KIND_ATTR);
  return attr?.value || null;
}

/**
 * Check if line is a main product line
 */
export function isMainProductLine(attributes: LineAttribute[]): boolean {
  const kind = getKindFromAttributes(attributes);
  return kind === LINE_KINDS.MAIN_PRODUCT;
}

/**
 * Check if line is an LED addon line
 */
export function isLedAddonLine(attributes: LineAttribute[]): boolean {
  const kind = getKindFromAttributes(attributes);
  return kind === LINE_KINDS.LED_ADDON;
  // Also check legacy attribute
}

/**
 * Check if line is a config surcharge step line
 */
export function isConfigSurchargeStepLine(attributes: LineAttribute[]): boolean {
  const kind = getKindFromAttributes(attributes);
  return kind === LINE_KINDS.CONFIG_SURCHARGE;
}
