import { NavItem, Product, Project, NewsItem, CategorySlug } from './types';

export const CATEGORIES: Record<CategorySlug, { label: string; path: string; requiresConfiguration: boolean }> = {
  verandas: { label: "Veranda's", path: '/categorie/verandas', requiresConfiguration: true },
  sandwichpanelen: { label: 'Sandwichpanelen', path: '/categorie/sandwichpanelen', requiresConfiguration: true },
  accessoires: { label: 'Accessoires', path: '/categorie/accessoires', requiresConfiguration: false },
};

export const NAV_ITEMS: NavItem[] = [
  ...Object.values(CATEGORIES).map(c => ({ label: c.label, path: c.path })),
  { label: 'Projecten', path: '/projecten' },
  { label: 'Contact', path: '/contact' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'veranda-306-250-opaal',
    title: 'HETT Veranda Premium - Aluminium overkapping 3.06 x 2.5 m',
    category: 'verandas',
    price: 839,
    priceExVat: 693.39,
    shortDescription: 'Hittewerend polycarbonaat dak voor optimaal comfort.',
    description: 'Complete aluminium terrasoverkapping inclusief hittewerend opaal polycarbonaat dakbedekking. Eenvoudig te monteren en onderhoudsvrij.',
    imageUrl: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop',
    specs: { 'Materiaal': 'Aluminium T6-6063', 'Dak': 'Polycarbonaat Opaal', 'Afmeting': '306 x 250 cm' },
    isBestseller: true,
    badges: ['Kies & mix', 'BESTSELLER'],
    rating: 4.8,
    reviewCount: 1507,
    stockStatus: '20+ op voorraad voor levering morgen',
    requiresConfiguration: true,
    options: { colors: ['Antraciet', 'Zwart'], sizes: ['306x250', '406x300'], roofTypes: ['Opaal', 'Helder'] }
  },
  {
    id: 'veranda-306-250-helder',
    title: 'HETT Veranda Basic - Aluminium overkapping 3.06 x 2.5 m',
    category: 'verandas',
    price: 839,
    priceExVat: 693.39,
    shortDescription: 'Helder polycarbonaat dak voor maximale lichtinval.',
    description: 'Geniet van maximaal licht met deze aluminium overkapping voorzien van helder polycarbonaat dakplaten.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    specs: { 'Materiaal': 'Aluminium T6-6063', 'Dak': 'Polycarbonaat Helder', 'Afmeting': '306 x 250 cm' },
    badges: ['4+1 GRATIS'],
    rating: 4.5,
    reviewCount: 221,
    stockStatus: '20+ op voorraad voor levering morgen',
    requiresConfiguration: true,
    options: { colors: ['Antraciet', 'Zwart'], sizes: ['306x250', '406x300'], roofTypes: ['Opaal', 'Helder'] }
  },
  {
    id: 'eco-dakpaneel',
    title: 'HETT Eco+ Dakpaneel - PIR Geïsoleerd Trapezium',
    category: 'sandwichpanelen',
    price: 45,
    priceExVat: 37.19,
    shortDescription: 'Hoogwaardig geïsoleerd dakpaneel met trapezium profiel.',
    description: 'Het HETT Eco+ dakpaneel is de standaard voor geïsoleerde daken.',
    imageUrl: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1960&auto=format&fit=crop',
    specs: { 'Werkende breedte': '1000mm', 'Isolatiekern': 'PIR' },
    isBestseller: true,
    badges: ['Projectvoordeel'],
    rating: 4.9,
    reviewCount: 1403,
    stockStatus: 'Niet op voorraad voor Bezorgen',
    requiresConfiguration: true,
    options: { colors: [], sizes: [] }
  },
  {
    id: 'accessoire-led-set',
    title: 'LED Verlichting Set (6 spots)',
    category: 'accessoires',
    price: 129,
    priceExVat: 106.61,
    shortDescription: 'Dimbare LED spots voor in de liggers.',
    description: 'Sfeervolle verlichting voor uw overkapping. Complete set inclusief trafo en afstandsbediening.',
    imageUrl: 'https://images.unsplash.com/photo-1565814329-4361921fe38b?q=80&w=1000&auto=format&fit=crop',
    specs: { 'Aantal': '6 spots', 'Kleur': 'Warm wit', 'Dimbaar': 'Ja' },
    requiresConfiguration: false,
    stockStatus: 'Op voorraad',
    options: { colors: [], sizes: [] }
  }
];

export const PROJECTS: Project[] = [
  { id: 'prj-1', title: 'Luxe Tuinkamer Utrecht', category: 'Tuinkamer', imageUrl: '/assets/images/inspiration_tuinkamer.png', description: 'Volledig geïsoleerd.', location: 'Utrecht' }
];

export const NEWS_ITEMS: NewsItem[] = [
  { id: 'tips-montage', title: '5 tips voor montage', excerpt: 'Expert tips.', content: '...', date: '12 Mei 2024', author: 'HETT', category: 'Montage', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop', readTime: '4 min' }
];
