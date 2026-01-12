import { NavItem, Project, NewsItem, CategorySlug } from './types';

export const CATEGORIES: Record<CategorySlug, { label: string; path: string; requiresConfiguration: boolean }> = {
  verandas: { label: "Veranda's", path: '/categorie/verandas', requiresConfiguration: true },
  accessoires: { label: 'Accessoires', path: '/categorie/accessoires', requiresConfiguration: false },
};

export const NAV_ITEMS: NavItem[] = [
  ...Object.values(CATEGORIES).map(c => ({ label: c.label, path: c.path })),
  { label: 'Maatwerk configurator', path: '/maatwerk-configurator' },
  { label: 'Projecten', path: '/projecten' },
  { label: 'Contact', path: '/contact' },
];

// =============================================================================
// PROJECTS & NEWS (Static content - not from Shopify)
// =============================================================================

export const PROJECTS: Project[] = [
  { id: 'prj-1', title: 'Luxe Tuinkamer Utrecht', category: 'Tuinkamer', imageUrl: '/assets/images/inspiration_tuinkamer.webp', description: 'Volledig geïsoleerd.', location: 'Utrecht' }
];

export const NEWS_ITEMS: NewsItem[] = [
  { id: 'tips-montage', title: '5 tips voor montage', excerpt: 'Expert tips.', content: '...', date: '12 Mei 2024', author: 'HETT', category: 'Montage', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop', readTime: '4 min' }
];
