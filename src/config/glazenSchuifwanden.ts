/**
 * Glazen Schuifwanden — Hardcoded Configuration & Pricing
 * ========================================================
 *
 * Product data (title, images, handle) comes from Shopify.
 * Configuration options and pricing rules are hardcoded here.
 *
 * Shopify tagging convention:
 *   - All products: tag "glazen-schuifwand"
 *   - Rail variant: tag "rail:2", "rail:3", etc.
 *
 * Cart route detected: A (Storefront Cart API)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface RailConfig {
  rail: number;
  slug: string;                         // URL slug, e.g. "2-rail"
  shopifyTag: string;                   // Shopify tag, e.g. "rail:2"
  widthOptions: DimensionOption[];
  heightOptions: DimensionOption[];
  usps: string[];
  leadTime: string;
  /** Fallback "from" price (cents) when Shopify product is unavailable */
  fallbackPriceCents: number;
}

export interface DimensionOption {
  label: string;
  cm: number;
}

export interface GlassType {
  id: GlassTypeId;
  label: string;
  /** Price surcharge in cents (relative to base = helder) */
  surchargeCents: number;
}

export interface ProfileColor {
  id: ColorId;
  label: string;
  hex: string;
  /** Price surcharge in cents (relative to base = antraciet) */
  surchargeCents: number;
}

export type GlassTypeId = 'helder' | 'getint';
export type ColorId = 'antraciet' | 'zwart' | 'wit';

export interface GlazenSchuifwandSelection {
  rail: number;
  widthCm: number;
  heightCm: number;
  glassType: GlassTypeId;
  color: ColorId;
}

export interface PriceBreakdown {
  baseCents: number;
  glassSurchargeCents: number;
  colorSurchargeCents: number;
  totalCents: number;
}

// =============================================================================
// GLASS TYPES
// =============================================================================

export const GLASS_TYPES: GlassType[] = [
  { id: 'helder', label: 'Helder glas', surchargeCents: 0 },
  { id: 'getint', label: 'Getint glas', surchargeCents: 7500 },
];

// =============================================================================
// PROFILE COLORS
// =============================================================================

export const PROFILE_COLORS: ProfileColor[] = [
  { id: 'antraciet', label: 'Antraciet', hex: '#3C3C3C', surchargeCents: 0 },
  { id: 'zwart',     label: 'Zwart',     hex: '#1A1A1A', surchargeCents: 0 },
  { id: 'wit',       label: 'Wit',       hex: '#F5F5F5', surchargeCents: 0 },
];

// =============================================================================
// HEIGHT OPTIONS (shared across all rail configs)
// =============================================================================

const SHARED_HEIGHT_OPTIONS: DimensionOption[] = [
  { label: '200 cm', cm: 200 },
  { label: '220 cm', cm: 220 },
  { label: '250 cm', cm: 250 },
];

// =============================================================================
// RAIL CONFIGURATIONS
// =============================================================================

export const RAIL_CONFIGS: RailConfig[] = [
  {
    rail: 2,
    slug: '2-rail',
    shopifyTag: 'rail:2',
    fallbackPriceCents: 89500,
    widthOptions: [
      { label: '150 cm', cm: 150 },
      { label: '175 cm', cm: 175 },
      { label: '200 cm', cm: 200 },
    ],
    heightOptions: SHARED_HEIGHT_OPTIONS,
    usps: [
      'Geschikt voor openingen tot ±200 cm',
      'Gehard veiligheidsglas 8 mm',
      'Inclusief boven- en onderrail',
    ],
    leadTime: '3-5 werkdagen',
  },
  {
    rail: 3,
    slug: '3-rail',
    shopifyTag: 'rail:3',
    fallbackPriceCents: 119500,
    widthOptions: [
      { label: '200 cm', cm: 200 },
      { label: '250 cm', cm: 250 },
      { label: '300 cm', cm: 300 },
    ],
    heightOptions: SHARED_HEIGHT_OPTIONS,
    usps: [
      'Geschikt voor openingen tot ±300 cm',
      'Gehard veiligheidsglas 8 mm',
      'Populairste keuze voor veranda\'s',
    ],
    leadTime: '3-5 werkdagen',
  },
  {
    rail: 4,
    slug: '4-rail',
    shopifyTag: 'rail:4',
    fallbackPriceCents: 149500,
    widthOptions: [
      { label: '300 cm', cm: 300 },
      { label: '350 cm', cm: 350 },
      { label: '400 cm', cm: 400 },
    ],
    heightOptions: SHARED_HEIGHT_OPTIONS,
    usps: [
      'Geschikt voor openingen tot ±400 cm',
      'Gehard veiligheidsglas 8 mm',
      'Maximale ventilatie mogelijk',
    ],
    leadTime: '3-5 werkdagen',
  },
  {
    rail: 5,
    slug: '5-rail',
    shopifyTag: 'rail:5',
    fallbackPriceCents: 179500,
    widthOptions: [
      { label: '400 cm', cm: 400 },
      { label: '450 cm', cm: 450 },
      { label: '500 cm', cm: 500 },
    ],
    heightOptions: SHARED_HEIGHT_OPTIONS,
    usps: [
      'Geschikt voor openingen tot ±500 cm',
      'Gehard veiligheidsglas 8 mm',
      'Ideaal voor grote veranda\'s',
    ],
    leadTime: '5-7 werkdagen',
  },
  {
    rail: 6,
    slug: '6-rail',
    shopifyTag: 'rail:6',
    fallbackPriceCents: 209500,
    widthOptions: [
      { label: '500 cm', cm: 500 },
      { label: '550 cm', cm: 550 },
      { label: '600 cm', cm: 600 },
    ],
    heightOptions: SHARED_HEIGHT_OPTIONS,
    usps: [
      'Geschikt voor openingen tot ±600 cm',
      'Gehard veiligheidsglas 8 mm',
      'Volledig open te schuiven',
    ],
    leadTime: '5-7 werkdagen',
  },
];

// =============================================================================
// PRICING TABLE  (rail → widthCm → base price cents)
// =============================================================================

/**
 * Base price matrix: [rail][widthCm] → price in cents.
 * Height is NOT a price driver in V1 (same price for 200/220/250 cm).
 */
const PRICE_MATRIX: Record<number, Record<number, number>> = {
  2: { 150: 89500, 175: 97500, 200: 105500 },
  3: { 200: 119500, 250: 134500, 300: 149500 },
  4: { 300: 149500, 350: 164500, 400: 179500 },
  5: { 400: 179500, 450: 194500, 500: 209500 },
  6: { 500: 209500, 550: 224500, 600: 239500 },
};

// =============================================================================
// HELPERS
// =============================================================================

/** Get rail config by slug (e.g. "3-rail") */
export function getRailConfigBySlug(slug: string): RailConfig | undefined {
  return RAIL_CONFIGS.find((c) => c.slug === slug);
}

/** Get rail config by rail number */
export function getRailConfig(rail: number): RailConfig | undefined {
  return RAIL_CONFIGS.find((c) => c.rail === rail);
}

/**
 * Calculate the full price for a glazen schuifwand selection.
 * Returns a detailed breakdown.
 */
export function calculatePrice(selection: GlazenSchuifwandSelection): PriceBreakdown {
  const railPrices = PRICE_MATRIX[selection.rail];
  const baseCents = railPrices?.[selection.widthCm] ?? 0;

  const glassType = GLASS_TYPES.find((g) => g.id === selection.glassType);
  const glassSurchargeCents = glassType?.surchargeCents ?? 0;

  const color = PROFILE_COLORS.find((c) => c.id === selection.color);
  const colorSurchargeCents = color?.surchargeCents ?? 0;

  return {
    baseCents,
    glassSurchargeCents,
    colorSurchargeCents,
    totalCents: baseCents + glassSurchargeCents + colorSurchargeCents,
  };
}

/**
 * Get the "from" price for a rail config (lowest width, helder glass, antraciet).
 */
export function getFromPriceCents(rail: number): number {
  const railPrices = PRICE_MATRIX[rail];
  if (!railPrices) return 0;
  return Math.min(...Object.values(railPrices));
}

/**
 * Build a display summary for a glazen schuifwand configuration.
 */
export function buildDisplaySummary(selection: GlazenSchuifwandSelection): string {
  const glass = GLASS_TYPES.find((g) => g.id === selection.glassType);
  const color = PROFILE_COLORS.find((c) => c.id === selection.color);
  return `${selection.rail}-rail • ${selection.widthCm}×${selection.heightCm} cm • ${glass?.label ?? selection.glassType} • ${color?.label ?? selection.color}`;
}
