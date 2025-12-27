
import { mockProvider } from './mockProvider';
import { shopifyProvider } from './shopifyProvider';
import { ContentProvider } from './provider';

/**
 * Content provider selection
 * - 'shopify': Use Shopify Storefront API (production)
 * - 'mock': Use mock data (development/testing)
 */
const providerName = import.meta.env.VITE_CONTENT_PROVIDER || 'shopify';

export const content: ContentProvider = providerName === 'mock' ? mockProvider : shopifyProvider;
