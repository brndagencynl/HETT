export interface Product {
  id: string;
  title: string;
  category: 'dak' | 'wand' | 'accessoires' | 'gevel';
  shortDescription: string;
  description: string;
  imageUrl: string;
  specs: {
    thickness: string[];
    uValue: string;
    width: string;
    coating: string;
  };
  isNew?: boolean;
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
  content: string; // HTML/Markdown string for simplicity in this demo
  date: string;
  author: string;
  category: string;
  imageUrl: string;
  readTime: string; // e.g. "4 min lezen"
}

export interface NavItem {
  label: string;
  path: string;
}

export interface ConfigOption {
  id: string;
  label: string;
  value: string;
  color?: string; // For visual selection
  image?: string; // For texture preview
}

export interface PanelConfig {
  type: 'dak' | 'wand';
  thickness: number; // mm
  color: string;
  finish: string;
  length: number; // cm
}