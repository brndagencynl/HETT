/**
 * Maatwerk Veranda Configurator - Pricing
 * ========================================
 * 
 * Isolated pricing for the custom/maatwerk veranda configurator.
 * Uses width × depth to calculate base price and option prices.
 * 
 * PRICING STRUCTURE:
 * - Base price: calculated from width × depth using interpolation formula
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
// BASE PRICE CALCULATION
// =============================================================================

/**
 * Base pricing parameters for continuous width/depth values
 * Formula: basePrice + (width * widthRate) + (depth * depthRate) + (area * areaRate)
 */
const BASE_PRICING = {
  minimumPrice: 1100,
  baseFlat: 400,
  // Price per cm of width (after minimum)
  widthRate: 1.5,
  // Price per cm of depth (after minimum)
  depthRate: 2.0,
  // Additional price per cm² of area
  areaRate: 0.0003,
};

/**
 * Get base price for a given size using continuous interpolation
 * Works with any width (250-1200) and depth (250-500) values
 */
export function getMaatwerkBasePrice(size: MaatwerkSize): number {
  const { width, depth } = size;
  
  // Calculate area-based component
  const area = width * depth;
  
  // Linear interpolation formula that scales smoothly with dimensions
  const calculatedPrice = 
    BASE_PRICING.baseFlat +
    (width * BASE_PRICING.widthRate) +
    (depth * BASE_PRICING.depthRate) +
    (area * BASE_PRICING.areaRate);
  
  return Math.round(Math.max(BASE_PRICING.minimumPrice, calculatedPrice));
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
    id: 'glas_schuifwand',
    label: 'Glazen schuifwanden',
    description: 'Glazen panelen over de gehele breedte.',
    pricing: {
      type: 'byWidth',
      basePrice: 300,   // Base at minimum width
      pricePerCm: 1.50, // ~€1.50 per cm width
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
      return Math.round(pricing.basePrice + (size.width * pricing.pricePerCm));
    
    case 'byDepth':
      // Linear pricing: basePrice + (depth * pricePerCm)
      return Math.round(pricing.basePrice + (size.depth * pricing.pricePerCm));
    
    case 'byArea':
      // Calculate area in m² and multiply by rate
      const areaM2 = (size.width / 100) * (size.depth / 100);
      return Math.round(areaM2 * pricing.pricePerM2);
    
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
 */
export function calculateMaatwerkPrice(config: PartialMaatwerkConfig): MaatwerkPriceBreakdown {
  const size = config.size || { width: 600, depth: 300 };
  const basePrice = getMaatwerkBasePrice(size);
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

  const optionsTotal = selections.reduce((sum, s) => sum + s.price, 0);
  const grandTotal = basePrice + optionsTotal;

  return {
    basePrice,
    selections,
    optionsTotal,
    grandTotal,
  };
}

/**
 * Format price for display
 */
export function formatMaatwerkPrice(price: number): string {
  return `€ ${price.toLocaleString('nl-NL')},-`;
}
