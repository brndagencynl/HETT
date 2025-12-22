/**
 * VERANDA PRICING - Single Source of Truth
 * =========================================
 * 
 * This file contains ALL pricing data for veranda products.
 * No UI code. No magic numbers elsewhere. Just clean, typed pricing.
 * 
 * PRODUCT STRUCTURE:
 * - Each size (e.g., 500x250) is a SEPARATE PRODUCT, not a variation
 * - Size is determined by product context, NOT by the configurator
 * - The configurator only configures OPTIONS
 * 
 * FUTURE-PROOFING:
 * - Base prices can later come from WooCommerce
 * - Option prices remain calculated client-side
 * - Structure supports both scenarios
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** 
 * Product size identifier format: "{width}x{depth}"
 * Width: 500, 600, 700 (cm)
 * Depth: 250, 300, 350, 400 (cm)
 */
export type VerandaProductSize = 
  | '500x250' | '500x300' | '500x350' | '500x400'
  | '600x250' | '600x300' | '600x350' | '600x400'
  | '700x250' | '700x300' | '700x350' | '700x400';

/** Width extracted from product size */
export type VerandaWidth = 500 | 600 | 700;

/** Depth extracted from product size */  
export type VerandaDepth = 250 | 300 | 350 | 400;

/** Option pricing can be fixed OR size-dependent */
export type OptionPricing = 
  | { type: 'fixed'; price: number }
  | { type: 'byWidth'; prices: Record<VerandaWidth, number> }
  | { type: 'bySize'; prices: Record<VerandaProductSize, number> };

/** Structure for a single option choice */
export interface OptionChoice {
  id: string;
  label: string;
  labelNL: string;
  pricing: OptionPricing;
  description?: string;
}

/** Structure for an option group (step) */
export interface OptionGroup {
  id: string;
  step: number;
  label: string;
  labelNL: string;
  required: boolean;
  choices: OptionChoice[];
}

// =============================================================================
// BASE PRICES (Per Product Size)
// =============================================================================

/**
 * Base prices for all veranda products.
 * Each size is a separate product with its own base price.
 * 
 * When integrating with WooCommerce:
 * - These prices can be overridden by WooCommerce product prices
 * - Use getBasePrice(size, wooCommercePrice?) helper
 */
export const BASE_PRICES: Record<VerandaProductSize, number> = {
  // Width 500cm
  '500x250': 1350,
  '500x300': 1475,
  '500x350': 1600,
  '500x400': 1730,
  
  // Width 600cm
  '600x250': 1500,
  '600x300': 1650,
  '600x350': 1800,
  '600x400': 1950,
  
  // Width 700cm
  '700x250': 1650,
  '700x300': 1825,
  '700x350': 2000,
  '700x400': 2175,
} as const;

// =============================================================================
// OPTION PRICES
// =============================================================================

/**
 * STEP 1: Roof Type (Daktype)
 * Fixed prices - same for all sizes
 */
export const ROOF_TYPE_OPTIONS: OptionChoice[] = [
  {
    id: 'poly_helder',
    label: 'Polycarbonate clear',
    labelNL: 'Polycarbonaat helder',
    description: 'Helder polycarbonaat. Maximale lichtinval.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'poly_opaal',
    label: 'Polycarbonate opal',
    labelNL: 'Polycarbonaat opaal',
    description: 'Melkwit polycarbonaat. Laat licht door maar weert directe hitte.',
    pricing: { type: 'fixed', price: 125 },
  },
] as const;

/**
 * STEP 2: Front Side (Voorzijde)
 * Prices depend on WIDTH only (not depth)
 */
export const FRONT_SIDE_OPTIONS: OptionChoice[] = [
  {
    id: 'geen',
    label: 'No front',
    labelNL: 'Geen (Open)',
    description: 'De voorzijde blijft volledig open.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'glas_schuifwand',
    label: 'Glass sliding wall',
    labelNL: 'Glazen schuifwanden',
    description: 'Glazen panelen over de gehele breedte.',
    pricing: {
      type: 'byWidth',
      prices: {
        500: 999,
        600: 1150,
        700: 1450,
      },
    },
  },
] as const;

/**
 * STEP 3: Side Walls (Zijwanden)
 * Both LEFT and RIGHT use the same options and pricing
 * Prices depend on FULL SIZE (width × depth)
 */
export const SIDE_WALL_OPTIONS: OptionChoice[] = [
  {
    id: 'geen',
    label: 'None',
    labelNL: 'Geen (Open)',
    description: 'De zijkant blijft volledig open.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'poly_spie',
    label: 'Polycarbonate spie',
    labelNL: 'Polycarbonaat spie (driehoek)',
    description: 'Dicht de driehoek boven een schutting met polycarbonaat.',
    pricing: {
      type: 'bySize',
      prices: {
        '500x250': 175, '500x300': 195, '500x350': 215, '500x400': 235,
        '600x250': 195, '600x300': 215, '600x350': 240, '600x400': 265,
        '700x250': 215, '700x300': 240, '700x350': 270, '700x400': 300,
      },
    },
  },
  {
    id: 'sandwich_polyspie',
    label: 'Sandwich panel + poly spie',
    labelNL: 'Sandwichpaneel + poly spie',
    description: 'Geïsoleerde wand met polycarbonaat driehoek.',
    pricing: {
      type: 'bySize',
      prices: {
        '500x250': 450, '500x300': 495, '500x350': 545, '500x400': 595,
        '600x250': 495, '600x300': 550, '600x350': 610, '600x400': 670,
        '700x250': 545, '700x300': 610, '700x350': 680, '700x400': 750,
      },
    },
  },
  {
    id: 'sandwich_vol',
    label: 'Full sandwich panel',
    labelNL: 'Volledig sandwichpaneel',
    description: 'Volledig geïsoleerde wand van sandwichpanelen.',
    pricing: {
      type: 'bySize',
      prices: {
        '500x250': 595, '500x300': 665, '500x350': 735, '500x400': 810,
        '600x250': 665, '600x300': 745, '600x350': 830, '600x400': 920,
        '700x250': 735, '700x300': 830, '700x350': 930, '700x400': 1035,
      },
    },
  },
] as const;

/**
 * STEP 4: Gutter Option (Goot)
 * All options have €0 price difference - visual/preference choice only
 */
export const GUTTER_OPTIONS: OptionChoice[] = [
  {
    id: 'classic',
    label: 'Classic',
    labelNL: 'Classic (Rond)',
    description: 'Traditionele ronde goot.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'cube',
    label: 'Cube',
    labelNL: 'Cube (Vierkant)',
    description: 'Strakke moderne vierkante goot.',
    pricing: { type: 'fixed', price: 0 },
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    labelNL: 'Deluxe (Sierlijst)',
    description: 'Luxe afgewerkte goot met decoratieve sierlijst.',
    pricing: { type: 'fixed', price: 0 },
  },
] as const;

/**
 * STEP 5: Extras (Verlichting)
 * Fixed price
 */
export const EXTRAS_OPTIONS: OptionChoice[] = [
  {
    id: 'led_verlichting',
    label: 'LED lighting',
    labelNL: 'LED Verlichting',
    description: 'Complete LED verlichting set (6 spots)',
    pricing: { type: 'fixed', price: 199 },
  },
] as const;

// =============================================================================
// AGGREGATED OPTIONS STRUCTURE
// =============================================================================

/**
 * Complete configuration options grouped by step
 * This is the main export for UI components
 */
export const VERANDA_OPTION_GROUPS: OptionGroup[] = [
  {
    id: 'daktype',
    step: 1,
    label: 'Roof type',
    labelNL: 'Daktype',
    required: true,
    choices: [...ROOF_TYPE_OPTIONS],
  },
  {
    id: 'voorzijde',
    step: 2,
    label: 'Front side',
    labelNL: 'Voorzijde',
    required: false,
    choices: [...FRONT_SIDE_OPTIONS],
  },
  {
    id: 'zijwand_links',
    step: 3,
    label: 'Side wall left',
    labelNL: 'Zijwand links',
    required: false,
    choices: [...SIDE_WALL_OPTIONS],
  },
  {
    id: 'zijwand_rechts',
    step: 3,
    label: 'Side wall right',
    labelNL: 'Zijwand rechts',
    required: false,
    choices: [...SIDE_WALL_OPTIONS],
  },
  {
    id: 'goot',
    step: 4,
    label: 'Gutter',
    labelNL: 'Goot',
    required: true,
    choices: [...GUTTER_OPTIONS],
  },
  {
    id: 'verlichting',
    step: 5,
    label: 'Extras',
    labelNL: "Extra's",
    required: false,
    choices: [...EXTRAS_OPTIONS],
  },
] as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract width from product size
 * @example getWidthFromSize('500x300') → 500
 */
export function getWidthFromSize(size: VerandaProductSize): VerandaWidth {
  const width = parseInt(size.split('x')[0], 10) as VerandaWidth;
  return width;
}

/**
 * Extract depth from product size
 * @example getDepthFromSize('500x300') → 300
 */
export function getDepthFromSize(size: VerandaProductSize): VerandaDepth {
  const depth = parseInt(size.split('x')[1], 10) as VerandaDepth;
  return depth;
}

/**
 * Get base price for a product size
 * Supports optional WooCommerce override for future integration
 * 
 * @param size - Product size identifier
 * @param wooCommercePrice - Optional price from WooCommerce (overrides local)
 */
export function getBasePrice(
  size: VerandaProductSize, 
  wooCommercePrice?: number
): number {
  if (wooCommercePrice !== undefined && wooCommercePrice > 0) {
    return wooCommercePrice;
  }
  return BASE_PRICES[size];
}

/**
 * Calculate option price based on pricing type
 * Automatically handles fixed, byWidth, and bySize pricing
 * 
 * @param pricing - The pricing configuration for the option
 * @param size - The selected product size
 */
export function getOptionPrice(
  pricing: OptionPricing,
  size: VerandaProductSize
): number {
  switch (pricing.type) {
    case 'fixed':
      return pricing.price;
    
    case 'byWidth':
      const width = getWidthFromSize(size);
      return pricing.prices[width] ?? 0;
    
    case 'bySize':
      return pricing.prices[size] ?? 0;
    
    default:
      return 0;
  }
}

/**
 * Find option choice by ID within an option group
 */
export function findOptionChoice(
  groupId: string,
  choiceId: string
): OptionChoice | undefined {
  const group = VERANDA_OPTION_GROUPS.find(g => g.id === groupId);
  if (!group) return undefined;
  return group.choices.find(c => c.id === choiceId);
}

/**
 * Get price for a specific option selection
 * Convenience function combining findOptionChoice and getOptionPrice
 */
export function getSelectionPrice(
  groupId: string,
  choiceId: string | boolean | undefined,
  size: VerandaProductSize
): number {
  // Handle boolean (for toggles like verlichting)
  if (typeof choiceId === 'boolean') {
    if (!choiceId) return 0;
    // For boolean options, find the first (and typically only) choice
    const group = VERANDA_OPTION_GROUPS.find(g => g.id === groupId);
    if (!group || group.choices.length === 0) return 0;
    return getOptionPrice(group.choices[0].pricing, size);
  }
  
  // Handle undefined or 'geen'
  if (!choiceId || choiceId === 'geen') return 0;
  
  const choice = findOptionChoice(groupId, choiceId);
  if (!choice) return 0;
  
  return getOptionPrice(choice.pricing, size);
}

/**
 * Get all valid product sizes
 */
export function getAllProductSizes(): VerandaProductSize[] {
  return Object.keys(BASE_PRICES) as VerandaProductSize[];
}

/**
 * Validate if a string is a valid product size
 */
export function isValidProductSize(size: string): size is VerandaProductSize {
  return size in BASE_PRICES;
}

// =============================================================================
// CONFIGURATION TYPE (for runtime validation)
// =============================================================================

/**
 * Runtime configuration object
 * Used by the configurator to track selections
 */
export interface VerandaPricingConfig {
  productSize: VerandaProductSize;
  daktype?: string;
  voorzijde?: string;
  zijwand_links?: string;
  zijwand_rechts?: string;
  goot?: string;
  verlichting?: boolean;
}

/**
 * Price breakdown item for display
 */
export interface PriceLineItem {
  groupId: string;
  groupLabel: string;
  choiceId: string;
  choiceLabel: string;
  price: number;
}

/**
 * Complete price calculation result
 */
export interface PriceCalculationResult {
  basePrice: number;
  items: PriceLineItem[];
  optionsTotal: number;
  grandTotal: number;
}

/**
 * Calculate complete price for a configuration
 * This is the main pricing calculation function
 */
export function calculateVerandaPrice(
  config: VerandaPricingConfig,
  wooCommerceBasePrice?: number
): PriceCalculationResult {
  const { productSize } = config;
  const basePrice = getBasePrice(productSize, wooCommerceBasePrice);
  const items: PriceLineItem[] = [];

  // Process each option group
  const optionMappings: { groupId: string; value: string | boolean | undefined }[] = [
    { groupId: 'daktype', value: config.daktype },
    { groupId: 'voorzijde', value: config.voorzijde },
    { groupId: 'zijwand_links', value: config.zijwand_links },
    { groupId: 'zijwand_rechts', value: config.zijwand_rechts },
    { groupId: 'goot', value: config.goot },
    { groupId: 'verlichting', value: config.verlichting },
  ];

  for (const { groupId, value } of optionMappings) {
    if (value === undefined || value === 'geen' || value === false) continue;

    const group = VERANDA_OPTION_GROUPS.find(g => g.id === groupId);
    if (!group) continue;

    let choice: OptionChoice | undefined;
    
    if (typeof value === 'boolean' && value) {
      // For boolean toggles, use first choice
      choice = group.choices[0];
    } else if (typeof value === 'string') {
      choice = group.choices.find(c => c.id === value);
    }

    if (choice) {
      const price = getOptionPrice(choice.pricing, productSize);
      if (price > 0) {
        items.push({
          groupId,
          groupLabel: group.labelNL,
          choiceId: choice.id,
          choiceLabel: choice.labelNL,
          price,
        });
      }
    }
  }

  const optionsTotal = items.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = basePrice + optionsTotal;

  return {
    basePrice,
    items,
    optionsTotal,
    grandTotal,
  };
}

// =============================================================================
// LEGACY COMPATIBILITY EXPORTS
// =============================================================================

/**
 * For backwards compatibility with existing code
 * Maps to the old calcVerandaPrice signature
 */
export function calcVerandaPriceCompat(
  basePrice: number,
  config: {
    daktype?: string;
    voorzijde?: string;
    zijwand_links?: string;
    zijwand_rechts?: string;
    goot?: string;
    verlichting?: boolean;
  },
  productSize: VerandaProductSize = '600x300' // Default fallback
): { basePrice: number; items: { label: string; amount: number }[]; extras: number; total: number } {
  const pricingConfig: VerandaPricingConfig = {
    productSize,
    ...config,
  };

  const result = calculateVerandaPrice(pricingConfig, basePrice);

  return {
    basePrice: result.basePrice,
    items: result.items.map(item => ({
      label: item.choiceLabel,
      amount: item.price,
    })),
    extras: result.optionsTotal,
    total: result.grandTotal,
  };
}
