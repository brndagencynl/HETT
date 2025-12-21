
export type CategorySlug = 'verandas' | 'sandwichpanelen' | 'accessoires';

export interface Product {
  id: string;
  title: string;
  category: CategorySlug;
  price: number;
  priceExVat?: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  specs: {
    [key: string]: string | string[];
  };
  isNew?: boolean;
  isBestseller?: boolean;
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  stockStatus?: string;
  // variantCount removed as per request
  options?: {
    colors: string[];
    sizes: string[];
    roofTypes?: string[];
  };
  requiresConfiguration: boolean; // Now mandatory/explicit
}

// Product Configuration Types
export type ProductCategory = 'verandas' | 'sandwichpanelen' | 'accessoires';

export type VerandaConfig = {
  daktype?: 'poly_helder' | 'poly_opaal' | 'glas';
  goot?: 'deluxe' | 'cube' | 'classic'; // NEW (required)
  voorzijde?: 'geen' | 'glazen_schuifwand';
  zijwand_links?: 'geen' | 'poly_spie' | 'sandwich_poly_spie' | 'sandwich_volledig';
  zijwand_rechts?: 'geen' | 'poly_spie' | 'sandwich_poly_spie' | 'sandwich_volledig';
  extra_verlichting?: boolean;
  // Common visual options
  profileColor?: string;
  widthCm?: number;
  depthCm?: number;
};

export type SandwichConfig = {
  dikte?: string;
  kleur?: string;
  afwerking?: string;
  extra_u_profielen_m?: number;
  // Common visual options
  length?: number;
};

export type ProductConfig =
  | { category: 'verandas'; data: VerandaConfig }
  | { category: 'sandwichpanelen'; data: SandwichConfig }
  | { category: 'accessoires'; data?: Record<string, never> };

export interface CartItem extends Product {
  id: string; // Unique line ID
  sku?: string;
  slug: string; // Ensure slug is available (usually derived from ID)

  // Standard props
  quantity: number;
  totalPrice: number;

  // Config props
  config?: ProductConfig;
  configHash?: string;
  displayConfigSummary?: string;

  // Legacy/Compatibility props (to be deprecated or mapped)
  selectedSize?: string;
  selectedColor?: string;
  selectedRoof?: string;
  details?: { label: string; value: string }[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  readingTime: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  location?: string;
  usedProductIds?: string[];
  images?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  imageUrl: string;
  readTime: string;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface PanelConfig {
  type: 'dak' | 'wand';
  thickness: number;
  color: string;
  finish: string;
  length: number;
}