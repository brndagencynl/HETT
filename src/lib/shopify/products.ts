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
import { toCents, fromCents } from '../../utils/money';

export function parseShopifyUSPMetafield(
  metafield: { type?: string | null; value?: string | null } | null | undefined
): string[] {
  const rawValue = (metafield?.value ?? '').trim();
  if (!rawValue) return [];

  const rawType = (metafield?.type ?? '').trim();

  try {
    if (rawType.startsWith('list.')) {
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((x) => (typeof x === 'string' ? x.trim() : ''))
        .filter(Boolean);
    }

    return [rawValue].map((x) => x.trim()).filter(Boolean);
  } catch (error) {
    console.warn('[USP] Failed to parse custom.usps metafield value');
    return [];
  }
}

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
  const variants = shopifyProduct.variants?.nodes || [];
  // Get first available variant, or first variant, or null
  const availableVariant = variants.find(v => v?.availableForSale) || variants[0] || null;
  const firstVariant = availableVariant;
  
  const priceAmountStr = firstVariant
    ? firstVariant.price.amount
    : (shopifyProduct.priceRange?.minVariantPrice?.amount || '0');
  const priceCents = toCents(priceAmountStr);
  const price = fromCents(priceCents);

  // Log variant info for debugging
  console.log('[transformShopifyProduct] Product:', shopifyProduct.handle, {
    variantCount: variants.length,
    selectedVariantId: firstVariant?.id || 'NONE',
    availableForSale: firstVariant?.availableForSale,
  });

  // Parse metafields safely (handle null/undefined)
  const metafields = shopifyProduct.metafields || [];
  const getMetafield = (key: string) => {
    const field = metafields.find(m => m && m.key === key);
    return field?.value;
  };

  const getMetafieldObject = (namespace: string, key: string) => {
    return metafields.find((m) => m && m.namespace === namespace && m.key === key) || null;
  };

  // Determine category from metafield or product type
  const productType = shopifyProduct.productType || '';
  const rawCategorySlug = getMetafield('category_slug') || 
    productType.toLowerCase().replace(/\s+/g, '');
  
  // Normalize category to valid CategorySlug
  let categorySlug: CategorySlug = 'accessoires'; // default
  if (rawCategorySlug === 'verandas' || rawCategorySlug === 'veranda') {
    categorySlug = 'verandas';
  } else if (rawCategorySlug === 'sandwichpanelen' || rawCategorySlug === 'sandwichpaneel') {
    categorySlug = 'sandwichpanelen';
  } else if (rawCategorySlug === 'accessoires' || rawCategorySlug === 'accessoire') {
    categorySlug = 'accessoires';
  }
  
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

  // Safe tag access
  const tags = shopifyProduct.tags || [];
  const description = (shopifyProduct.description || '').trim();

  const toExcerpt = (text: string, maxLen: number) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    if (normalized.length <= maxLen) return normalized;
    const cut = normalized.slice(0, maxLen);
    // Prefer cutting at a word boundary when possible.
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > Math.floor(maxLen * 0.6) ? cut.slice(0, lastSpace) : cut).trim();
  };

  return {
    id: shopifyProduct.handle, // Use handle as ID for URL friendliness
    handle: shopifyProduct.handle,
    title: shopifyProduct.title || 'Product',
    category: categorySlug,
    priceCents,
    price,
    priceExVatCents: Math.round(priceCents / 1.21),
    priceExVat: fromCents(Math.round(priceCents / 1.21)),
    shortDescription: toExcerpt(description, 180),
    // Keep description as Shopify plain-text description to avoid rendering raw HTML tags in the UI.
    description,
    imageUrl: shopifyProduct.featuredImage?.url || '/assets/images/placeholder.webp',
    specs,
    isNew: tags.includes('nieuw'),
    isBestseller: tags.includes('bestseller'),
    badges: tags.filter(t => 
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
    // Shopify variant info for add-to-cart
    shopifyVariantId: firstVariant?.id || undefined,
    availableForSale: firstVariant?.availableForSale ?? shopifyProduct.availableForSale ?? false,
    // Custom metafields for product detail page
    extraDescription: getMetafield('extra_description') || undefined,
    specificationsRaw: getMetafield('specifications') || undefined,
    usps: parseShopifyUSPMetafield(getMetafieldObject('custom', 'usps')),
  };
}

/**
 * Extract color options from variant selected options
 */
function extractColorOptions(product: ShopifyProduct): string[] {
  const colors = new Set<string>();
  const variants = product.variants?.nodes || [];
  variants.forEach(variant => {
    if (!variant?.selectedOptions) return;
    const colorOption = variant.selectedOptions.find(
      opt => opt && (opt.name?.toLowerCase() === 'kleur' || opt.name?.toLowerCase() === 'color')
    );
    if (colorOption?.value) {
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
  const variants = product.variants?.nodes || [];
  variants.forEach(variant => {
    if (!variant?.selectedOptions) return;
    const sizeOption = variant.selectedOptions.find(
      opt => opt && (
        opt.name?.toLowerCase() === 'maat' || 
        opt.name?.toLowerCase() === 'size' ||
        opt.name?.toLowerCase() === 'afmeting'
      )
    );
    if (sizeOption?.value) {
      sizes.add(sizeOption.value);
    }
  });
  return Array.from(sizes);
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Map category slugs to product types for fallback queries
 */
const CATEGORY_TO_PRODUCT_TYPE: Record<CategorySlug, string> = {
  verandas: 'Veranda',
  sandwichpanelen: 'Sandwichpaneel',
  accessoires: 'Accessoires',
};

/**
 * Fetch products from a collection by category
 * Falls back to products query with productType filter if collection not found
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
      console.warn(`[Products] Collection not found: ${handle}, trying productType fallback`);
      // Fallback: query products by productType
      return await getProductsByType(category, options);
    }

    let products = data.collection.products.edges
      .map(edge => transformShopifyProduct(edge.node));

    // Filter out hidden_anchor products unless explicitly requested
    if (!options.includeHiddenAnchor) {
      products = products.filter(p => p.visibility !== 'hidden_anchor');
    }

    // Logging as requested
    console.log('[Shopify] fetched products count', products.length);
    console.log('[Shopify] first handles', products.slice(0, 10).map(p => p.id));

    if (import.meta.env.DEV) {
      console.log(`[Products] Collection ${handle}: ${products.length} products loaded`);
    }

    return {
      products,
      hasNextPage: data.collection.products.pageInfo.hasNextPage,
      endCursor: data.collection.products.pageInfo.endCursor,
    };
  } catch (error) {
    console.error(`[Products] Failed to fetch collection ${category}:`, error);
    // Try fallback on error as well
    try {
      console.warn(`[Products] Attempting productType fallback for ${category}`);
      return await getProductsByType(category, options);
    } catch (fallbackError) {
      console.error(`[Products] Fallback also failed:`, fallbackError);
      return { products: [], hasNextPage: false, endCursor: null };
    }
  }
}

/**
 * Fallback: Fetch products by productType when collection is not available
 */
async function getProductsByType(
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
  const productType = CATEGORY_TO_PRODUCT_TYPE[category];
  const { first = 50, after } = options;

  // Use Shopify search query syntax to filter by product_type
  const query = `product_type:${productType}`;

  if (import.meta.env.DEV) {
    console.log(`[Products] Fallback query: ${query}`);
  }

  const data = await shopifyFetch<ProductsResponse>(GET_PRODUCTS, {
    first,
    after,
    query,
  });

  let products = data.products.edges.map(edge => transformShopifyProduct(edge.node));

  // Filter out hidden_anchor products unless explicitly requested
  if (!options.includeHiddenAnchor) {
    products = products.filter(p => p.visibility !== 'hidden_anchor');
  }

  if (import.meta.env.DEV) {
    console.log(`[Products] Fallback loaded ${products.length} products for ${category}`);
  }

  return {
    products,
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
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

    if (import.meta.env.DEV && data.product.metafields === null) {
      console.warn('[USP] metafield custom.usps not accessible - check Storefront API permissions');
    }

    const product = transformShopifyProduct(data.product);

    // Log once per product fetch
    console.log('[USP] handle', product.handle ?? product.id, product.usps ?? []);
    
    // Logging as requested
    console.log('[PDP] product handle from Shopify', product.id);
    
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
