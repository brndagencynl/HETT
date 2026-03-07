/**
 * Glazen Schuifwanden — hardcoded product data
 * ==============================================
 *
 * This file follows the same pattern as other static content files
 * in the data/ directory. No CMS or Shopify integration required.
 */

export interface GlazenSchuifwandVariant {
  rail: number;            // 2 | 3 | 4 | 5 | 6
  slug: string;            // e.g. "2-rail"
  title: string;
  intro: string;
  priceFromCents: number;  // in euro-cents, same convention as everywhere
  bullets: string[];       // 3 USPs
  leadTime: string;
  images: {
    main: string;
    thumbnails: string[];
  };
  widthOptions: { label: string; cm: number }[];
  heightOptions: { label: string; cm: number }[];
}

export const GLAZEN_SCHUIFWANDEN: GlazenSchuifwandVariant[] = [
  {
    rail: 2,
    slug: '2-rail',
    title: '2-rail glazen schuifwand',
    intro: 'Compacte glazen schuifwand met 2 rails. Ideaal voor kleinere openingen en balkons. Biedt een helder uitzicht met minimale profielen.',
    priceFromCents: 89500,
    bullets: [
      'Geschikt voor openingen tot ±200 cm',
      'Gehard veiligheidsglas 8 mm',
      'Inclusief boven- en onderrail',
    ],
    leadTime: '3-5 werkdagen',
    images: {
      main: '/assets/images/glass_sliding_walls.webp',
      thumbnails: [
        '/assets/images/glass_sliding_walls.webp',
      ],
    },
    widthOptions: [
      { label: '150 cm', cm: 150 },
      { label: '175 cm', cm: 175 },
      { label: '200 cm', cm: 200 },
    ],
    heightOptions: [
      { label: '200 cm', cm: 200 },
      { label: '220 cm', cm: 220 },
      { label: '250 cm', cm: 250 },
    ],
  },
  {
    rail: 3,
    slug: '3-rail',
    title: '3-rail glazen schuifwand',
    intro: 'Veelzijdige glazen schuifwand met 3 rails. De populairste keuze voor veranda\'s en terrasoverkappingen. Perfecte balans tussen doorloop en uitzicht.',
    priceFromCents: 119500,
    bullets: [
      'Geschikt voor openingen tot ±300 cm',
      'Gehard veiligheidsglas 8 mm',
      'Populairste keuze voor veranda\'s',
    ],
    leadTime: '3-5 werkdagen',
    images: {
      main: '/assets/images/glass_sliding_walls.webp',
      thumbnails: [
        '/assets/images/glass_sliding_walls.webp',
      ],
    },
    widthOptions: [
      { label: '200 cm', cm: 200 },
      { label: '250 cm', cm: 250 },
      { label: '300 cm', cm: 300 },
    ],
    heightOptions: [
      { label: '200 cm', cm: 200 },
      { label: '220 cm', cm: 220 },
      { label: '250 cm', cm: 250 },
    ],
  },
  {
    rail: 4,
    slug: '4-rail',
    title: '4-rail glazen schuifwand',
    intro: 'Ruime glazen schuifwand met 4 rails. Geschikt voor grotere openingen, zodat je optimaal kunt genieten van je tuin het hele jaar door.',
    priceFromCents: 149500,
    bullets: [
      'Geschikt voor openingen tot ±400 cm',
      'Gehard veiligheidsglas 8 mm',
      'Maximale ventilatie mogelijk',
    ],
    leadTime: '3-5 werkdagen',
    images: {
      main: '/assets/images/glass_sliding_walls.webp',
      thumbnails: [
        '/assets/images/glass_sliding_walls.webp',
      ],
    },
    widthOptions: [
      { label: '300 cm', cm: 300 },
      { label: '350 cm', cm: 350 },
      { label: '400 cm', cm: 400 },
    ],
    heightOptions: [
      { label: '200 cm', cm: 200 },
      { label: '220 cm', cm: 220 },
      { label: '250 cm', cm: 250 },
    ],
  },
  {
    rail: 5,
    slug: '5-rail',
    title: '5-rail glazen schuifwand',
    intro: 'Extra brede glazen schuifwand met 5 rails. Voor grote veranda\'s en tuinkamers die een naadloze verbinding met de tuin vragen.',
    priceFromCents: 179500,
    bullets: [
      'Geschikt voor openingen tot ±500 cm',
      'Gehard veiligheidsglas 8 mm',
      'Ideaal voor grote veranda\'s',
    ],
    leadTime: '5-7 werkdagen',
    images: {
      main: '/assets/images/glass_sliding_walls.webp',
      thumbnails: [
        '/assets/images/glass_sliding_walls.webp',
      ],
    },
    widthOptions: [
      { label: '400 cm', cm: 400 },
      { label: '450 cm', cm: 450 },
      { label: '500 cm', cm: 500 },
    ],
    heightOptions: [
      { label: '200 cm', cm: 200 },
      { label: '220 cm', cm: 220 },
      { label: '250 cm', cm: 250 },
    ],
  },
  {
    rail: 6,
    slug: '6-rail',
    title: '6-rail glazen schuifwand',
    intro: 'De grootste glazen schuifwand in ons assortiment. Met 6 rails creëer je een volledig open gevoel voor de meest imposante overkappingen.',
    priceFromCents: 209500,
    bullets: [
      'Geschikt voor openingen tot ±600 cm',
      'Gehard veiligheidsglas 8 mm',
      'Volledig open te schuiven',
    ],
    leadTime: '5-7 werkdagen',
    images: {
      main: '/assets/images/glass_sliding_walls.webp',
      thumbnails: [
        '/assets/images/glass_sliding_walls.webp',
      ],
    },
    widthOptions: [
      { label: '500 cm', cm: 500 },
      { label: '550 cm', cm: 550 },
      { label: '600 cm', cm: 600 },
    ],
    heightOptions: [
      { label: '200 cm', cm: 200 },
      { label: '220 cm', cm: 220 },
      { label: '250 cm', cm: 250 },
    ],
  },
];

export const GLASS_TYPES = [
  { id: 'helder', label: 'Helder glas' },
  { id: 'getint', label: 'Getint glas' },
] as const;

export const COLOR_OPTIONS = [
  { id: 'antraciet', label: 'Antraciet', hex: '#3C3C3C' },
  { id: 'zwart',     label: 'Zwart',     hex: '#1A1A1A' },
  { id: 'wit',       label: 'Wit',       hex: '#F5F5F5' },
] as const;

export type GlassTypeId = typeof GLASS_TYPES[number]['id'];
export type ColorId = typeof COLOR_OPTIONS[number]['id'];

export function getVariantBySlug(slug: string): GlazenSchuifwandVariant | undefined {
  return GLAZEN_SCHUIFWANDEN.find((v) => v.slug === slug);
}
