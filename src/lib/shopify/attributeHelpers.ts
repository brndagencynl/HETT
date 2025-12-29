/**
 * Cart Line Attribute Helpers
 * Build and parse line attributes for configurable products
 */

import type { ShopifyCartLineAttribute } from './types';

// =============================================================================
// ATTRIBUTE KEYS
// =============================================================================

export const ATTRIBUTE_KEYS = {
  // Common
  CONFIG_TYPE: 'config_type',
  PREVIEW_IMAGE_URL: 'preview_image_url',
  
  // Veranda standard
  PRODUCT_SIZE: 'product_size',
  KLEUR: 'kleur',
  DAKTYPE: 'daktype',
  GOOT: 'goot',
  ZIJWAND_LINKS: 'zijwand_links',
  ZIJWAND_RECHTS: 'zijwand_rechts',
  VOORZIJDE: 'voorzijde',
  VERLICHTING: 'verlichting',
  
  // Veranda custom/maatwerk
  CUSTOM_WIDTH_CM: 'custom_width_cm',
  CUSTOM_DEPTH_CM: 'custom_depth_cm',
  ANCHOR_SIZE_KEY: 'anchor_size_key',
  BASE_PRICE: 'base_price',
  OPTIONS_TOTAL: 'options_total',
  TOTAL_PRICE: 'total_price',
  MAATWERK_FEE: 'maatwerk_fee',
  
  // Sandwichpanelen
  LENGTE_MM: 'lengte_mm',
  U_PROFIELEN_ENABLED: 'u_profielen_enabled',
  U_PROFIELEN_METERS: 'u_profielen_meters',
} as const;

export type ConfigType = 'veranda_standard' | 'veranda_custom' | 'sandwichpaneel' | 'accessoire';

// =============================================================================
// VERANDA ATTRIBUTES
// =============================================================================

export interface VerandaStandardAttributes {
  configType: 'veranda_standard';
  productSize: string;
  kleur: string;
  daktype: string;
  goot: string;
  zijwandLinks?: string;
  zijwandRechts?: string;
  voorzijde?: string;
  verlichting?: boolean;
  previewImageUrl?: string;
}

export interface VerandaCustomAttributes {
  configType: 'veranda_custom';
  customWidthCm: number;
  customDepthCm: number;
  anchorSizeKey?: string;
  kleur: string;
  daktype: string;
  goot: string;
  zijwandLinks?: string;
  zijwandRechts?: string;
  voorzijde?: string;
  verlichting?: boolean;
  basePrice: number;
  optionsTotal: number;
  totalPrice: number;
  maatwerkFee?: number;
  previewImageUrl?: string;
}

export function buildVerandaStandardAttributes(
  config: VerandaStandardAttributes
): ShopifyCartLineAttribute[] {
  const attrs: ShopifyCartLineAttribute[] = [
    { key: ATTRIBUTE_KEYS.CONFIG_TYPE, value: config.configType },
    { key: ATTRIBUTE_KEYS.PRODUCT_SIZE, value: config.productSize },
    { key: ATTRIBUTE_KEYS.KLEUR, value: config.kleur },
    { key: ATTRIBUTE_KEYS.DAKTYPE, value: config.daktype },
    { key: ATTRIBUTE_KEYS.GOOT, value: config.goot },
  ];

  if (config.zijwandLinks && config.zijwandLinks !== 'geen') {
    attrs.push({ key: ATTRIBUTE_KEYS.ZIJWAND_LINKS, value: config.zijwandLinks });
  }
  if (config.zijwandRechts && config.zijwandRechts !== 'geen') {
    attrs.push({ key: ATTRIBUTE_KEYS.ZIJWAND_RECHTS, value: config.zijwandRechts });
  }
  if (config.voorzijde && config.voorzijde !== 'geen') {
    attrs.push({ key: ATTRIBUTE_KEYS.VOORZIJDE, value: config.voorzijde });
  }
  if (config.verlichting) {
    attrs.push({ key: ATTRIBUTE_KEYS.VERLICHTING, value: 'true' });
  }
  if (config.previewImageUrl) {
    attrs.push({ key: ATTRIBUTE_KEYS.PREVIEW_IMAGE_URL, value: config.previewImageUrl });
  }

  return attrs;
}

export function buildVerandaCustomAttributes(
  config: VerandaCustomAttributes
): ShopifyCartLineAttribute[] {
  const attrs: ShopifyCartLineAttribute[] = [
    { key: ATTRIBUTE_KEYS.CONFIG_TYPE, value: config.configType },
    { key: ATTRIBUTE_KEYS.CUSTOM_WIDTH_CM, value: String(config.customWidthCm) },
    { key: ATTRIBUTE_KEYS.CUSTOM_DEPTH_CM, value: String(config.customDepthCm) },
    { key: ATTRIBUTE_KEYS.KLEUR, value: config.kleur },
    { key: ATTRIBUTE_KEYS.DAKTYPE, value: config.daktype },
    { key: ATTRIBUTE_KEYS.GOOT, value: config.goot },
    { key: ATTRIBUTE_KEYS.BASE_PRICE, value: String(config.basePrice) },
    { key: ATTRIBUTE_KEYS.OPTIONS_TOTAL, value: String(config.optionsTotal) },
    { key: ATTRIBUTE_KEYS.TOTAL_PRICE, value: String(config.totalPrice) },
  ];

  if (config.anchorSizeKey) {
    attrs.push({ key: ATTRIBUTE_KEYS.ANCHOR_SIZE_KEY, value: config.anchorSizeKey });
  }
  if (config.maatwerkFee) {
    attrs.push({ key: ATTRIBUTE_KEYS.MAATWERK_FEE, value: String(config.maatwerkFee) });
  }
  if (config.zijwandLinks && config.zijwandLinks !== 'geen') {
    attrs.push({ key: ATTRIBUTE_KEYS.ZIJWAND_LINKS, value: config.zijwandLinks });
  }
  if (config.zijwandRechts && config.zijwandRechts !== 'geen') {
    attrs.push({ key: ATTRIBUTE_KEYS.ZIJWAND_RECHTS, value: config.zijwandRechts });
  }
  if (config.voorzijde && config.voorzijde !== 'geen') {
    attrs.push({ key: ATTRIBUTE_KEYS.VOORZIJDE, value: config.voorzijde });
  }
  if (config.verlichting) {
    attrs.push({ key: ATTRIBUTE_KEYS.VERLICHTING, value: 'true' });
  }
  if (config.previewImageUrl) {
    attrs.push({ key: ATTRIBUTE_KEYS.PREVIEW_IMAGE_URL, value: config.previewImageUrl });
  }

  return attrs;
}

// =============================================================================
// SANDWICHPANELEN ATTRIBUTES
// =============================================================================

export interface SandwichpanelenAttributes {
  configType: 'sandwichpaneel';
  kleur: string;
  lengteMm: number;
  uProfielenEnabled: boolean;
  uProfielenMeters?: number;
  previewImageUrl?: string;
}

export function buildSandwichpanelenAttributes(
  config: SandwichpanelenAttributes
): ShopifyCartLineAttribute[] {
  const attrs: ShopifyCartLineAttribute[] = [
    { key: ATTRIBUTE_KEYS.CONFIG_TYPE, value: config.configType },
    { key: ATTRIBUTE_KEYS.KLEUR, value: config.kleur },
    { key: ATTRIBUTE_KEYS.LENGTE_MM, value: String(config.lengteMm) },
    { key: ATTRIBUTE_KEYS.U_PROFIELEN_ENABLED, value: String(config.uProfielenEnabled) },
  ];

  if (config.uProfielenEnabled && config.uProfielenMeters) {
    attrs.push({ key: ATTRIBUTE_KEYS.U_PROFIELEN_METERS, value: String(config.uProfielenMeters) });
  }
  if (config.previewImageUrl) {
    attrs.push({ key: ATTRIBUTE_KEYS.PREVIEW_IMAGE_URL, value: config.previewImageUrl });
  }

  return attrs;
}

// =============================================================================
// ATTRIBUTE PARSING
// =============================================================================

/**
 * Parse attributes from a cart line into a typed object
 */
export function parseCartLineAttributes(
  attributes: ShopifyCartLineAttribute[]
): Record<string, string> {
  const parsed: Record<string, string> = {};
  attributes.forEach(attr => {
    parsed[attr.key] = attr.value;
  });
  return parsed;
}

/**
 * Get the config type from attributes
 */
export function getConfigType(attributes: ShopifyCartLineAttribute[]): ConfigType | null {
  const attr = attributes.find(a => a.key === ATTRIBUTE_KEYS.CONFIG_TYPE);
  return attr?.value as ConfigType | null;
}

/**
 * Get the preview image URL from attributes
 */
export function getPreviewImageUrl(attributes: ShopifyCartLineAttribute[]): string | null {
  const attr = attributes.find(a => a.key === ATTRIBUTE_KEYS.PREVIEW_IMAGE_URL);
  return attr?.value || null;
}

/**
 * Check if line has configuration (is a configurable product)
 */
export function hasConfiguration(attributes: ShopifyCartLineAttribute[]): boolean {
  return attributes.some(a => a.key === ATTRIBUTE_KEYS.CONFIG_TYPE);
}

/**
 * Format attributes for display in cart/checkout
 */
export function formatAttributesForDisplay(
  attributes: ShopifyCartLineAttribute[]
): Array<{ label: string; value: string }> {
  const parsed = parseCartLineAttributes(attributes);
  const display: Array<{ label: string; value: string }> = [];
  
  const configType = parsed[ATTRIBUTE_KEYS.CONFIG_TYPE];
  
  // Common labels mapping
  const labels: Record<string, string> = {
    [ATTRIBUTE_KEYS.PRODUCT_SIZE]: 'Afmeting',
    [ATTRIBUTE_KEYS.KLEUR]: 'Kleur',
    [ATTRIBUTE_KEYS.DAKTYPE]: 'Daktype',
    [ATTRIBUTE_KEYS.GOOT]: 'Goot',
    [ATTRIBUTE_KEYS.ZIJWAND_LINKS]: 'Zijwand Links',
    [ATTRIBUTE_KEYS.ZIJWAND_RECHTS]: 'Zijwand Rechts',
    [ATTRIBUTE_KEYS.VOORZIJDE]: 'Voorzijde',
    [ATTRIBUTE_KEYS.VERLICHTING]: 'Verlichting',
    [ATTRIBUTE_KEYS.LENGTE_MM]: 'Lengte',
    [ATTRIBUTE_KEYS.U_PROFIELEN_METERS]: 'U-profielen',
    [ATTRIBUTE_KEYS.CUSTOM_WIDTH_CM]: 'Breedte',
    [ATTRIBUTE_KEYS.CUSTOM_DEPTH_CM]: 'Diepte',
  };
  
  // Skip these in display
  const skipKeys: string[] = [
    ATTRIBUTE_KEYS.CONFIG_TYPE,
    ATTRIBUTE_KEYS.PREVIEW_IMAGE_URL,
    ATTRIBUTE_KEYS.BASE_PRICE,
    ATTRIBUTE_KEYS.OPTIONS_TOTAL,
    ATTRIBUTE_KEYS.TOTAL_PRICE,
    ATTRIBUTE_KEYS.ANCHOR_SIZE_KEY,
    ATTRIBUTE_KEYS.MAATWERK_FEE,
    ATTRIBUTE_KEYS.U_PROFIELEN_ENABLED,
  ];
  
  Object.entries(parsed).forEach(([key, value]) => {
    if (skipKeys.includes(key)) return;
    if (value === 'geen' || value === 'false') return;
    
    const label = labels[key] || key;
    let displayValue = value;
    
    // Format specific values
    if (key === ATTRIBUTE_KEYS.VERLICHTING && value === 'true') {
      displayValue = 'Ja';
    }
    if (key === ATTRIBUTE_KEYS.LENGTE_MM) {
      displayValue = `${value} mm`;
    }
    if (key === ATTRIBUTE_KEYS.U_PROFIELEN_METERS) {
      displayValue = `${value} meter`;
    }
    if (key === ATTRIBUTE_KEYS.CUSTOM_WIDTH_CM || key === ATTRIBUTE_KEYS.CUSTOM_DEPTH_CM) {
      displayValue = `${value} cm`;
    }
    
    display.push({ label, value: displayValue });
  });
  
  // Add maatwerk indicator if custom
  if (configType === 'veranda_custom') {
    display.unshift({ label: 'Type', value: 'Maatwerk' });
  }
  
  return display;
}
