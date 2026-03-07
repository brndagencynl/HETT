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
// SHARED OPTIONS  (glass & colour apply to all rails)
// =============================================================================

const SHARED_TYPE_GLAS: Option[] = [
  { id: 'helder', label: 'Helder', priceDelta: 0 },
  { id: 'getint', label: 'Getint', priceDelta: 0 },
];

const SHARED_KLEUR_PROFIEL: SwatchOption[] = [
  { id: 'antraciet', label: 'Antraciet', swatch: '#3A3F45', priceDelta: 0 },
  { id: 'zwart',     label: 'Zwart',     swatch: '#111111', priceDelta: 0 },
  { id: 'wit',       label: 'Wit',       swatch: '#F2F2F2', priceDelta: 0 },
  { id: 'creme',     label: 'Crème',     swatch: '#E7DCC8', priceDelta: 0 },
];

const SHARED_EXTRAS: ExtraOption[] = [
  {
    id: 'glasopvang',
    label: 'Glasopvang',
    subtitle: 'Set van 2',
    infoText: 'Glasopvang voorkomt dat panelen doorschieten en helpt bij veilige eindpositie.',
    popular: true,
    priceDelta: 95.0,
  },
  {
    id: 'tochtstrip',
    label: 'Tochtstrip',
    infoText: 'Tochtstrip voor betere afsluiting tussen panelen.',
    popular: true,
    priceDelta: 17.5,
  },
  {
    id: 'deurgreep-handvat',
    label: 'Deurgreep handvat',
    infoText: 'Handvat om schuifpanelen makkelijker te bedienen.',
    popular: true,
    priceDelta: 17.5,
  },
  {
    id: 'komgreep',
    label: 'Komgreep',
    infoText: 'Ingefreesde komgreep voor strak design.',
    priceDelta: 17.5,
  },
  {
    id: 'meenemers',
    label: 'Meenemers',
    infoText: 'Meenemers om meerdere panelen samen te laten meelopen.',
    popular: true,
    priceDelta: 12.5,
  },
  {
    id: 'funderingskoker',
    label: 'Funderingskoker',
    infoText: 'Koker voor fundering / uitlijning en extra stabiliteit.',
    priceDelta: 60.0,
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
    werkhoogte: [
      { id: '199-202', label: '199 cm tot 202 cm', priceDelta: 0 },
      { id: '204-207', label: '204 cm tot 207 cm', priceDelta: 0 },
      { id: '209-212', label: '209 cm tot 212 cm', priceDelta: 0 },
      { id: '214-217', label: '214 cm tot 217 cm', priceDelta: 0 },
      { id: '219-222', label: '219 cm tot 222 cm', priceDelta: 0 },
      { id: '224-227', label: '224 cm tot 227 cm', priceDelta: 0 },
      { id: '229-232', label: '229 cm tot 232 cm', priceDelta: 0 },
      { id: '234-237', label: '234 cm tot 237 cm', priceDelta: 0 },
      { id: '239-242', label: '239 cm tot 242 cm', priceDelta: 0 },
      { id: '244-247', label: '244 cm tot 247 cm', priceDelta: 0 },
      { id: '249-252', label: '249 cm tot 252 cm', priceDelta: 0 },
      { id: '254-257', label: '254 cm tot 257 cm', priceDelta: 0 },
      { id: '259-262', label: '259 cm tot 262 cm', priceDelta: 0 },
    ],
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
    inbouwbreedte: [],
    werkhoogte: [],
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
    inbouwbreedte: [],
    werkhoogte: [],
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
    inbouwbreedte: [],
    werkhoogte: [],
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
    inbouwbreedte: [],
    werkhoogte: [],
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
 */
export function calcOptionsTotalEur(selections: {
  inbouwbreedte?: Option;
  werkhoogte?: Option;
  typeGlas?: Option;
  kleurProfiel?: SwatchOption;
  extras: ExtraOption[];
}): number {
  let total = 0;
  if (selections.inbouwbreedte) total += selections.inbouwbreedte.priceDelta;
  if (selections.werkhoogte) total += selections.werkhoogte.priceDelta;
  if (selections.typeGlas) total += selections.typeGlas.priceDelta;
  if (selections.kleurProfiel) total += selections.kleurProfiel.priceDelta;
  for (const extra of selections.extras) {
    total += extra.priceDelta;
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
}): string {
  const parts: string[] = [`${cfg.rail}-rail`];
  if (selections.inbouwbreedte) parts.push(selections.inbouwbreedte.label);
  if (selections.werkhoogte) parts.push(selections.werkhoogte.label);
  if (selections.typeGlas) parts.push(selections.typeGlas.label);
  if (selections.kleurProfiel) parts.push(selections.kleurProfiel.label);
  if (selections.extras.length > 0) {
    parts.push(selections.extras.map((e) => e.label).join(', '));
  }
  return parts.join(' • ');
}
