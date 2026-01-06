/**
 * Maatwerk Veranda Configurator - Types
 * ======================================
 * 
 * Isolated types for the custom/maatwerk veranda configurator.
 * Completely separate from the product-based veranda configurator.
 * 
 * NO localStorage persistence.
 * NO shared state with existing configurator.
 */

// =============================================================================
// SIZE CONSTANTS & TYPES
// =============================================================================

/** Minimum width in cm */
export const MAATWERK_WIDTH_MIN = 250;
/** Maximum width in cm */
export const MAATWERK_WIDTH_MAX = 1200;
/** Minimum depth in cm */
export const MAATWERK_DEPTH_MIN = 250;
/** Maximum depth in cm */
export const MAATWERK_DEPTH_MAX = 500;

/** Size selection for maatwerk - continuous values */
export interface MaatwerkSize {
  width: number;  // 250-1200 cm
  depth: number;  // 250-500 cm
}

/** Validate width is within allowed range */
export function isValidMaatwerkWidth(width: number): boolean {
  return width >= MAATWERK_WIDTH_MIN && width <= MAATWERK_WIDTH_MAX;
}

/** Validate depth is within allowed range */
export function isValidMaatwerkDepth(depth: number): boolean {
  return depth >= MAATWERK_DEPTH_MIN && depth <= MAATWERK_DEPTH_MAX;
}

/** Clamp width to valid range */
export function clampMaatwerkWidth(width: number): number {
  return Math.max(MAATWERK_WIDTH_MIN, Math.min(MAATWERK_WIDTH_MAX, Math.round(width)));
}

/** Clamp depth to valid range */
export function clampMaatwerkDepth(depth: number): number {
  return Math.max(MAATWERK_DEPTH_MIN, Math.min(MAATWERK_DEPTH_MAX, Math.round(depth)));
}

// =============================================================================
// OPTION TYPES
// =============================================================================

/** Color ID type for veranda profile colors */
export type MaatwerkColorId = 'ral7016' | 'ral9005' | 'ral9001';

/** Roof type options */
export type MaatwerkDaktypeValue = 'poly_helder' | 'poly_opaal';

/** Front side options */
export type MaatwerkVoorzijdeValue = 'geen' | 'glas_schuifwand' | 'glas_schuifwand_helder' | 'glas_schuifwand_getint';

/** Side wall options (same for left and right) */
export type MaatwerkZijwandValue = 'geen' | 'poly_spie' | 'sandwich_polyspie' | 'sandwich_vol';

/** Gutter options */
export type MaatwerkGootValue = 'classic' | 'cube' | 'deluxe';

// =============================================================================
// CONFIGURATION STATE
// =============================================================================

/**
 * Complete maatwerk veranda configuration
 */
export interface MaatwerkConfig {
  // Size (Step 1)
  size: MaatwerkSize;
  
  // Options (Step 2+)
  color: MaatwerkColorId;
  daktype: MaatwerkDaktypeValue;
  goot: MaatwerkGootValue;
  zijwand_links: MaatwerkZijwandValue;
  zijwand_rechts: MaatwerkZijwandValue;
  voorzijde: MaatwerkVoorzijdeValue;
  verlichting: boolean;
}

/**
 * Partial config for building state incrementally
 */
export type PartialMaatwerkConfig = Partial<MaatwerkConfig> & {
  size?: MaatwerkSize;
};

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_MAATWERK_SIZE: MaatwerkSize = {
  width: 600,
  depth: 300,
};

export const DEFAULT_MAATWERK_CONFIG: PartialMaatwerkConfig = {
  size: DEFAULT_MAATWERK_SIZE,
  color: 'ral7016',
  // Required fields start undefined - force user selection
  daktype: undefined,
  goot: undefined,
  // Optional fields default to 'geen' or false
  zijwand_links: 'geen',
  zijwand_rechts: 'geen',
  voorzijde: 'geen',
  verlichting: false,
};

// =============================================================================
// UI OPTION DEFINITIONS
// =============================================================================

export const MAATWERK_COLOR_OPTIONS: Array<{
  id: MaatwerkColorId;
  label: string;
  hex: string;
  description: string;
}> = [
  {
    id: 'ral7016',
    label: 'Antraciet (RAL 7016)',
    hex: '#293133',
    description: 'Populaire donkergrijze kleur, past bij moderne architectuur.',
  },
  {
    id: 'ral9005',
    label: 'Zwart (RAL 9005)',
    hex: '#0E0E10',
    description: 'Strakke zwarte afwerking voor een premium uitstraling.',
  },
  {
    id: 'ral9001',
    label: 'Crème (RAL 9001)',
    hex: '#FDF4E3',
    description: 'Warme crèmewitte kleur, ideaal bij lichte gevels.',
  },
];

// =============================================================================
// CART PAYLOAD TYPES
// =============================================================================

/**
 * Selection item for price breakdown
 */
export interface MaatwerkSelection {
  groupId: string;
  groupLabel: string;
  choiceId: string;
  choiceLabel: string;
  price: number;
}

/**
 * Anchor product info for pricing reference
 */
export interface MaatwerkAnchorInfo {
  /** The anchor size key (e.g., "606x350") */
  anchorSizeKey: string;
  /** The anchor product's base price (from Shopify variant) */
  anchorPrice: number;
  /** Custom fee added for maatwerk (€750) */
  customFee: number;
}

/**
 * Price breakdown for maatwerk items
 */
export interface MaatwerkPriceBreakdown {
  /** Base price = shopifyVariantPrice + maatwerkSurcharge */
  basePrice: number;
  /** Base price from Shopify variant (before surcharge) */
  shopifyVariantPrice?: number;
  /** Maatwerk surcharge (€750) */
  maatwerkSurcharge?: number;
  selections: MaatwerkSelection[];
  optionsTotal: number;
  grandTotal: number;
  /** Anchor product info (for reference) */
  anchor?: MaatwerkAnchorInfo;
}

/**
 * Cart payload for maatwerk veranda items
 */
export interface MaatwerkCartPayload {
  type: 'maatwerk_veranda';
  title: string;
  quantity: number;
  /** Base price = shopifyVariantPrice + maatwerkSurcharge */
  basePrice: number;
  /** Base price from Shopify variant (before surcharge) */
  shopifyVariantPrice?: number;
  /** Maatwerk surcharge (€750) */
  maatwerkSurcharge?: number;
  optionsTotal: number;
  totalPrice: number;
  /** User's requested custom dimensions */
  size: MaatwerkSize;
  /** Resolved bucketed width used for Shopify variant mapping */
  bucketWidthCm?: number;
  /** Resolved bucketed depth used for Shopify variant mapping */
  bucketDepthCm?: number;
  /** Anchor size used for pricing (may differ from size) */
  anchorSizeKey: string;
  /** Resolved Shopify variant ID (GID) for bucketed size */
  shopifyVariantId?: string;
  selections: MaatwerkSelection[];
  renderPreview?: string;
  priceBreakdown: MaatwerkPriceBreakdown;
}

/**
 * Check if an item is a maatwerk veranda
 */
export function isMaatwerkVeranda(item: any): item is { maatwerkPayload: MaatwerkCartPayload } {
  return item?.maatwerkPayload?.type === 'maatwerk_veranda';
}
