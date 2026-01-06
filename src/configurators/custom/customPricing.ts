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

// =============================================================================
// PRICING TYPES
// =============================================================================

/** Option pricing can be fixed, by width range, by depth range, or by area */
export type MaatwerkOptionPricing =
  | { type: 'fixed'; price: number }
  | { type: 'byWidth'; basePrice: number; pricePerCm: number }  // Linear pricing based on width
  | { type: 'byDepth'; basePrice: number; pricePerCm: number }  // Linear pricing based on depth
  | { type: 'byArea'; pricePerM2: number };

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
// BASE PRICE CALCULATION (Using Anchor Products)
// =============================================================================

/**
 * Fallback pricing parameters (used if anchor product not found)
 * This should rarely happen if the matrix catalog is correctly configured
 */
const FALLBACK_PRICING = {
  minimumPrice: 1100,
  baseFlat: 400,
  widthRate: 1.5,
  depthRate: 2.0,
  areaRate: 0.0003,
};

/**
 * Calculate fallback price (if anchor product not found)
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
 * Returns the product info including price
 * 
 * Note: Since we removed local PRODUCTS mock data, we now use
 * the fallback pricing formula for anchor prices. In the future,
 * this could be enhanced to fetch prices from Shopify.
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
  
  // Use fallback pricing formula (no longer dependent on mock PRODUCTS)
  const anchorPrice = getFallbackPrice(anchorWidth, anchorDepth);
  
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
 * Now uses linear pricing based on width
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
    pricing: {
      type: 'byWidth',
      basePrice: 300,   // Base at minimum width
      pricePerCm: 1.50, // ~€1.50 per cm width
    },
  },
  {
    id: 'glas_schuifwand_getint',
    label: 'Glazen schuifwand getint',
    description: 'Getinte glazen panelen over de gehele breedte voor extra privacy.',
    pricing: {
      type: 'byWidth',
      basePrice: 300,   // Base at minimum width
      pricePerCm: 1.50, // ~€1.50 per cm width (adjust as needed)
    },
  },
];

/**
 * Extras (verlichting)
 */
export const MAATWERK_EXTRAS_OPTIONS: MaatwerkOptionChoice[] = [
  {
    id: 'led_verlichting',
    label: 'LED Verlichting',
    description: 'Complete LED verlichting set (6 spots)',
    pricing: { type: 'fixed', price: 199 },
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
