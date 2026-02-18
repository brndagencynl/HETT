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

import {
  getGlassWallPrice,
  type GlassVariant,
} from '../../config/pricing/glassSlidingWalls';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Color ID type for veranda profile colors */
export type VerandaColorId = 'ral7016' | 'ral9005' | 'ral9001';

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

/**
 * Sandwich wall (volledig) price table by depth in cm.
 * These are prices per single side wall.
 */
export const SANDWICH_WALL_PRICE_BY_DEPTH: Record<number, number> = {
  250: 337.50,
  300: 405.00,
  350: 472.50,
  400: 540.00,
  450: 607.50,
  500: 675.00,
};

/**
 * Sandwich + poly spie price table by depth in cm.
 * These are prices per single side wall.
 */
export const SANDWICH_POLYSPIE_PRICE_BY_DEPTH: Record<number, number> = {
  250: 325.00,
  300: 390.00,
  350: 455.00,
  400: 520.00,
  450: 585.00,
  500: 650.00,
};

/**
 * Poly spie (driehoek) price table by depth in cm.
 * These are prices per single side wall.
 */
export const POLY_SPIE_PRICE_BY_DEPTH: Record<number, number> = {
  250: 100.00,
  300: 120.00,
  350: 140.00,
  400: 160.00,
  450: 180.00,
  500: 200.00,
};

/**
 * Glass sliding wall (zijwand) price table by depth in cm.
 * Prices per single side wall.
 */
export const GLASS_SIDE_WALL_PRICE_BY_DEPTH: Record<number, number> = {
  250: 599.00,
  300: 749.00,
  350: 899.00,
  400: 999.00,
  450: 1149.00,
  500: 1299.00,
};

/** Option pricing can be fixed OR size-dependent */
export type OptionPricing = 
  | { type: 'fixed'; price: number }
  | { type: 'byWidth'; prices: Record<VerandaWidth, number> }
  | { type: 'bySize'; prices: Record<VerandaProductSize, number> }
  | { type: 'byGlassWall'; variant: GlassVariant } // Uses glassSlidingWalls.ts price table
  | { type: 'bySandwichDepth' } // Uses SANDWICH_WALL_PRICE_BY_DEPTH table
  | { type: 'bySandwichPolyspieDepth' } // Uses SANDWICH_POLYSPIE_PRICE_BY_DEPTH table
  | { type: 'byPolySpieDepth' } // Uses POLY_SPIE_PRICE_BY_DEPTH table
  | { type: 'byGlassSideWall' }; // Glass sliding wall for side walls — uses depth-based pricing

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
 * COLOR OPTIONS (Kleur)
 * Step 1 - No price difference, purely visual/preference
 */
export interface ColorOption {
  id: VerandaColorId;
  label: string;
  labelNL: string;
  hex: string;
  description?: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'ral7016',
    label: 'Anthracite (RAL 7016)',
    labelNL: 'Antraciet (RAL 7016)',
    hex: '#293133',
    description: 'Populaire donkergrijze kleur, past bij moderne architectuur.',
  },
  {
    id: 'ral9005',
    label: 'Black (RAL 9005)',
    labelNL: 'Zwart (RAL 9005)',
    hex: '#0E0E10',
    description: 'Strakke zwarte afwerking voor een premium uitstraling.',
  },
  {
    id: 'ral9001',
    label: 'Cream white (RAL 9001)',
    labelNL: 'Crème (RAL 9001)',
    hex: '#FDF4E3',
    description: 'Warme crèmewitte kleur, ideaal bij lichte gevels.',
  },
];

/**
 * STEP 2: Roof Type (Daktype)
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
    pricing: { type: 'fixed', price: 0 },
  },
] as const;

/**
 * STEP 2: Front Side (Voorzijde)
 * Glass sliding wall prices use the shared glassSlidingWalls.ts price table
 * which maps width (306-1206 cm) to prices for helder/getint variants.
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
    id: 'glas_schuifwand_helder',
    label: 'Glass sliding wall clear',
    labelNL: 'Glazen schuifwand helder',
    description: 'Heldere glazen panelen over de gehele breedte.',
    pricing: { type: 'byGlassWall', variant: 'helder' },
  },
  {
    id: 'glas_schuifwand_getint',
    label: 'Glass sliding wall tinted',
    labelNL: 'Glazen schuifwand getint',
    description: 'Getinte glazen panelen over de gehele breedte voor extra privacy.',
    pricing: { type: 'byGlassWall', variant: 'getint' },
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
    pricing: { type: 'byPolySpieDepth' },
  },
  {
    id: 'sandwich_polyspie',
    label: 'Sandwich panel + poly spie',
    labelNL: 'Sandwichpaneel + poly spie',
    description: 'Geïsoleerde wand met polycarbonaat driehoek.',
    pricing: { type: 'bySandwichPolyspieDepth' },
  },
  {
    id: 'sandwich_vol',
    label: 'Full sandwich panel',
    labelNL: 'Volledig sandwichpaneel',
    description: 'Volledig geïsoleerde wand van sandwichpanelen.',
    pricing: { type: 'bySandwichDepth' },
  },
  // ── Glazen schuifwand (uitgeschakeld – zet onderstaand blok weer aan om te activeren)
  // {
  //   id: 'glas_schuifwand',
  //   label: 'Glass sliding wall',
  //   labelNL: 'Glazen schuifwand',
  //   description: 'Glazen schuifwand over de gehele diepte van de zijkant.',
  //   pricing: { type: 'byGlassSideWall' },
  // },
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
    description: 'LED spots (wordt apart berekend op basis van breedte)',
    pricing: { type: 'fixed', price: 0 },
  },
] as const;

// =============================================================================
// AGGREGATED OPTIONS STRUCTURE
// =============================================================================

/**
 * Complete configuration options grouped by step
 * This is the main export for UI components
 * 
 * STEP ORDER (single source of truth):
 * 1. Color - required, no price
 * 2. Daktype (Roof type) - required
 * 3. Goot (Gutter) - required
 * 4. Zijwand links (Left side wall) - optional
 * 5. Zijwand rechts (Right side wall) - optional
 * 6. Voorzijde (Front side) - optional
 * 7. Verlichting (Extras) - optional
 */
export const VERANDA_OPTION_GROUPS: OptionGroup[] = [
  {
    id: 'color',
    step: 1,
    label: 'Color',
    labelNL: 'Kleur profiel',
    required: true,
    choices: COLOR_OPTIONS.map(c => ({
      id: c.id,
      label: c.label,
      labelNL: c.labelNL,
      description: c.description,
      pricing: { type: 'fixed', price: 0 },
    })) as OptionChoice[],
  },
  {
    id: 'daktype',
    step: 2,
    label: 'Roof type',
    labelNL: 'Daktype',
    required: true,
    choices: [...ROOF_TYPE_OPTIONS],
  },
  {
    id: 'goot',
    step: 3,
    label: 'Gutter',
    labelNL: 'Goot',
    required: true,
    choices: [...GUTTER_OPTIONS],
  },
  {
    id: 'zijwand_links',
    step: 4,
    label: 'Left side wall',
    labelNL: 'Zijwand links',
    required: false,
    choices: [...SIDE_WALL_OPTIONS],
  },
  {
    id: 'zijwand_rechts',
    step: 5,
    label: 'Right side wall',
    labelNL: 'Zijwand rechts',
    required: false,
    choices: [...SIDE_WALL_OPTIONS],
  },
  {
    id: 'voorzijde',
    step: 6,
    label: 'Front side',
    labelNL: 'Voorzijde',
    required: false,
    choices: [...FRONT_SIDE_OPTIONS],
  },
  {
    id: 'verlichting',
    step: 7,
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
 * Automatically handles fixed, byWidth, bySize, byGlassWall, and bySandwichDepth pricing
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
    
    case 'byGlassWall':
      // Extract width from product size string (e.g., "506x300" → 506, "706x400" → 706)
      // The width is already in cm and matches the glass wall price table keys
      const widthCm = getWidthFromSize(size);
      return getGlassWallPrice(widthCm, pricing.variant);
    
    case 'bySandwichDepth':
      // Extract depth from product size and look up in sandwich wall price table
      const depthCm = getDepthFromSize(size);
      const sandwichPrice = SANDWICH_WALL_PRICE_BY_DEPTH[depthCm];
      if (sandwichPrice !== undefined) {
        return sandwichPrice;
      }
      console.warn('[SandwichWall] No price for depth', depthCm);
      return 0;
    
    case 'bySandwichPolyspieDepth':
      // Extract depth from product size and look up in sandwich+polyspie price table
      const depthCmPoly = getDepthFromSize(size);
      const polyspiePrice = SANDWICH_POLYSPIE_PRICE_BY_DEPTH[depthCmPoly];
      if (polyspiePrice !== undefined) {
        return polyspiePrice;
      }
      console.warn('[SandwichPolyspie] No price for depth', depthCmPoly);
      return 0;
    
    case 'byPolySpieDepth':
      // Extract depth from product size and look up in poly spie price table
      const depthCmPolySpie = getDepthFromSize(size);
      const polySpiePrice = POLY_SPIE_PRICE_BY_DEPTH[depthCmPolySpie];
      if (polySpiePrice !== undefined) {
        return polySpiePrice;
      }
      console.warn('[PolySpie] No price for depth', depthCmPolySpie);
      return 0;
    
    case 'byGlassSideWall':
      // Glass sliding wall for side walls — price depends on depth
      const depthCmGlass = getDepthFromSize(size);
      const glassSidePrice = GLASS_SIDE_WALL_PRICE_BY_DEPTH[depthCmGlass];
      if (glassSidePrice !== undefined) {
        return glassSidePrice;
      }
      console.warn('[GlassSideWall] No price for depth', depthCmGlass);
      return 0;
    
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
