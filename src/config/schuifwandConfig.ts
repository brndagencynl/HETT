/**
 * Glazen Schuifwanden — Configurator Options & Pricing
 * =====================================================
 *
 * All configurator options are hardcoded here per rail type.
 * Pricing works with priceDelta (EUR incl. BTW) — always additive.
 *
 * Product base price comes from Shopify variant.
 * Total = (basePrice + sum(selected priceDelta)) × quantity
 *
 * Cart route detected: A (Storefront Cart API)
 */

// =============================================================================
// TYPES
// =============================================================================

export type RailType = 2 | 3 | 4 | 5 | 6;

export type Option = {
  id: string;
  label: string;
  /** Price delta in EUR incl. BTW (additive on top of Shopify base price) */
  priceDelta: number;
  /** Optional image URL for visual option cards */
  imageUrl?: string;
};

export type SwatchOption = Option & {
  swatch?: string; // hex colour
};

export type ExtraOption = Option & {
  subtitle?: string;
  infoText?: string;
  /** Show a "Veel gekozen" badge */
  popular?: boolean;
};

export type SchuifwandConfig = {
  rail: RailType;
  slug: string;
  shopifyTag: string;
  usps: string[];
  leadTime: string;
  inbouwbreedte: Option[];
  werkhoogte: Option[];
  typeGlas: Option[];
  kleurProfiel: SwatchOption[];
  extras: ExtraOption[];
};

// =============================================================================
// SHARED OPTIONS  (glass, colour & werkhoogte apply to all rails)
// =============================================================================

const SHARED_TYPE_GLAS: Option[] = [
  { id: 'helder', label: 'Helder', priceDelta: 0, imageUrl: '/assets/images/schuifwand/glas-helder.webp' },
  { id: 'getint', label: 'Getint', priceDelta: 0, imageUrl: '/assets/images/schuifwand/glas-getint.webp' },
];

const SHARED_KLEUR_PROFIEL: SwatchOption[] = [
  { id: 'antraciet', label: 'RAL 7016 Antraciet', swatch: '#3A3F45', priceDelta: 0, imageUrl: '/assets/images/schuifwand/kleur-antraciet.webp' },
  { id: 'zwart',     label: 'RAL 9005 Zwart',     swatch: '#111111', priceDelta: 0, imageUrl: '/assets/images/schuifwand/kleur-zwart.webp' },
  { id: 'creme',     label: 'RAL 9001 Crème',     swatch: '#E7DCC8', priceDelta: 0, imageUrl: '/assets/images/schuifwand/kleur-creme.webp' },
];

const SHARED_WERKHOOGTE: Option[] = [
  { id: '198-202', label: '198 cm tot 202 cm', priceDelta: 0 },
  { id: '203-207', label: '203 cm tot 207 cm', priceDelta: 0 },
  { id: '208-212', label: '208 cm tot 212 cm', priceDelta: 0 },
  { id: '213-217', label: '213 cm tot 217 cm', priceDelta: 0 },
  { id: '218-222', label: '218 cm tot 222 cm', priceDelta: 0 },
  { id: '223-227', label: '223 cm tot 227 cm', priceDelta: 0 },
  { id: '228-232', label: '228 cm tot 232 cm', priceDelta: 0 },
  { id: '233-237', label: '233 cm tot 237 cm', priceDelta: 0 },
  { id: '238-242', label: '238 cm tot 242 cm', priceDelta: 0 },
  { id: '243-247', label: '243 cm tot 247 cm', priceDelta: 0 },
  { id: '248-252', label: '248 cm tot 252 cm', priceDelta: 0 },
  { id: '253-257', label: '253 cm tot 257 cm', priceDelta: 0 },
  { id: '258-262', label: '258 cm tot 262 cm', priceDelta: 0 },
];

const SHARED_EXTRAS: ExtraOption[] = [
  {
    id: 'glasopvang',
    label: 'Glasopvang',
    subtitle: 'Set van 2',
    infoText: 'Glasopvang voorkomt dat panelen doorschieten en helpt bij veilige eindpositie.',
    popular: true,
    priceDelta: 95.0,
    imageUrl: '/assets/images/schuifwand/extra-glasopvang.webp',
  },
  {
    id: 'tochtstrip',
    label: 'Tochtstrip',
    infoText: 'Tochtstrip voor betere afsluiting tussen panelen.',
    popular: true,
    priceDelta: 17.5,
    imageUrl: '/assets/images/schuifwand/extra-tochtstrip.webp',
  },
  {
    id: 'deurgreep',
    label: 'Deurgreep handvat',
    infoText: 'Handvat om schuifpanelen makkelijker te bedienen.',
    popular: true,
    priceDelta: 17.5,
    imageUrl: '/assets/images/schuifwand/extra-handvat.webp',
  },
  {
    id: 'komgreep',
    label: 'Komgreep',
    infoText: 'Ingefreesde komgreep voor strak design.',
    priceDelta: 17.5,
    imageUrl: '/assets/images/schuifwand/extra-komgreep.webp',
  },
  {
    id: 'meenemers',
    label: 'Meenemers',
    infoText: 'Meenemers om meerdere panelen samen te laten meelopen.',
    popular: true,
    priceDelta: 12.5,
    imageUrl: '/assets/images/schuifwand/extra-meenemers.webp',
  },
  {
    id: 'funderingskoker',
    label: 'Funderingskoker',
    infoText: 'Koker voor fundering / uitlijning en extra stabiliteit.',
    priceDelta: 60.0,
    imageUrl: '/assets/images/schuifwand/extra-funderingskoker.webp',
  },
];

// =============================================================================
// PER-RAIL CONFIGURATIONS
// =============================================================================

export const schuifwandConfigByRail: Record<RailType, SchuifwandConfig> = {
  2: {
    rail: 2,
    slug: '2-rail',
    shopifyTag: 'rail:2',
    usps: [
      'Geschikt voor openingen tot ±200 cm',
      'Gehard veiligheidsglas 8 mm',
      'Inclusief boven- en onderrail',
    ],
    leadTime: '3-5 werkdagen',
    inbouwbreedte: [
      { id: '140-163', label: 'tot 163 cm (2 × 83 cm)', priceDelta: 0 },
      { id: '164-183', label: '164 cm tot 183 cm (2 × 93 cm)', priceDelta: 0 },
      { id: '184-193', label: '184 cm tot 193 cm (2 × 98 cm)', priceDelta: 0 },
      { id: '194-204', label: '194 cm tot 204 cm (2 × 103 cm)', priceDelta: 0 },
    ],
    werkhoogte: SHARED_WERKHOOGTE,
    typeGlas: SHARED_TYPE_GLAS,
    kleurProfiel: SHARED_KLEUR_PROFIEL,
    extras: SHARED_EXTRAS,
  },

  // TODO: Fill with exact ranges from screenshots
  3: {
    rail: 3,
    slug: '3-rail',
    shopifyTag: 'rail:3',
    usps: [
      'Geschikt voor openingen tot ±300 cm',
      'Gehard veiligheidsglas 8 mm',
      'Populairste keuze voor veranda\'s',
    ],
    leadTime: '3-5 werkdagen',
    inbouwbreedte: [
      { id: '243-266', label: '243 cm tot 266 cm (3 × 90 cm)', priceDelta: 0 },
      { id: '267-290', label: '267 cm tot 290 cm (3 × 98 cm)', priceDelta: 0 },
      { id: '291-305', label: '291 cm tot 305 cm (3 × 103 cm)', priceDelta: 0 },
    ],
    werkhoogte: SHARED_WERKHOOGTE,
    typeGlas: SHARED_TYPE_GLAS,
    kleurProfiel: SHARED_KLEUR_PROFIEL,
    extras: SHARED_EXTRAS,
  },
  4: {
    rail: 4,
    slug: '4-rail',
    shopifyTag: 'rail:4',
    usps: [
      'Geschikt voor openingen tot ±400 cm',
      'Gehard veiligheidsglas 8 mm',
      'Maximale ventilatie mogelijk',
    ],
    leadTime: '3-5 werkdagen',
    inbouwbreedte: [
      { id: '323-354', label: '323 cm tot 354 cm (4 × 90 cm)', priceDelta: 0 },
      { id: '355-386', label: '355 cm tot 386 cm (4 × 98 cm)', priceDelta: 0 },
      { id: '387-405', label: '387 cm tot 405 cm (4 × 103 cm)', priceDelta: 0 },
    ],
    werkhoogte: SHARED_WERKHOOGTE,
    typeGlas: SHARED_TYPE_GLAS,
    kleurProfiel: SHARED_KLEUR_PROFIEL,
    extras: SHARED_EXTRAS,
  },
  5: {
    rail: 5,
    slug: '5-rail',
    shopifyTag: 'rail:5',
    usps: [
      'Geschikt voor openingen tot ±500 cm',
      'Gehard veiligheidsglas 8 mm',
      'Ideaal voor grote veranda\'s',
    ],
    leadTime: '5-7 werkdagen',
    inbouwbreedte: [
      { id: '406-440', label: '406 cm tot 440 cm (5 × 90 cm)', priceDelta: 0 },
      { id: '441-480', label: '441 cm tot 480 cm (5 × 98 cm)', priceDelta: 0 },
      { id: '481-505', label: '481 cm tot 505 cm (5 × 103 cm)', priceDelta: 0 },
    ],
    werkhoogte: SHARED_WERKHOOGTE,
    typeGlas: SHARED_TYPE_GLAS,
    kleurProfiel: SHARED_KLEUR_PROFIEL,
    extras: SHARED_EXTRAS,
  },
  6: {
    rail: 6,
    slug: '6-rail',
    shopifyTag: 'rail:6',
    usps: [
      'Geschikt voor openingen tot ±600 cm',
      'Gehard veiligheidsglas 8 mm',
      'Volledig open te schuiven',
    ],
    leadTime: '5-7 werkdagen',
    inbouwbreedte: [
      { id: '506-528', label: '506 cm tot 528 cm (6 × 90 cm)', priceDelta: 0 },
      { id: '529-577', label: '529 cm tot 577 cm (6 × 98 cm)', priceDelta: 0 },
      { id: '578-605', label: '578 cm tot 605 cm (6 × 103 cm)', priceDelta: 0 },
    ],
    werkhoogte: SHARED_WERKHOOGTE,
    typeGlas: SHARED_TYPE_GLAS,
    kleurProfiel: SHARED_KLEUR_PROFIEL,
    extras: SHARED_EXTRAS,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/** All rail types */
export const ALL_RAILS: RailType[] = [2, 3, 4, 5, 6];

/** Get config by slug (e.g. "3-rail") */
export function getSchuifwandConfigBySlug(slug: string): SchuifwandConfig | undefined {
  return ALL_RAILS.map((r) => schuifwandConfigByRail[r]).find((c) => c.slug === slug);
}

/** Get config by rail number */
export function getSchuifwandConfig(rail: RailType): SchuifwandConfig {
  return schuifwandConfigByRail[rail];
}

/**
 * Calculate options total (EUR) from selected option priceDelta values.
 * extraQuantities maps extra id → quantity (default 1 if not specified).
 */
export function calcOptionsTotalEur(selections: {
  inbouwbreedte?: Option;
  werkhoogte?: Option;
  typeGlas?: Option;
  kleurProfiel?: SwatchOption;
  extras: ExtraOption[];
  extraQuantities?: Map<string, number>;
}): number {
  let total = 0;
  if (selections.inbouwbreedte) total += selections.inbouwbreedte.priceDelta;
  if (selections.werkhoogte) total += selections.werkhoogte.priceDelta;
  if (selections.typeGlas) total += selections.typeGlas.priceDelta;
  if (selections.kleurProfiel) total += selections.kleurProfiel.priceDelta;
  for (const extra of selections.extras) {
    const qty = selections.extraQuantities?.get(extra.id) ?? 1;
    total += extra.priceDelta * qty;
  }
  return total;
}

/**
 * Build a human-readable summary of the configuration.
 */
export function buildConfigSummary(cfg: SchuifwandConfig, selections: {
  inbouwbreedte?: Option;
  werkhoogte?: Option;
  typeGlas?: Option;
  kleurProfiel?: SwatchOption;
  extras: ExtraOption[];
  extraQuantities?: Map<string, number>;
}): string {
  const parts: string[] = [`${cfg.rail}-rail`];
  if (selections.inbouwbreedte) parts.push(selections.inbouwbreedte.label);
  if (selections.werkhoogte) parts.push(selections.werkhoogte.label);
  if (selections.typeGlas) parts.push(selections.typeGlas.label);
  if (selections.kleurProfiel) parts.push(selections.kleurProfiel.label);
  if (selections.extras.length > 0) {
    parts.push(selections.extras.map((e) => {
      const qty = selections.extraQuantities?.get(e.id) ?? 1;
      return qty > 1 ? `${e.label} (${qty}×)` : e.label;
    }).join(', '));
  }
  return parts.join(' • ');
}
