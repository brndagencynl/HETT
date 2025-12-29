/**
 * Maatwerk Veranda Configurator - Helpers
 * ========================================
 * 
 * Utility functions for the maatwerk veranda configurator.
 */

import type {
  MaatwerkConfig,
  PartialMaatwerkConfig,
  MaatwerkSize,
  MaatwerkCartPayload,
  MaatwerkColorId,
} from './customTypes';
import { 
  MAATWERK_COLOR_OPTIONS,
  MAATWERK_WIDTH_MIN,
  MAATWERK_WIDTH_MAX,
  MAATWERK_DEPTH_MIN,
  MAATWERK_DEPTH_MAX,
  isValidMaatwerkWidth,
  isValidMaatwerkDepth,
} from './customTypes';
import { calculateMaatwerkPrice, getMaatwerkOptionLabel, MAATWERK_OPTION_GROUPS } from './customPricing';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if a maatwerk config is complete and valid
 */
export function isMaatwerkConfigComplete(config: PartialMaatwerkConfig): config is MaatwerkConfig {
  return (
    config.size !== undefined &&
    config.size.width !== undefined &&
    config.size.depth !== undefined &&
    isValidMaatwerkWidth(config.size.width) &&
    isValidMaatwerkDepth(config.size.depth) &&
    config.color !== undefined &&
    config.daktype !== undefined &&
    config.goot !== undefined
  );
}

/**
 * Get validation errors for a maatwerk config
 */
export function getMaatwerkValidationErrors(config: PartialMaatwerkConfig): string[] {
  const errors: string[] = [];
  
  if (!config.size?.width) {
    errors.push('Selecteer een breedte');
  } else if (!isValidMaatwerkWidth(config.size.width)) {
    errors.push(`Breedte moet tussen ${MAATWERK_WIDTH_MIN} en ${MAATWERK_WIDTH_MAX} cm zijn`);
  }
  
  if (!config.size?.depth) {
    errors.push('Selecteer een diepte');
  } else if (!isValidMaatwerkDepth(config.size.depth)) {
    errors.push(`Diepte moet tussen ${MAATWERK_DEPTH_MIN} en ${MAATWERK_DEPTH_MAX} cm zijn`);
  }
  
  if (!config.color) errors.push('Selecteer een kleur');
  if (!config.daktype) errors.push('Selecteer een daktype');
  if (!config.goot) errors.push('Selecteer een goot optie');
  
  return errors;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Format size for display
 */
export function formatMaatwerkSize(size: MaatwerkSize): string {
  return `${size.width} × ${size.depth} cm`;
}

/**
 * Get color details by ID
 */
export function getMaatwerkColorDetails(colorId: MaatwerkColorId) {
  return MAATWERK_COLOR_OPTIONS.find(c => c.id === colorId);
}

/**
 * Generate display summary for a maatwerk config
 */
export function getMaatwerkConfigSummary(config: PartialMaatwerkConfig): string {
  const parts: string[] = [];
  
  if (config.size) {
    parts.push(formatMaatwerkSize(config.size));
  }
  if (config.color) {
    const color = getMaatwerkColorDetails(config.color);
    parts.push(color?.label || config.color);
  }
  if (config.daktype) {
    parts.push(getMaatwerkOptionLabel('daktype', config.daktype));
  }
  
  return parts.join(' • ');
}

// =============================================================================
// CART PAYLOAD BUILDER
// =============================================================================

/**
 * Build cart payload for a maatwerk veranda
 */
export function buildMaatwerkCartPayload(config: MaatwerkConfig): MaatwerkCartPayload {
  const priceBreakdown = calculateMaatwerkPrice(config);
  
  return {
    type: 'maatwerk_veranda',
    title: 'Maatwerk Veranda',
    quantity: 1,
    basePrice: priceBreakdown.basePrice,
    optionsTotal: priceBreakdown.optionsTotal,
    totalPrice: priceBreakdown.grandTotal,
    size: config.size,
    selections: priceBreakdown.selections,
    priceBreakdown,
    renderPreview: undefined, // Can be added later
  };
}

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

export type MaatwerkStepId = 
  | 'afmetingen'
  | 'color' 
  | 'daktype' 
  | 'goot' 
  | 'zijwand_links' 
  | 'zijwand_rechts' 
  | 'voorzijde' 
  | 'verlichting' 
  | 'overzicht';

export interface MaatwerkStep {
  id: MaatwerkStepId;
  title: string;
  description: string;
  required: boolean;
}

/**
 * Steps for the maatwerk configurator
 * Step 1 is Afmetingen (width × depth), then existing option steps
 */
export const MAATWERK_STEPS: MaatwerkStep[] = [
  {
    id: 'afmetingen',
    title: 'Afmetingen',
    description: 'Kies de breedte en diepte van uw maatwerk veranda',
    required: true,
  },
  {
    id: 'color',
    title: 'Kleur profiel',
    description: 'Kies de kleur van uw aluminium profielen',
    required: true,
  },
  {
    id: 'daktype',
    title: 'Daktype',
    description: 'Selecteer het type dakbedekking',
    required: true,
  },
  {
    id: 'goot',
    title: 'Goot optie',
    description: 'Kies de stijl van de goot',
    required: true,
  },
  {
    id: 'zijwand_links',
    title: 'Zijwand links',
    description: 'Optionele linker zijwand',
    required: false,
  },
  {
    id: 'zijwand_rechts',
    title: 'Zijwand rechts',
    description: 'Optionele rechter zijwand',
    required: false,
  },
  {
    id: 'voorzijde',
    title: 'Voorzijde',
    description: 'Optionele glazen schuifwand aan de voorkant',
    required: false,
  },
  {
    id: 'verlichting',
    title: "Extra's",
    description: 'LED verlichting en andere extra opties',
    required: false,
  },
  {
    id: 'overzicht',
    title: 'Overzicht',
    description: 'Controleer uw configuratie en voeg toe aan winkelwagen',
    required: false,
  },
];

/**
 * Check if a step is complete
 */
export function isMaatwerkStepComplete(
  stepId: MaatwerkStepId, 
  config: PartialMaatwerkConfig
): boolean {
  switch (stepId) {
    case 'afmetingen':
      return config.size?.width !== undefined && config.size?.depth !== undefined;
    case 'color':
      return config.color !== undefined;
    case 'daktype':
      return config.daktype !== undefined;
    case 'goot':
      return config.goot !== undefined;
    case 'zijwand_links':
    case 'zijwand_rechts':
    case 'voorzijde':
    case 'verlichting':
    case 'overzicht':
      return true; // Optional steps are always "complete"
    default:
      return true;
  }
}
