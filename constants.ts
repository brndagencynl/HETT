import { NavItem, Product, Project, NewsItem, CategorySlug, ProductVisibility } from './types';
import { 
  MATRIX_WIDTHS, 
  MATRIX_DEPTHS, 
  getProductVisibility,
  toSizeKey,
} from './src/catalog/matrixCatalog';

export const CATEGORIES: Record<CategorySlug, { label: string; path: string; requiresConfiguration: boolean }> = {
  verandas: { label: "Veranda's", path: '/categorie/verandas', requiresConfiguration: true },
  sandwichpanelen: { label: 'Sandwichpanelen', path: '/products/sandwichpaneel', requiresConfiguration: true },
  accessoires: { label: 'Accessoires', path: '/categorie/accessoires', requiresConfiguration: false },
};

export const NAV_ITEMS: NavItem[] = [
  ...Object.values(CATEGORIES).map(c => ({ label: c.label, path: c.path })),
  { label: 'Maatwerk configurator', path: '/maatwerk-configurator' },
  { label: 'Projecten', path: '/projecten' },
  { label: 'Contact', path: '/contact' },
];

// =============================================================================
// VERANDA PRICE MATRIX
// =============================================================================

/**
 * Base prices for veranda matrix (width × depth)
 * Prices are calculated based on area with scaling factors
 */
function calculateVerandaBasePrice(widthCm: number, depthCm: number): number {
  // Base price formula: area-based with minimum
  const areaM2 = (widthCm / 100) * (depthCm / 100);
  const baseRate = 110; // €110 per m²
  const minimumPrice = 839;
  const fixedCost = 300; // Fixed cost component
  
  return Math.max(minimumPrice, Math.round(fixedCost + (areaM2 * baseRate)));
}

/**
 * Generate veranda product for a given size
 */
function createVerandaProduct(widthCm: number, depthCm: number): Product {
  const sizeKey = toSizeKey(widthCm, depthCm);
  const visibility = getProductVisibility(widthCm, depthCm);
  const price = calculateVerandaBasePrice(widthCm, depthCm);
  const priceExVat = Math.round((price / 1.21) * 100) / 100;
  
  // Format dimensions for display (e.g., "5.06 x 3.0 m")
  const widthM = (widthCm / 100).toFixed(2);
  const depthM = (depthCm / 100).toFixed(1);
  
  const isPublic = visibility === 'public';
  
  return {
    id: `veranda-${widthCm}-${depthCm}`,
    title: `HETT Veranda Premium - Aluminium overkapping ${widthM} x ${depthM} m`,
    category: 'verandas',
    price,
    priceExVat,
    shortDescription: 'Hittewerend polycarbonaat dak voor optimaal comfort.',
    description: `Complete aluminium terrasoverkapping ${widthCm} x ${depthCm} cm inclusief hittewerend opaal polycarbonaat dakbedekking. Eenvoudig te monteren en onderhoudsvrij.`,
    imageUrl: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop',
    specs: { 
      'Materiaal': 'Aluminium T6-6063', 
      'Dak': 'Polycarbonaat Opaal', 
      'Afmeting': `${widthCm} x ${depthCm} cm`,
      'Breedte': `${widthCm} cm`,
      'Diepte': `${depthCm} cm`,
    },
    isBestseller: isPublic && widthCm === 606 && depthCm === 300,
    badges: isPublic ? ['Kies & mix'] : [],
    rating: 4.8,
    reviewCount: isPublic ? Math.floor(500 + Math.random() * 1000) : 0,
    stockStatus: isPublic ? '20+ op voorraad voor levering morgen' : 'Op aanvraag',
    requiresConfiguration: true,
    options: { 
      colors: ['Antraciet', 'Zwart', 'Crème'], 
      sizes: [sizeKey], 
      roofTypes: ['Opaal', 'Helder'] 
    },
    visibility,
    sizeKey,
  };
}

/**
 * Generate all veranda products from the matrix
 * 60 total: 12 public + 48 hidden anchors
 */
function generateVerandaProducts(): Product[] {
  const products: Product[] = [];
  
  for (const width of MATRIX_WIDTHS) {
    for (const depth of MATRIX_DEPTHS) {
      products.push(createVerandaProduct(width, depth));
    }
  }
  
  return products;
}

// Generate veranda matrix products
const VERANDA_PRODUCTS = generateVerandaProducts();

// =============================================================================
// OTHER PRODUCTS
// =============================================================================

const OTHER_PRODUCTS: Product[] = [
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
    options: { colors: [], sizes: [] },
    visibility: 'public',
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
    options: { colors: [], sizes: [] },
    visibility: 'public',
  }
];

// =============================================================================
// COMBINED PRODUCTS
// =============================================================================

/**
 * All products including veranda matrix and other products
 * Use filterVisibleProducts() from productVisibility.ts to get only public products
 */
export const PRODUCTS: Product[] = [
  ...VERANDA_PRODUCTS,
  ...OTHER_PRODUCTS,
];

export const PROJECTS: Project[] = [
  { id: 'prj-1', title: 'Luxe Tuinkamer Utrecht', category: 'Tuinkamer', imageUrl: '/assets/images/inspiration_tuinkamer.png', description: 'Volledig geïsoleerd.', location: 'Utrecht' }
];

export const NEWS_ITEMS: NewsItem[] = [
  { id: 'tips-montage', title: '5 tips voor montage', excerpt: 'Expert tips.', content: '...', date: '12 Mei 2024', author: 'HETT', category: 'Montage', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop', readTime: '4 min' }
];
