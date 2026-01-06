/**
 * Format Configuration Attributes for Shopify Checkout
 * 
 * Converts raw cart item configuration into human-readable attributes
 * for display in Shopify checkout and order details.
 */

import type { CartItem, VerandaConfig, SandwichConfig } from '../../../types';
import { formatEUR, toCents } from '../../utils/money';
import { MAATWERK_DEPTH_BUCKETS, MAATWERK_WIDTH_BUCKETS, mapToBucket } from '../../configurators/custom/maatwerkShopifyMapping';

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
 * Build individual Shopify line attributes for standard veranda
 * Each config option gets its own attribute with human-readable key/value
 */
function buildVerandaAttributes(item: CartItem): ShopifyLineAttribute[] {
  const config = item.config?.data as VerandaConfig | undefined;
  const attributes: ShopifyLineAttribute[] = [];
  
  if (!config) return attributes;
  
  // Color (Kleur)
  const color = config.color || config.kleur;
  if (color) {
    attributes.push({ key: 'Kleur', value: getLabel(color, COLOR_LABELS) });
  }
  
  // Daktype (Dak)
  if (config.daktype) {
    attributes.push({ key: 'Daktype', value: getLabel(config.daktype, DAKTYPE_LABELS) });
  }
  
  // Goot
  if (config.goot) {
    attributes.push({ key: 'Goot', value: getLabel(config.goot, GOOT_LABELS) });
  }
  
  // Zijwand links
  attributes.push({ 
    key: 'Zijwand links', 
    value: getLabel(config.zijwand_links || 'geen', ZIJWAND_LABELS) 
  });
  
  // Zijwand rechts
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
  attributes.push({ 
    key: 'Verlichting', 
    value: formatBoolean(config.verlichting) 
  });
  
  return attributes;
}

/**
 * Build individual Shopify line attributes for maatwerk veranda
 * Includes readable pricing breakdown with maatwerk_toeslag
 */
function buildMaatwerkAttributes(item: CartItem): ShopifyLineAttribute[] {
  const payload = item.maatwerkPayload;
  const attributes: ShopifyLineAttribute[] = [];
  
  if (!payload) return attributes;
  
  // Config type indicator
  attributes.push({ key: 'config_type', value: 'maatwerk' });
  
  // Dimensions (actual slider value, not bucket)
  attributes.push({ key: 'maat', value: `${payload.size.width} x ${payload.size.depth} cm` });
  
  // Pricing breakdown - always show with 2 decimals
  const shopifyVariantPrice = payload.shopifyVariantPrice ?? payload.priceBreakdown?.shopifyVariantPrice ?? payload.priceBreakdown?.anchor?.anchorPrice ?? 0;
  const maatwerkSurcharge = payload.maatwerkSurcharge ?? payload.priceBreakdown?.maatwerkSurcharge ?? 750;
  const optionsTotal = payload.optionsTotal ?? payload.priceBreakdown?.optionsTotal ?? 0;
  const grandTotal = payload.totalPrice ?? payload.priceBreakdown?.grandTotal ?? 0;
  
  attributes.push({ key: 'prijs_basis', value: formatEUR(toCents(shopifyVariantPrice), 'cents') });
  attributes.push({ key: 'maatwerk_toeslag', value: formatEUR(toCents(maatwerkSurcharge), 'cents') });
  attributes.push({ key: 'opties_totaal', value: formatEUR(toCents(optionsTotal), 'cents') });
  attributes.push({ key: 'totaal', value: formatEUR(toCents(grandTotal), 'cents') });
  
  // Helper to get selection value
  const getSelection = (groupId: string): string | undefined => {
    const sel = payload.selections.find(s => s.groupId === groupId);
    return sel?.choiceLabel;
  };
  
  // Color
  const color = getSelection('kleur') || getSelection('color');
  if (color) {
    attributes.push({ key: 'kleur', value: color });
  }
  
  // Daktype
  const daktype = getSelection('daktype') || getSelection('dak');
  if (daktype) {
    attributes.push({ key: 'daktype', value: daktype });
  }
  
  // Goot
  const goot = getSelection('goot');
  if (goot) {
    attributes.push({ key: 'goot', value: goot });
  }
  
  // Zijwanden
  attributes.push({ 
    key: 'zijwand_links', 
    value: getSelection('zijwand_links') || getSelection('zijwandLinks') || 'Geen' 
  });
  attributes.push({ 
    key: 'zijwand_rechts', 
    value: getSelection('zijwand_rechts') || getSelection('zijwandRechts') || 'Geen' 
  });
  
  // Voorzijde
  attributes.push({ 
    key: 'voorzijde', 
    value: getSelection('voorzijde') || 'Geen' 
  });
  
  // Verlichting
  const verlichting = getSelection('verlichting');
  if (verlichting) {
    attributes.push({ key: 'verlichting', value: verlichting });
  }
  
  return attributes;
}

/**
 * Build individual Shopify line attributes for sandwichpanelen
 */
function buildSandwichpanelenAttributes(item: CartItem): ShopifyLineAttribute[] {
  const config = item.config?.data as SandwichConfig | undefined;
  const attributes: ShopifyLineAttribute[] = [];
  
  if (!config) return attributes;
  
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
  const color = config.color || config.kleur;
  if (color) {
    attributes.push({ key: 'Kleur', value: getLabel(color, COLOR_LABELS) });
  }
  
  // U-profiles
  if (config.extras?.uProfiles?.enabled) {
    attributes.push({ key: 'U-profielen', value: `${config.extras.uProfiles.meters} m` });
  } else if (config.extra_u_profielen_m) {
    attributes.push({ key: 'U-profielen', value: `${config.extra_u_profielen_m} m` });
  }
  
  return attributes;
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

  // Extra machine-readable attributes for maatwerk mapping/troubleshooting (underscore prefix = internal)
  if (configType === 'maatwerk') {
    const originalWidthCm = item.maatwerkPayload?.size?.width ?? (item as any)?.config?.data?.widthCm;
    const originalDepthCm = item.maatwerkPayload?.size?.depth ?? (item as any)?.config?.data?.depthCm;

    const bucketW =
      item.maatwerkPayload?.bucketWidthCm ??
      (item as any)?.config?.data?.bucketWidthCm ??
      (typeof originalWidthCm === 'number' ? mapToBucket(originalWidthCm, MAATWERK_WIDTH_BUCKETS) : undefined);
    const bucketD =
      item.maatwerkPayload?.bucketDepthCm ??
      (item as any)?.config?.data?.bucketDepthCm ??
      (typeof originalDepthCm === 'number' ? mapToBucket(originalDepthCm, MAATWERK_DEPTH_BUCKETS) : undefined);

    // Internal bucket info (for order processing, not display)
    if (typeof bucketW === 'number') {
      attributes.push({ key: '_bucket_breedte', value: String(bucketW) });
    }
    if (typeof bucketD === 'number') {
      attributes.push({ key: '_bucket_diepte', value: String(bucketD) });
    }
    // NOTE: JSON blob removed - all config is now in readable attributes above
  }
  
  // Build individual attributes based on config type
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
  
  // Add config attributes
  attributes.push(...configAttributes);
  
  // Preview image (if available)
  const previewUrl = getPreviewUrl(item);
  if (previewUrl) {
    attributes.push({ key: 'Preview', value: previewUrl });
    // Also add the explicit key expected by ShopifyCartContext and integrations
    attributes.push({ key: '_preview_url', value: previewUrl });
  }
  
  // Config ID for support reference
  const configId = generateConfigId(item);
  attributes.push({ key: 'Referentie', value: configId });
  
  // Log for debugging
  console.log('[Checkout Attributes]', {
    type: configType,
    attributes: attributes.map(a => ({ key: a.key, value: a.value.slice(0, 100) + (a.value.length > 100 ? '...' : '') })),
  });
  
  return attributes;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use toShopifyLineAttributes instead
 */
export const formatConfigAttributes = toShopifyLineAttributes;
