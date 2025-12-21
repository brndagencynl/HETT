
export interface Product {
  id: string;
  title: string;
  category: 'Overkappingen' | 'Sandwichpanelen' | 'Profielen' | 'Accessoires' | 'Dakpanelen' | 'Wandpanelen' | 'gevel';
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
  variantCount?: number;
  options?: {
    colors: string[];
    sizes: string[];
    roofTypes?: string[];
  };
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  selectedRoof?: string;
  quantity: number;
  totalPrice: number;
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