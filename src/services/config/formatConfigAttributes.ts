/**
 * Format Configuration Attributes for Shopify Checkout
 * 
 * Converts raw cart item configuration into human-readable attributes
 * for display in Shopify checkout and order details.
 * 
 * Output: Single "Configuratie" multiline attribute + optional "Referentie" ID
 */

import type { CartItem, VerandaConfig, SandwichConfig } from '../../../types';
import { formatEUR, toCents } from '../../utils/money';

// =============================================================================
// TYPES
// =============================================================================

export interface ShopifyLineAttribute {
  key: string;
  value: string;
}

// =============================================================================
// LABEL MAPPINGS (Dutch)
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
};

const VOORZIJDE_LABELS: Record<string, string> = {
  geen: 'Geen',
  // Legacy keys (map to helder for backwards compatibility)
  glazen_schuifwand: 'Glazen schuifwand helder',
  glas_schuifwand: 'Glazen schuifwand helder',
  // New keys
  glas_schuifwand_helder: 'Glazen schuifwand helder',
  glas_schuifwand_getint: 'Glazen schuifwand getint',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get human-readable label for a value, with fallback
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
 * Generate a short config ID from item data (for support reference)
 */
function generateConfigId(item: CartItem): string {
  const parts: string[] = [];
  
  // Use product handle/id
  if (item.id) parts.push(item.id.slice(0, 8));
  
  // Add config hash if available
  if (item.configHash) {
    parts.push(item.configHash.slice(0, 6));
  } else {
    // Generate simple hash from config
    const configStr = JSON.stringify(item.config || item.maatwerkPayload || {});
    let hash = 0;
    for (let i = 0; i < configStr.length; i++) {
      const char = configStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    parts.push(Math.abs(hash).toString(36).slice(0, 6));
  }
  
  return parts.join('-').toUpperCase();
}

/**
 * Get absolute URL for preview image
 */
function getPreviewUrl(item: CartItem): string | null {
  const relativePath = item.render?.baseImageUrl || item.maatwerkPayload?.renderPreview;
  
  if (!relativePath) return null;
  
  // If already absolute URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Build absolute URL
  const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '');
  
  // Ensure path starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${baseUrl}${path}`;
}

// =============================================================================
// CONFIG TYPE DETECTION
// =============================================================================

type ConfigType = 'veranda' | 'maatwerk' | 'sandwichpaneel' | 'accessoire';

function detectConfigType(item: CartItem): ConfigType {
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
// FORMATTERS
// =============================================================================

/**
 * Format standard veranda configuration summary
 */
function formatVerandaSummary(item: CartItem): string {
  const config = item.config?.data as VerandaConfig | undefined;
  
  if (!config) return 'Configuratie: Niet beschikbaar';
  
  const parts: string[] = [];
  
  // Color
  const color = config.color || config.kleur;
  if (color) {
    parts.push(`Kleur: ${getLabel(color, COLOR_LABELS)}`);
  }
  
  // Daktype
  if (config.daktype) {
    parts.push(`Dak: ${getLabel(config.daktype, DAKTYPE_LABELS)}`);
  }
  
  // Goot
  if (config.goot) {
    parts.push(`Goot: ${getLabel(config.goot, GOOT_LABELS)}`);
  }
  
  // Zijwanden
  parts.push(`Zijwand links: ${getLabel(config.zijwand_links || 'geen', ZIJWAND_LABELS)}`);
  parts.push(`Zijwand rechts: ${getLabel(config.zijwand_rechts || 'geen', ZIJWAND_LABELS)}`);
  
  // Voorzijde
  parts.push(`Voorzijde: ${getLabel(config.voorzijde || 'geen', VOORZIJDE_LABELS)}`);
  
  // Verlichting
  parts.push(`Verlichting: ${formatBoolean(config.verlichting)}`);
  // Montage
  parts.push(`Montage: ${formatBoolean((config as any).montage)}`);
  
  return parts.join(' • ');
}

/**
 * Format maatwerk veranda configuration summary
 */
function formatMaatwerkSummary(item: CartItem): string {
  const payload = item.maatwerkPayload;
  
  if (!payload) return 'Configuratie: Niet beschikbaar';
  
  const parts: string[] = [];
  
  // Maatwerk indicator with fee
  const maatwerkFee = payload.priceBreakdown?.anchor?.customFee || 750;
  parts.push(`Maatwerk: Ja (+${formatEUR(toCents(maatwerkFee), 'cents')})`);
  
  // Dimensions
  parts.push(`Breedte: ${payload.size.width}cm`);
  parts.push(`Diepte: ${payload.size.depth}cm`);
  
  // Get config values from selections
  const getSelection = (groupId: string): string | undefined => {
    const sel = payload.selections.find(s => s.groupId === groupId);
    return sel?.choiceLabel;
  };
  
  // Color
  const color = getSelection('kleur') || getSelection('color');
  if (color) {
    parts.push(`Kleur: ${color}`);
  }
  
  // Daktype
  const daktype = getSelection('daktype') || getSelection('dak');
  if (daktype) {
    parts.push(`Dak: ${daktype}`);
  }
  
  // Goot
  const goot = getSelection('goot');
  if (goot) {
    parts.push(`Goot: ${goot}`);
  }
  
  // Zijwanden
  const zijwandLinks = getSelection('zijwand_links') || getSelection('zijwandLinks') || 'Geen';
  const zijwandRechts = getSelection('zijwand_rechts') || getSelection('zijwandRechts') || 'Geen';
  parts.push(`Zijwand links: ${zijwandLinks}`);
  parts.push(`Zijwand rechts: ${zijwandRechts}`);
  
  // Voorzijde
  const voorzijde = getSelection('voorzijde') || 'Geen';
  parts.push(`Voorzijde: ${voorzijde}`);
  
  // Verlichting
  const verlichting = getSelection('verlichting');
  if (verlichting) {
    parts.push(`Verlichting: ${verlichting}`);
  }
  const montage = getSelection('montage');
  parts.push(`Montage: ${montage ? 'Ja' : 'Nee'}`);
  
  return parts.join(' • ');
}

/**
 * Format sandwichpanelen configuration summary
 */
function formatSandwichpanelenSummary(item: CartItem): string {
  const config = item.config?.data as SandwichConfig | undefined;
  
  if (!config) return 'Configuratie: Niet beschikbaar';
  
  const parts: string[] = [];
  
  // Working width
  if (config.workingWidthMm) {
    parts.push(`Werkende breedte: ${config.workingWidthMm}mm`);
  }
  
  // Length
  const length = config.lengthMm || config.length;
  if (length) {
    parts.push(`Lengte: ${length}mm`);
  }
  
  // Color
  const color = config.color || config.kleur;
  if (color) {
    parts.push(`Kleur: ${getLabel(color, COLOR_LABELS)}`);
  }
  
  // U-profiles
  if (config.extras?.uProfiles?.enabled) {
    parts.push(`U-profielen: ${config.extras.uProfiles.meters}m`);
  } else if (config.extra_u_profielen_m) {
    parts.push(`U-profielen: ${config.extra_u_profielen_m}m`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'Standaard configuratie';
}

// =============================================================================
// INDIVIDUAL ATTRIBUTE BUILDERS
// =============================================================================

/**
 * Build single clean Configuratie attribute for standard veranda
 * Combines all options into one readable multiline value for Shopify checkout
 */
function buildVerandaAttributes(item: CartItem): ShopifyLineAttribute[] {
  const config = item.config?.data as VerandaConfig | undefined;
  
  if (!config) return [];
  
  // Build multiline configuration summary
  const lines: string[] = [];
  
  // Color (Kleur)
  const color = config.color || config.kleur;
  if (color) {
    lines.push(`Kleur: ${getLabel(color, COLOR_LABELS)}`);
  }
  
  // Daktype
  if (config.daktype) {
    lines.push(`Daktype: ${getLabel(config.daktype, DAKTYPE_LABELS)}`);
  }
  
  // Goot
  if (config.goot) {
    lines.push(`Goot: ${getLabel(config.goot, GOOT_LABELS)}`);
  }
  
  // Zijwand links
  lines.push(`Zijwand links: ${getLabel(config.zijwand_links || 'geen', ZIJWAND_LABELS)}`);
  
  // Zijwand rechts
  lines.push(`Zijwand rechts: ${getLabel(config.zijwand_rechts || 'geen', ZIJWAND_LABELS)}`);
  
  // Voorzijde
  lines.push(`Voorzijde: ${getLabel(config.voorzijde || 'geen', VOORZIJDE_LABELS)}`);
  
  // Verlichting
  lines.push(`Verlichting: ${formatBoolean(config.verlichting)}`);
  // Montage
  lines.push(`Montage: ${formatBoolean((config as any).montage)}`);
  
  return [{ key: 'Configuratie', value: lines.join('\n') }];
}

/**
 * Build single clean Configuratie attribute for maatwerk veranda
 * Combines all options into one readable multiline value for Shopify checkout
 */
function buildMaatwerkAttributes(item: CartItem): ShopifyLineAttribute[] {
  const payload = item.maatwerkPayload;
  
  if (!payload) return [];
  
  // Helper to get selection value
  const getSelection = (groupId: string): string | undefined => {
    const sel = payload.selections.find(s => s.groupId === groupId);
    return sel?.choiceLabel;
  };
  
  // Build multiline configuration summary
  const lines: string[] = [];
  
  // Dimensions (actual slider value)
  lines.push(`Afmeting: ${payload.size.width} × ${payload.size.depth} cm`);
  lines.push(`Type: Maatwerk`);
  
  // Color
  const color = getSelection('kleur') || getSelection('color');
  if (color) {
    lines.push(`Kleur: ${color}`);
  }
  
  // Daktype
  const daktype = getSelection('daktype') || getSelection('dak');
  if (daktype) {
    lines.push(`Daktype: ${daktype}`);
  }
  
  // Goot
  const goot = getSelection('goot');
  if (goot) {
    lines.push(`Goot: ${goot}`);
  }
  
  // Zijwanden
  lines.push(`Zijwand links: ${getSelection('zijwand_links') || getSelection('zijwandLinks') || 'Geen'}`);
  lines.push(`Zijwand rechts: ${getSelection('zijwand_rechts') || getSelection('zijwandRechts') || 'Geen'}`);
  
  // Voorzijde
  lines.push(`Voorzijde: ${getSelection('voorzijde') || 'Geen'}`);
  
  // Verlichting
  const verlichting = getSelection('verlichting');
  lines.push(`Verlichting: ${verlichting ? 'Ja' : 'Nee'}`);
  const montage = getSelection('montage');
  lines.push(`Montage: ${montage ? 'Ja' : 'Nee'}`);
  
  return [{ key: 'Configuratie', value: lines.join('\n') }];
}

/**
 * Build single clean Configuratie attribute for sandwichpanelen
 * Combines all options into one readable multiline value for Shopify checkout
 */
function buildSandwichpanelenAttributes(item: CartItem): ShopifyLineAttribute[] {
  const config = item.config?.data as SandwichConfig | undefined;
  
  if (!config) return [];
  
  // Build multiline configuration summary
  const lines: string[] = [];
  
  // Working width
  if (config.workingWidthMm) {
    lines.push(`Werkende breedte: ${config.workingWidthMm} mm`);
  }
  
  // Length
  const length = config.lengthMm || config.length;
  if (length) {
    lines.push(`Lengte: ${length} mm`);
  }
  
  // Color
  const color = config.color || config.kleur;
  if (color) {
    lines.push(`Kleur: ${getLabel(color, COLOR_LABELS)}`);
  }
  
  // U-profiles
  if (config.extras?.uProfiles?.enabled) {
    lines.push(`U-profielen: ${config.extras.uProfiles.meters} m`);
  } else if (config.extra_u_profielen_m) {
    lines.push(`U-profielen: ${config.extra_u_profielen_m} m`);
  }
  
  if (lines.length === 0) {
    return [];
  }
  
  return [{ key: 'Configuratie', value: lines.join('\n') }];
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Convert a cart item to clean Shopify line attributes
 * 
 * Output attributes:
 * - Individual config options as separate keys (Kleur, Daktype, Goot, etc.)
 * - "Preview": Absolute URL to preview image (if available)
 * - "Config-ID": Short reference ID for support
 * 
 * @param item - Cart item with configuration
 * @returns Array of Shopify line attributes
 */
export function toShopifyLineAttributes(item: CartItem): ShopifyLineAttribute[] {
  const configType = detectConfigType(item);
  
  // Accessories don't have config attributes
  if (configType === 'accessoire') {
    console.log('[Checkout Attributes] Accessoire - no config attributes');
    return [];
  }
  
  const attributes: ShopifyLineAttribute[] = [];
  
  // Build single "Configuratie" attribute based on config type
  let configAttributes: ShopifyLineAttribute[] = [];
  switch (configType) {
    case 'veranda':
      configAttributes = buildVerandaAttributes(item);
      break;
    case 'maatwerk':
      configAttributes = buildMaatwerkAttributes(item);
      break;
    case 'sandwichpaneel':
      configAttributes = buildSandwichpanelenAttributes(item);
      break;
  }
  
  // Add config attributes (single "Configuratie" multiline attribute)
  attributes.push(...configAttributes);
  
  // Config ID for support reference (optional second attribute)
  const configId = generateConfigId(item);
  attributes.push({ key: 'Referentie', value: configId });
  
  // Log for debugging
  console.log('[Checkout Attributes]', {
    type: configType,
    attributeCount: attributes.length,
  });
  
  return attributes;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use toShopifyLineAttributes instead
 */
export const formatConfigAttributes = toShopifyLineAttributes;
