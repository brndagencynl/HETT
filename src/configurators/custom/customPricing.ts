/**
 * Maatwerk Veranda Configurator - Pricing
 * ========================================
 * 
 * Isolated pricing for the custom/maatwerk veranda configurator.
 * 
 * PRICING STRATEGY (NEW):
 * - User enters custom dimensions (any cm value within range)
 * - We map those dimensions to the nearest anchor product (ceiling)
 * - Base price = Anchor product price + €750 custom fee
 * - Option prices: can be fixed, byWidthRange, byDepthRange, or byArea
 * 
 * Supports continuous slider values (1cm increments).
 */

import type {
  MaatwerkSize,
  PartialMaatwerkConfig,
  MaatwerkSelection,
  MaatwerkPriceBreakdown,
} from './customTypes';

import {
  mapToAnchorWidth,
  mapToAnchorDepth,
  mapToAnchorSize,
  getAnchorSizeObject,
  MAATWERK_CUSTOM_FEE,
} from '../../catalog/matrixCatalog';

import { addCents, formatEUR, fromCents, mulCents, toCents } from '../../utils/money';

import {
  getGlassWallPrice,
  type GlassVariant,
} from '../../config/pricing/glassSlidingWalls';

// =============================================================================
// PRICING TYPES
// =============================================================================

/** Option pricing can be fixed, by width range, by depth range, by area, or glass wall lookup */
export type MaatwerkOptionPricing =
  | { type: 'fixed'; price: number }
  | { type: 'byWidth'; basePrice: number; pricePerCm: number }  // Linear pricing based on width
  | { type: 'byDepth'; basePrice: number; pricePerCm: number }  // Linear pricing based on depth
  | { type: 'byArea'; pricePerM2: number }
  | { type: 'byGlassWall'; variant: GlassVariant };  // Uses glassSlidingWalls.ts price table

export interface MaatwerkOptionChoice {
  id: string;
  label: string;
  description?: string;
  pricing: MaatwerkOptionPricing;
}

export interface MaatwerkOptionGroup {
  id: string;
  label: string;
  required: boolean;
  choices: MaatwerkOptionChoice[];
}

// =============================================================================
// BASE PRICE MATRIX (Maatwerk Configurator)
// =============================================================================

/**
 * Maatwerk base price matrix by width × depth (in cm).
 * Format: "WIDTHxDEPTH" => price in EUR
 */
const MAATWERK_PRICE_MATRIX: Record<string, number> = {
  // 306 width
  '306x250': 699,
  '306x300': 759,
  '306x350': 829,
  '306x400': 899,
  '306x450': 969,
  '306x500': 1039,
  // 406 width
  '406x250': 1119,
  '406x300': 1199,
  '406x350': 1299,
  '406x400': 1399,
  '406x450': 1499,
  '406x500': 1599,
  // 506 width
  '506x250': 1350,
  '506x300': 1475,
  '506x350': 1600,
  '506x400': 1730,
  '506x450': 1860,
  '506x500': 1990,
  // 606 width
  '606x250': 1550,
  '606x300': 1699,
  '606x350': 1850,
  '606x400': 1999,
  '606x450': 2149,
  '606x500': 2299,
  // 706 width
  '706x250': 1749,
  '706x300': 1949,
  '706x350': 2099,
  '706x400': 2499,
  '706x450': 2499,
  '706x500': 1999,
  // 806 width
  '806x250': 1999,
  '806x300': 2119,
  '806x350': 2399,
  '806x400': 2599,
  '806x450': 2749,
  '806x500': 2999,
  // 906 width
  '906x250': 2245,
  '906x300': 2499,
  '906x350': 2699,
  '906x400': 2899,
  '906x450': 3099,
  '906x500': 3299,
  // 1006 width
  '1006x250': 2449,
  '1006x300': 2699,
  '1006x350': 2949,
  '1006x400': 3199,
  '1006x450': 3449,
  '1006x500': 3699,
  // 1106 width
  '1106x250': 2699,
  '1106x300': 2949,
  '1106x350': 3249,
  '1106x400': 3499,
  '1106x450': 3799,
  '1106x500': 4099,
  // 1206 width
  '1206x250': 2799,
  '1206x300': 3049,
  '1206x350': 3449,
  '1206x400': 3799,
  '1206x450': 4099,
  '1206x500': 4399,
};

/**
 * Get maatwerk base price from the price matrix.
 * 
 * @param anchorSizeKey - Size key in format "WIDTHxDEPTH" (e.g., "706x350")
 * @returns Price in EUR, or null if not found
 */
function getMaatwerkMatrixPrice(anchorSizeKey: string): number | null {
  const price = MAATWERK_PRICE_MATRIX[anchorSizeKey];
  if (price !== undefined) {
    console.log(`[MaatwerkPrice] Found matrix price for ${anchorSizeKey}: €${price}`);
    return price;
  }
  console.warn(`[MaatwerkPrice] No matrix price for ${anchorSizeKey}`);
  return null;
}

/**
 * Fallback pricing parameters (used if matrix price not found)
 */
const FALLBACK_PRICING = {
  minimumPrice: 1100,
  baseFlat: 400,
  widthRate: 1.5,
  depthRate: 2.0,
  areaRate: 0.0003,
};

/**
 * Calculate fallback price (if matrix price not found)
 */
function getFallbackPrice(width: number, depth: number): number {
  const area = width * depth;

  // Compute in cents (integers) to avoid float drift and whole-euro rounding.
  const baseCents = toCents(FALLBACK_PRICING.baseFlat);
  const widthCents = Math.round(width * FALLBACK_PRICING.widthRate * 100);
  const depthCents = Math.round(depth * FALLBACK_PRICING.depthRate * 100);
  const areaCents = Math.round(area * FALLBACK_PRICING.areaRate * 100);
  const calculatedCents = baseCents + widthCents + depthCents + areaCents;
  const minimumCents = toCents(FALLBACK_PRICING.minimumPrice);

  return fromCents(Math.max(minimumCents, calculatedCents));
}

/**
 * Get the anchor product for a given custom size
 * Returns the product info including price from the matrix
 */
export function getAnchorProductForSize(size: MaatwerkSize): {
  anchorWidth: number;
  anchorDepth: number;
  anchorSizeKey: string;
  anchorPrice: number;
} {
  const anchorWidth = mapToAnchorWidth(size.width);
  const anchorDepth = mapToAnchorDepth(size.depth);
  const anchorSizeKey = mapToAnchorSize(size.width, size.depth);
  
  // Try to get price from matrix, fallback to formula if not found
  const matrixPrice = getMaatwerkMatrixPrice(anchorSizeKey);
  const anchorPrice = matrixPrice ?? getFallbackPrice(anchorWidth, anchorDepth);
  
  return { anchorWidth, anchorDepth, anchorSizeKey, anchorPrice };
}

/**
 * Get base price for a custom maatwerk configuration
 * 
 * PRICING: Anchor product price + €750 custom fee
 * 
 * @param size - User's requested custom dimensions
 * @returns Base price including custom fee
 */
export function getMaatwerkBasePrice(size: MaatwerkSize): number {
  const { anchorPrice } = getAnchorProductForSize(size);
  
  // Add custom fee to anchor price
  return fromCents(addCents(toCents(anchorPrice), toCents(MAATWERK_CUSTOM_FEE)));
}

/**
 * Get price breakdown showing anchor + custom fee separately
 */
export function getMaatwerkBasePriceBreakdown(size: MaatwerkSize): {
  anchorPrice: number;
  customFee: number;
  total: number;
  anchorSizeKey: string;
} {
  const { anchorPrice, anchorSizeKey } = getAnchorProductForSize(size);
  
  return {
    anchorPrice,
    customFee: MAATWERK_CUSTOM_FEE,
    total: fromCents(addCents(toCents(anchorPrice), toCents(MAATWERK_CUSTOM_FEE))),
    anchorSizeKey,
  };
}

// =============================================================================
// OPTION PRICES
// =============================================================================

/**
 * Roof type options
 */
export const MAATWERK_ROOF_OPTIONS: MaatwerkOptionChoice[] = [
  {
    id: 'poly_helder',
    label: 'Polycarbonaat helder',
    description: 'Helder polycarbonaat. Maximale lichtinval.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'poly_opaal',
    label: 'Polycarbonaat opaal',
    description: 'Melkwit polycarbonaat. Laat licht door maar weert directe hitte.',
    pricing: { type: 'fixed', price: 0 },
  },
];

/**
 * Gutter options
 */
export const MAATWERK_GUTTER_OPTIONS: MaatwerkOptionChoice[] = [
  {
    id: 'classic',
    label: 'Classic (Rond)',
    description: 'Traditionele ronde goot.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'cube',
    label: 'Cube (Vierkant)',
    description: 'Strakke moderne vierkante goot.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'deluxe',
    label: 'Deluxe (Sierlijst)',
    description: 'Luxe afgewerkte goot met decoratieve sierlijst.',
    pricing: { type: 'fixed', price: 0 },
  },
];

/**
 * Side wall options (used for both left and right)
 * Now uses linear pricing based on depth
 */
export const MAATWERK_SIDEWALL_OPTIONS: MaatwerkOptionChoice[] = [
  {
    id: 'geen',
    label: 'Geen (Open)',
    description: 'De zijkant blijft volledig open.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'poly_spie',
    label: 'Polycarbonaat spie (driehoek)',
    description: 'Dicht de driehoek boven een schutting met polycarbonaat.',
    pricing: {
      type: 'byDepth',
      basePrice: 75,    // Base at minimum depth
      pricePerCm: 0.42, // ~€0.42 per cm depth
    },
  },
  {
    id: 'sandwich_polyspie',
    label: 'Sandwichpaneel + poly spie',
    description: 'Geïsoleerde wand met polycarbonaat driehoek.',
    pricing: {
      type: 'byDepth',
      basePrice: 195,   // Base at minimum depth
      pricePerCm: 1.03, // ~€1.03 per cm depth
    },
  },
  {
    id: 'sandwich_vol',
    label: 'Volledig sandwichpaneel',
    description: 'Volledig geïsoleerde wand van sandwichpanelen.',
    pricing: {
      type: 'byDepth',
      basePrice: 200,   // Base at minimum depth  
      pricePerCm: 1.58, // ~€1.58 per cm depth
    },
  },
];

/**
 * Front side options
 * Uses the shared glassSlidingWalls.ts price table for glass sliding walls.
 * Width comes from the maatwerk slider, snapped to nearest supported key.
 */
export const MAATWERK_FRONT_OPTIONS: MaatwerkOptionChoice[] = [
  {
    id: 'geen',
    label: 'Geen (Open)',
    description: 'De voorzijde blijft volledig open.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'glas_schuifwand_helder',
    label: 'Glazen schuifwand helder',
    description: 'Heldere glazen panelen over de gehele breedte.',
    pricing: { type: 'byGlassWall', variant: 'helder' },
  },
  {
    id: 'glas_schuifwand_getint',
    label: 'Glazen schuifwand getint',
    description: 'Getinte glazen panelen over de gehele breedte voor extra privacy.',
    pricing: { type: 'byGlassWall', variant: 'getint' },
  },
];

/**
 * Extras (verlichting)
 */
export const MAATWERK_EXTRAS_OPTIONS: MaatwerkOptionChoice[] = [
  {
    id: 'led_verlichting',
    label: 'LED Verlichting',
    description: 'LED spots (wordt apart berekend op basis van breedte)',
    pricing: { type: 'fixed', price: 0 },
  },
];

/**
 * All option groups for the maatwerk configurator
 */
export const MAATWERK_OPTION_GROUPS: MaatwerkOptionGroup[] = [
  {
    id: 'daktype',
    label: 'Daktype',
    required: true,
    choices: MAATWERK_ROOF_OPTIONS,
  },
  {
    id: 'goot',
    label: 'Goot',
    required: true,
    choices: MAATWERK_GUTTER_OPTIONS,
  },
  {
    id: 'zijwand_links',
    label: 'Zijwand links',
    required: false,
    choices: MAATWERK_SIDEWALL_OPTIONS,
  },
  {
    id: 'zijwand_rechts',
    label: 'Zijwand rechts',
    required: false,
    choices: MAATWERK_SIDEWALL_OPTIONS,
  },
  {
    id: 'voorzijde',
    label: 'Voorzijde',
    required: false,
    choices: MAATWERK_FRONT_OPTIONS,
  },
  {
    id: 'verlichting',
    label: "Extra's",
    required: false,
    choices: MAATWERK_EXTRAS_OPTIONS,
  },
];

// =============================================================================
// PRICING HELPERS
// =============================================================================

/**
 * Calculate option price based on pricing type and size
 */
export function getMaatwerkOptionPrice(
  pricing: MaatwerkOptionPricing,
  size: MaatwerkSize
): number {
  switch (pricing.type) {
    case 'fixed':
      return pricing.price;
    
    case 'byWidth':
      // Linear pricing: basePrice + (width * pricePerCm)
      return fromCents(addCents(toCents(pricing.basePrice), mulCents(toCents(pricing.pricePerCm), size.width)));
    
    case 'byDepth':
      // Linear pricing: basePrice + (depth * pricePerCm)
      return fromCents(addCents(toCents(pricing.basePrice), mulCents(toCents(pricing.pricePerCm), size.depth)));
    
    case 'byArea':
      // Calculate area in m² and multiply by rate
      const areaM2 = (size.width / 100) * (size.depth / 100);
      return fromCents(Math.round(areaM2 * pricing.pricePerM2 * 100));
    
    case 'byGlassWall':
      // Use the shared glass wall price table
      // Width from maatwerk slider is passed directly (already in cm)
      return getGlassWallPrice(size.width, pricing.variant);
    
    default:
      return 0;
  }
}

/**
 * Find option choice by group and choice ID
 */
export function findMaatwerkChoice(
  groupId: string,
  choiceId: string
): MaatwerkOptionChoice | undefined {
  const group = MAATWERK_OPTION_GROUPS.find(g => g.id === groupId);
  if (!group) return undefined;
  return group.choices.find(c => c.id === choiceId);
}

/**
 * Get the label for an option value
 */
export function getMaatwerkOptionLabel(groupId: string, value: any): string {
  if (value === undefined || value === null) return 'Geen selectie';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nee';
  
  const choice = findMaatwerkChoice(groupId, String(value));
  return choice?.label || String(value);
}

// =============================================================================
// PRICE CALCULATION
// =============================================================================

/**
 * Calculate complete price breakdown for a maatwerk configuration
 * 
 * Includes:
 * - Anchor product price + custom fee as base
 * - Option prices based on user's custom dimensions
 * - Full breakdown with anchor reference
 */
export function calculateMaatwerkPrice(config: PartialMaatwerkConfig): MaatwerkPriceBreakdown {
  const size = config.size || { width: 600, depth: 300 };
  
  // Get anchor-based pricing
  const anchorInfo = getAnchorProductForSize(size);
  const basePriceCents = addCents(toCents(anchorInfo.anchorPrice), toCents(MAATWERK_CUSTOM_FEE));
  const basePrice = fromCents(basePriceCents);
  
  const selections: MaatwerkSelection[] = [];

  // Process each option group
  const optionMappings: Array<{ groupId: string; value: any }> = [
    { groupId: 'daktype', value: config.daktype },
    { groupId: 'goot', value: config.goot },
    { groupId: 'zijwand_links', value: config.zijwand_links },
    { groupId: 'zijwand_rechts', value: config.zijwand_rechts },
    { groupId: 'voorzijde', value: config.voorzijde },
    { groupId: 'verlichting', value: config.verlichting },
  ];

  for (const { groupId, value } of optionMappings) {
    // Skip undefined, 'geen', or false values
    if (value === undefined || value === 'geen' || value === false) continue;

    const group = MAATWERK_OPTION_GROUPS.find(g => g.id === groupId);
    if (!group) continue;

    let choice: MaatwerkOptionChoice | undefined;
    
    if (typeof value === 'boolean' && value === true) {
      // For boolean toggles (verlichting), use first choice
      choice = group.choices[0];
    } else if (typeof value === 'string') {
      choice = group.choices.find(c => c.id === value);
    }

    if (choice) {
      const price = getMaatwerkOptionPrice(choice.pricing, size);
      // Include all selections in breakdown, even if price is 0
      selections.push({
        groupId,
        groupLabel: group.label,
        choiceId: choice.id,
        choiceLabel: choice.label,
        price,
      });
    }
  }

  const optionsTotalCents = selections.reduce((sum, s) => sum + toCents(s.price), 0);
  const optionsTotal = fromCents(optionsTotalCents);
  const grandTotal = fromCents(addCents(basePriceCents, optionsTotalCents));

  return {
    basePrice,
    selections,
    optionsTotal,
    grandTotal,
    anchor: {
      anchorSizeKey: anchorInfo.anchorSizeKey,
      anchorPrice: anchorInfo.anchorPrice,
      customFee: MAATWERK_CUSTOM_FEE,
    },
  };
}

/**
 * Format price for display
 */
export function formatMaatwerkPrice(price: number): string {
  // Prices in this module are currently expressed in EUR (not cents).
  // Always format with 2 decimals in nl-NL style.
  return formatEUR(toCents(price), 'cents');
}
