/**
 * Shopify Product Operations
 * Fetch products and collections from Shopify Storefront API
 */

import { shopifyFetch, isShopifyConfigured } from './client';
import {
  GET_COLLECTION_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS,
} from './queries';
import type {
  ShopifyProduct,
  ShopifyCollection,
  CollectionResponse,
  ProductResponse,
  ProductsResponse,
} from './types';
import type { Product, CategorySlug } from '../../../types';

// =============================================================================
// COLLECTION HANDLES MAPPING
// =============================================================================

/**
 * Map our category slugs to Shopify collection handles
 * Adjust these handles to match your Shopify store structure
 */
const COLLECTION_HANDLES: Record<CategorySlug, string> = {
  verandas: 'verandas',
  sandwichpanelen: 'sandwichpanelen',
  accessoires: 'accessoires',
};

// =============================================================================
// PRODUCT TRANSFORMERS
// =============================================================================

/**
 * Transform a Shopify product to our internal Product type
 */
export function transformShopifyProduct(shopifyProduct: ShopifyProduct): Product {
  const firstVariant = shopifyProduct.variants.nodes[0];
  const price = firstVariant
    ? parseFloat(firstVariant.price.amount)
    : parseFloat(shopifyProduct.priceRange.minVariantPrice.amount);

  // Parse metafields
  const metafields = shopifyProduct.metafields || [];
  const getMetafield = (key: string) =>
    metafields.find(m => m.key === key)?.value;

  // Determine category from metafield or product type
  const categorySlug = getMetafield('category_slug') || 
    shopifyProduct.productType.toLowerCase().replace(/\s+/g, '') as CategorySlug;
  
  // Determine if configuration is required
  const requiresConfiguration = 
    getMetafield('requires_configuration') === 'true' ||
    categorySlug === 'verandas' ||
    categorySlug === 'sandwichpanelen';

  // Parse specs if available
  let specs: Record<string, string | string[]> = {};
  const specsJson = getMetafield('specs');
  if (specsJson) {
    try {
      specs = JSON.parse(specsJson);
    } catch {
      // Ignore parse errors
    }
  }

  // Determine visibility
  const visibility = getMetafield('visibility') === 'hidden_anchor' 
    ? 'hidden_anchor' 
    : 'public';

  return {
    id: shopifyProduct.handle, // Use handle as ID for URL friendliness
    title: shopifyProduct.title,
    category: categorySlug as CategorySlug,
    price: Math.round(price), // Round to whole euros
    priceExVat: Math.round(price / 1.21), // Calculate ex VAT
    shortDescription: shopifyProduct.description.substring(0, 160),
    description: shopifyProduct.descriptionHtml || shopifyProduct.description,
    imageUrl: shopifyProduct.featuredImage?.url || '/assets/images/placeholder.jpg',
    specs,
    isNew: shopifyProduct.tags.includes('nieuw'),
    isBestseller: shopifyProduct.tags.includes('bestseller'),
    badges: shopifyProduct.tags.filter(t => 
      ['nieuw', 'bestseller', 'actie', 'populair'].includes(t.toLowerCase())
    ),
    stockStatus: shopifyProduct.availableForSale ? 'Op voorraad' : 'Niet beschikbaar',
    options: {
      colors: extractColorOptions(shopifyProduct),
      sizes: extractSizeOptions(shopifyProduct),
      roofTypes: categorySlug === 'verandas' ? ['poly_helder', 'poly_opaal', 'glas'] : undefined,
    },
    requiresConfiguration,
    visibility,
    sizeKey: getMetafield('size_key') || undefined,
  };
}

/**
 * Extract color options from variant selected options
 */
function extractColorOptions(product: ShopifyProduct): string[] {
  const colors = new Set<string>();
  product.variants.nodes.forEach(variant => {
    const colorOption = variant.selectedOptions.find(
      opt => opt.name.toLowerCase() === 'kleur' || opt.name.toLowerCase() === 'color'
    );
    if (colorOption) {
      colors.add(colorOption.value);
    }
  });
  return Array.from(colors);
}

/**
 * Extract size options from variant selected options
 */
function extractSizeOptions(product: ShopifyProduct): string[] {
  const sizes = new Set<string>();
  product.variants.nodes.forEach(variant => {
    const sizeOption = variant.selectedOptions.find(
      opt => opt.name.toLowerCase() === 'maat' || 
             opt.name.toLowerCase() === 'size' ||
             opt.name.toLowerCase() === 'afmeting'
    );
    if (sizeOption) {
      sizes.add(sizeOption.value);
    }
  });
  return Array.from(sizes);
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch products from a collection by category
 */
export async function getCollectionProducts(
  category: CategorySlug,
  options: {
    first?: number;
    after?: string;
    includeHiddenAnchor?: boolean;
  } = {}
): Promise<{
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  if (!isShopifyConfigured()) {
    console.warn('[Products] Shopify not configured');
    return { products: [], hasNextPage: false, endCursor: null };
  }

  const handle = COLLECTION_HANDLES[category];
  const { first = 50, after } = options;

  try {
    const data = await shopifyFetch<CollectionResponse>(GET_COLLECTION_PRODUCTS, {
      handle,
      first,
      after,
    });

    if (!data.collection) {
      console.warn(`[Products] Collection not found: ${handle}`);
      return { products: [], hasNextPage: false, endCursor: null };
    }

    let products = data.collection.products.edges
      .map(edge => transformShopifyProduct(edge.node));

    // Filter out hidden_anchor products unless explicitly requested
    if (!options.includeHiddenAnchor) {
      products = products.filter(p => p.visibility !== 'hidden_anchor');
    }

    return {
      products,
      hasNextPage: data.collection.products.pageInfo.hasNextPage,
      endCursor: data.collection.products.pageInfo.endCursor,
    };
  } catch (error) {
    console.error(`[Products] Failed to fetch collection ${category}:`, error);
    return { products: [], hasNextPage: false, endCursor: null };
  }
}

/**
 * Fetch all products from a collection (handles pagination)
 */
export async function getAllCollectionProducts(
  category: CategorySlug,
  options: { includeHiddenAnchor?: boolean } = {}
): Promise<Product[]> {
  const allProducts: Product[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const result = await getCollectionProducts(category, {
      first: 50,
      after: cursor || undefined,
      includeHiddenAnchor: options.includeHiddenAnchor,
    });

    allProducts.push(...result.products);
    hasNextPage = result.hasNextPage;
    cursor = result.endCursor;
  }

  return allProducts;
}

/**
 * Fetch a single product by handle
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (import.meta.env.DEV) {
    console.log('[Shopify] Fetching product by handle:', handle);
  }

  if (!isShopifyConfigured()) {
    console.warn('[Products] Shopify not configured');
    return null;
  }

  try {
    const data = await shopifyFetch<ProductResponse>(GET_PRODUCT_BY_HANDLE, {
      handle,
    });

    if (!data.product) {
      if (import.meta.env.DEV) {
        console.log('[Shopify] Product not found:', handle);
      }
      return null;
    }

    const product = transformShopifyProduct(data.product);
    
    if (import.meta.env.DEV) {
      console.log('[Shopify] Product loaded:', product.title);
    }

    return product;
  } catch (error) {
    console.error(`[Products] Failed to fetch product ${handle}:`, error);
    return null;
  }
}

/**
 * Get the first variant ID for a product (for add-to-cart)
 */
export async function getProductVariantId(handle: string): Promise<string | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    const data = await shopifyFetch<ProductResponse>(GET_PRODUCT_BY_HANDLE, {
      handle,
    });

    if (!data.product || data.product.variants.nodes.length === 0) {
      return null;
    }

    return data.product.variants.nodes[0].id;
  } catch (error) {
    console.error(`[Products] Failed to get variant for ${handle}:`, error);
    return null;
  }
}

/**
 * Search products by query
 */
export async function searchProducts(
  query: string,
  options: {
    first?: number;
    after?: string;
  } = {}
): Promise<{
  products: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  if (!isShopifyConfigured()) {
    return { products: [], hasNextPage: false, endCursor: null };
  }

  const { first = 20, after } = options;

  try {
    const data = await shopifyFetch<ProductsResponse>(GET_PRODUCTS, {
      first,
      after,
      query,
    });

    const products = data.products.edges
      .map(edge => transformShopifyProduct(edge.node))
      .filter(p => p.visibility !== 'hidden_anchor');

    return {
      products,
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor,
    };
  } catch (error) {
    console.error('[Products] Search failed:', error);
    return { products: [], hasNextPage: false, endCursor: null };
  }
}

/**
 * Get all visible products across all categories
 */
export async function getAllProducts(): Promise<Product[]> {
  if (import.meta.env.DEV) {
    console.log('[Shopify] Fetching all products...');
    console.log('[Shopify] Domain:', import.meta.env.VITE_SHOPIFY_DOMAIN);
  }

  const categories: CategorySlug[] = ['verandas', 'sandwichpanelen', 'accessoires'];
  const results = await Promise.all(
    categories.map(cat => getAllCollectionProducts(cat, { includeHiddenAnchor: false }))
  );
  const allProducts = results.flat();

  if (import.meta.env.DEV) {
    console.log('[Shopify] Products loaded:', allProducts.length);
    console.log('[Shopify] Handles:', allProducts.map(p => p.id));
  }

  return allProducts;
}
