/**
 * Homepage Content Configuration
 * ==============================
 * 
 * Hardcoded content for the homepage "Populaire keuzes" section.
 * Edit the array below to change card content without touching JSX.
 */

export interface PopulaireVerandaKaart {
  key: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  deliveryLabel: string;
  usps: string[];
  imageSrc: string;
  imageAlt: string;
  /** Optional "vanaf" price in cents for display purposes */
  prijsVanafCents?: number;
}

/**
 * Populaire Veranda Kaarten
 * 
 * These 3 cards are shown on the homepage in the "Populaire keuzes" section.
 * To edit content, simply modify this array.
 */
export const POPULAIRE_VERANDA_KAARTEN: PopulaireVerandaKaart[] = [
  {
    key: 'cube',
    title: 'Cube Veranda',
    description: 'Strakke, moderne veranda met kubistische look. Ideaal voor een luxe uitstraling.',
    ctaLabel: 'Stel samen',
    href: '/categorie/verandas', // TODO: Add model deep-link when available, e.g. /categorie/verandas?model=cube
    deliveryLabel: '1-2 weken',
    usps: ['Hoogwaardige kwaliteit', 'Snelle levering', 'Eenvoudige montage'],
    imageSrc: '/assets/images/cube_render.png',
    imageAlt: 'Cube Veranda',
    prijsVanafCents: 69900,
  },
  {
    key: 'deluxe',
    title: 'Deluxe Veranda',
    description: 'Premium veranda met extra comfort en duurzame materialen voor jarenlang plezier.',
    ctaLabel: 'Stel samen',
    href: '/categorie/verandas', // TODO: Add model deep-link when available, e.g. /categorie/verandas?model=deluxe
    deliveryLabel: '1-2 weken',
    usps: ['Premium kwaliteit', 'Extra duurzaam', 'Uitgebreide garantie'],
    imageSrc: '/assets/images/deluxe_render.png',
    imageAlt: 'Deluxe Veranda',
    prijsVanafCents: 69900,
  },
  {
    key: 'classic',
    title: 'Classic Veranda',
    description: 'Tijdloze veranda met klassieke uitstraling. Perfect voor elke tuin.',
    ctaLabel: 'Stel samen',
    href: '/categorie/verandas', // TODO: Add model deep-link when available, e.g. /categorie/verandas?model=classic
    deliveryLabel: '1-2 weken',
    usps: ['Tijdloos design', 'Betaalbare luxe', 'Eenvoudige montage'],
    imageSrc: '/assets/images/classic_render.png',
    imageAlt: 'Classic Veranda',
    prijsVanafCents: 69900,
  },
];
