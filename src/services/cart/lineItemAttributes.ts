/**
 * Line Item Attributes Builder
 * ============================
 * 
 * Centralized helper for building CUSTOMER-FACING Shopify checkout line attributes.
 * These attributes are visible to customers in the Shopify checkout.
 * 
 * DESIGN PRINCIPLES:
 * 1. Only include attributes that are meaningful to customers
 * 2. Use Dutch labels (Kleur, Daktype, etc.)
 * 3. NO technical/internal keys visible (kind, config_id, step, etc.)
 * 4. Keep attributes concise and readable
 * 
 * INTERNAL KEYS (should be prefixed with _ or not shown to customers):
 * - _bundle_key: for grouping related lines in storefront
 * - _kind: for identifying line type in storefront
 * 
 * These are still needed for storefront functionality but are prefixed
 * to minimize chance of display in checkout.
 */

import type { CartItem, VerandaConfig } from '../../../types';
import { formatEUR, toCents } from '../../utils/money';

// =============================================================================
// TYPES
// =============================================================================

export interface ShopifyLineAttribute {
  key: string;
  value: string;
}

// =============================================================================
// LABEL MAPPINGS (Dutch - Customer facing)
// =============================================================================

const COLOR_LABELS: Record<string, string> = {
  ral7016: 'Antraciet (RAL 7016)',
  ral9005: 'Zwart (RAL 9005)',
  ral9001: 'Crème (RAL 9001)',
};

const DAKTYPE_LABELS: Record<string, string> = {
  poly_helder: 'Helder polycarbonaat',
  poly_opaal: 'Opaal polycarbonaat',
  glas: 'Glas',
};

const GOOT_LABELS: Record<string, string> = {
  deluxe: 'Deluxe',
  cube: 'Cube',
  classic: 'Classic',
};

const ZIJWAND_LABELS: Record<string, string> = {
  geen: 'Geen',
  poly_spie: 'Polycarbonaat spie',
  sandwich_poly_spie: 'Sandwichpaneel + poly spie',
  sandwich_polyspie: 'Sandwichpaneel + poly spie',
  sandwich_volledig: 'Volledig sandwichpaneel',
  sandwich_vol: 'Volledig sandwichpaneel',
  glas_schuifwand: 'Glazen schuifwand',
};

const VOORZIJDE_LABELS: Record<string, string> = {
  geen: 'Geen',
  glazen_schuifwand: 'Glazen schuifwand helder',
  glas_schuifwand: 'Glazen schuifwand helder',
  glas_schuifwand_helder: 'Glazen schuifwand helder',
  glas_schuifwand_getint: 'Glazen schuifwand getint',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get human-readable label for a value
 */
function getLabel(value: string | undefined | null, labels: Record<string, string>): string {
  if (!value) return 'Niet opgegeven';
  return labels[value] || value;
}

/**
 * Format boolean as Ja/Nee
 */
function formatBoolean(value: boolean | undefined): string {
  return value ? 'Ja' : 'Nee';
}

/**
 * Generate a short reference ID for support
 */
function generateReferenceId(item: CartItem): string {
  const parts: string[] = [];
  
  // Use product handle/id prefix
  const handle = item.handle || item.slug || item.id || '';
  if (handle) {
    // Extract meaningful part (e.g., "ALUMINIU" from handle)
    const prefix = handle.replace(/[^a-zA-Z]/g, '').slice(0, 8).toUpperCase();
    if (prefix) parts.push(prefix);
  }
  
  // Add config hash or random suffix
  if (item.configHash) {
    parts.push(item.configHash.slice(0, 4).toUpperCase());
  } else {
    // Generate simple hash from config
    const configStr = JSON.stringify(item.config || item.maatwerkPayload || {});
    let hash = 0;
    for (let i = 0; i < configStr.length; i++) {
      const char = configStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    parts.push(Math.abs(hash).toString(36).slice(0, 4).toUpperCase());
  }
  
  return parts.join('-');
}

// =============================================================================
// MAIN PRODUCT ATTRIBUTES
// =============================================================================

/**
 * Build customer-facing attributes for a main product (veranda/maatwerk).
 * 
 * Output format (separate keys for each option):
 * - Kleur: Antraciet (RAL 7016)
 * - Dak: Helder polycarbonaat
 * - Goot: Classic
 * - Zijwand links: Polycarbonaat spie
 * - Zijwand rechts: Sandwichpaneel + poly spie
 * - Voorzijde: Glazen schuifwand getint
 * - Verlichting: Ja/Nee
 * - Referentie: ALUMINIU-XXXX
 */
export function buildMainProductAttributes(item: CartItem): ShopifyLineAttribute[] {
  // Detect if maatwerk or standard veranda
  const isMaatwerk = item.type === 'custom_veranda' || !!item.maatwerkPayload;
  
  if (isMaatwerk) {
    return buildMaatwerkMainAttributes(item);
  }
  
  return buildVerandaMainAttributes(item);
}

/**
 * Build attributes for standard veranda
 */
function buildVerandaMainAttributes(item: CartItem): ShopifyLineAttribute[] {
  const config = item.config?.data as VerandaConfig | undefined;
  const attributes: ShopifyLineAttribute[] = [];
  
  if (!config) {
    console.log('[LineItemAttributes] Standard veranda has no config data');
    return [];
  }
  
  // Color
  const color = config.color || config.kleur;
  if (color) {
    attributes.push({ key: 'Kleur', value: getLabel(color, COLOR_LABELS) });
  }
  
  // Daktype
  if (config.daktype) {
    attributes.push({ key: 'Dak', value: getLabel(config.daktype, DAKTYPE_LABELS) });
  }
  
  // Goot
  if (config.goot) {
    attributes.push({ key: 'Goot', value: getLabel(config.goot, GOOT_LABELS) });
  }
  
  // Zijwanden
  attributes.push({ 
    key: 'Zijwand links', 
    value: getLabel(config.zijwand_links || 'geen', ZIJWAND_LABELS) 
  });
  attributes.push({ 
    key: 'Zijwand rechts', 
    value: getLabel(config.zijwand_rechts || 'geen', ZIJWAND_LABELS) 
  });
  
  // Voorzijde
  attributes.push({ 
    key: 'Voorzijde', 
    value: getLabel(config.voorzijde || 'geen', VOORZIJDE_LABELS) 
  });
  
  // Verlichting
  attributes.push({ key: 'Verlichting', value: formatBoolean(config.verlichting) });
  // Montage
  attributes.push({ key: 'Montage', value: formatBoolean((config as any).montage) });
  
  // Reference ID
  const refId = generateReferenceId(item);
  attributes.push({ key: 'Referentie', value: refId });
  
  return attributes;
}

/**
 * Build attributes for maatwerk veranda
 */
function buildMaatwerkMainAttributes(item: CartItem): ShopifyLineAttribute[] {
  const payload = item.maatwerkPayload;
  const attributes: ShopifyLineAttribute[] = [];
  
  if (!payload) {
    console.log('[LineItemAttributes] Maatwerk has no payload');
    return [];
  }
  
  // Helper to get selection value
  const getSelection = (groupId: string): string | undefined => {
    const sel = payload.selections.find(s => s.groupId === groupId);
    return sel?.choiceLabel;
  };
  
  // Color
  const color = getSelection('kleur') || getSelection('color');
  if (color) {
    attributes.push({ key: 'Kleur', value: color });
  }
  
  // Daktype
  const daktype = getSelection('daktype') || getSelection('dak');
  if (daktype) {
    attributes.push({ key: 'Dak', value: daktype });
  }
  
  // Goot
  const goot = getSelection('goot');
  if (goot) {
    attributes.push({ key: 'Goot', value: goot });
  }
  
  // Zijwanden
  attributes.push({ 
    key: 'Zijwand links', 
    value: getSelection('zijwand_links') || getSelection('zijwandLinks') || 'Geen' 
  });
  attributes.push({ 
    key: 'Zijwand rechts', 
    value: getSelection('zijwand_rechts') || getSelection('zijwandRechts') || 'Geen' 
  });
  
  // Voorzijde
  attributes.push({ 
    key: 'Voorzijde', 
    value: getSelection('voorzijde') || 'Geen' 
  });
  
  // Verlichting
  const verlichting = getSelection('verlichting');
  attributes.push({ 
    key: 'Verlichting', 
    value: verlichting && verlichting !== 'Geen' && verlichting !== 'geen' ? 'Ja' : 'Nee' 
  });
  // Montage
  const montage = getSelection('montage');
  attributes.push({
    key: 'Montage',
    value: montage ? 'Ja' : 'Nee',
  });
  
  // Reference ID
  const refId = generateReferenceId(item);
  attributes.push({ key: 'Referentie', value: refId });
  
  return attributes;
}

// =============================================================================
// LED ATTRIBUTES
// =============================================================================

/**
 * Build customer-facing attributes for LED line.
 * 
 * Output format:
 * - Aantal spots: 12
 * - Prijs per spot: € 29,99
 * 
 * NO technical keys: addon, width_cm, derived_qty, unit_price
 */
export function buildLedAttributes(params: {
  qty: number;
  unitPriceEur: number;
}): ShopifyLineAttribute[] {
  const { qty, unitPriceEur } = params;
  
  // Format price with comma as decimal separator (Dutch)
  const priceFormatted = `€ ${unitPriceEur.toFixed(2).replace('.', ',')}`;
  
  return [
    { key: 'Aantal spots', value: String(qty) },
    { key: 'Prijs per spot', value: priceFormatted },
  ];
}

// =============================================================================
// SURCHARGE ATTRIBUTES
// =============================================================================

/**
 * Build customer-facing attributes for surcharge (config options) line.
 * 
 * Output format - SINGLE attribute:
 * - Toelichting: "Glazen schuifwand getint (+€1.150), Polycarbonaat spie (+€215), ..."
 * 
 * NO technical keys: kind, step, config_type, config_handle, config_title, config_id
 */
export function buildSurchargeAttributes(params: {
  selectedOptions: Array<{ label: string; priceEur: number }>;
}): ShopifyLineAttribute[] {
  const { selectedOptions } = params;
  
  // Filter out zero-price options and deduplicate
  const uniqueOptions = new Map<string, number>();
  for (const opt of selectedOptions) {
    if (opt.priceEur > 0) {
      // If same label exists, keep the higher price (shouldn't happen but safe)
      const existing = uniqueOptions.get(opt.label) || 0;
      uniqueOptions.set(opt.label, Math.max(existing, opt.priceEur));
    }
  }
  
  if (uniqueOptions.size === 0) {
    return [{ key: 'Toelichting', value: 'Configuratie opties' }];
  }
  
  // Format: "Optienaam (+€X,XX)"
  const parts: string[] = [];
  for (const [label, price] of uniqueOptions) {
    const priceFormatted = price.toFixed(2).replace('.', ',');
    parts.push(`${label} (+€${priceFormatted})`);
  }
  
  return [{ key: 'Toelichting', value: parts.join(', ') }];
}

// =============================================================================
// INTERNAL BUNDLE ATTRIBUTES (prefixed to avoid checkout display)
// =============================================================================

/**
 * Build internal attributes for bundle grouping.
 * These are prefixed with "_" to minimize chance of display in checkout.
 * 
 * Note: Shopify may still display these, but the underscore prefix
 * is a common convention to indicate internal/system attributes.
 */
export function buildBundleGroupingAttributes(params: {
  bundleKey: string;
  kind: 'main_product' | 'led_addon' | 'config_surcharge';
}): ShopifyLineAttribute[] {
  return [
    { key: '_bundle_key', value: params.bundleKey },
    { key: '_kind', value: params.kind },
  ];
}

// =============================================================================
// SANDWICHPANELEN ATTRIBUTES
// =============================================================================

/**
 * Build customer-facing attributes for sandwichpanelen
 */
export function buildSandwichpanelenAttributes(item: CartItem): ShopifyLineAttribute[] {
  const config = item.config?.data as Record<string, unknown> | undefined;
  const attributes: ShopifyLineAttribute[] = [];
  
  if (!config) return [];
  
  // Working width
  if (config.workingWidthMm) {
    attributes.push({ key: 'Werkende breedte', value: `${config.workingWidthMm} mm` });
  }
  
  // Length
  const length = config.lengthMm || config.length;
  if (length) {
    attributes.push({ key: 'Lengte', value: `${length} mm` });
  }
  
  // Color
  const color = (config.color || config.kleur) as string | undefined;
  if (color) {
    attributes.push({ key: 'Kleur', value: getLabel(color, COLOR_LABELS) });
  }
  
  // U-profiles
  const extras = config.extras as { uProfiles?: { enabled?: boolean; meters?: number } } | undefined;
  if (extras?.uProfiles?.enabled) {
    attributes.push({ key: 'U-profielen', value: `${extras.uProfiles.meters} m` });
  } else if (config.extra_u_profielen_m) {
    attributes.push({ key: 'U-profielen', value: `${config.extra_u_profielen_m} m` });
  }
  
  // Reference ID
  const refId = generateReferenceId(item);
  attributes.push({ key: 'Referentie', value: refId });
  
  return attributes;
}

// =============================================================================
// UTILITY: DETECT CONFIG TYPE
// =============================================================================

type ConfigType = 'veranda' | 'maatwerk' | 'sandwichpaneel' | 'accessoire';

export function detectConfigType(item: CartItem): ConfigType {
  if (item.type === 'custom_veranda' || item.maatwerkPayload) {
    return 'maatwerk';
  }
  
  if (item.type === 'sandwichpanelen' || item.config?.category === 'sandwichpanelen') {
    return 'sandwichpaneel';
  }
  
  if (item.config?.category === 'verandas') {
    return 'veranda';
  }
  
  return 'accessoire';
}

// =============================================================================
// UNIFIED ATTRIBUTE BUILDER (for main products)
// =============================================================================

/**
 * Build all customer-facing attributes for a cart item.
 * Automatically detects config type and builds appropriate attributes.
 */
export function toCleanShopifyLineAttributes(item: CartItem): ShopifyLineAttribute[] {
  const configType = detectConfigType(item);
  
  console.log(`[LineItemAttributes] Building attributes for type: ${configType}`);
  
  switch (configType) {
    case 'veranda':
    case 'maatwerk':
      return buildMainProductAttributes(item);
    case 'sandwichpaneel':
      return buildSandwichpanelenAttributes(item);
    case 'accessoire':
    default:
      // Accessories don't have config attributes
      return [];
  }
}
