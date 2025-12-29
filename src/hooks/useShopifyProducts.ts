/**
 * React hooks for fetching Shopify products
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCollectionProducts,
  getAllCollectionProducts,
  getProductByHandle,
  searchProducts,
  isShopifyConfigured,
} from '../lib/shopify';
import type { Product, CategorySlug } from '../../types';

// =============================================================================
// COLLECTION PRODUCTS HOOK
// =============================================================================

interface UseCollectionProductsOptions {
  pageSize?: number;
  includeHiddenAnchor?: boolean;
}

interface UseCollectionProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCollectionProducts(
  category: CategorySlug,
  options: UseCollectionProductsOptions = {}
): UseCollectionProductsReturn {
  const { pageSize = 20, includeHiddenAnchor = false } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchProducts = useCallback(async (append = false) => {
    if (!isShopifyConfigured()) {
      setError('Shopify not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getCollectionProducts(category, {
        first: pageSize,
        after: append ? cursor || undefined : undefined,
        includeHiddenAnchor,
      });

      if (append) {
        setProducts(prev => [...prev, ...result.products]);
      } else {
        setProducts(result.products);
      }

      setHasMore(result.hasNextPage);
      setCursor(result.endCursor);
    } catch (err) {
      console.error('[useCollectionProducts] Fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [category, pageSize, includeHiddenAnchor, cursor]);

  // Initial load
  useEffect(() => {
    setProducts([]);
    setCursor(null);
    fetchProducts(false);
  }, [category, pageSize, includeHiddenAnchor]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchProducts(true);
    }
  }, [hasMore, isLoading, fetchProducts]);

  const refresh = useCallback(async () => {
    setCursor(null);
    await fetchProducts(false);
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

// =============================================================================
// ALL COLLECTION PRODUCTS HOOK (loads all at once)
// =============================================================================

export function useAllCollectionProducts(
  category: CategorySlug,
  options: { includeHiddenAnchor?: boolean } = {}
): {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProducts = useCallback(async () => {
    if (!isShopifyConfigured()) {
      setError('Shopify not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const allProducts = await getAllCollectionProducts(category, options);
      setProducts(allProducts);
    } catch (err) {
      console.error('[useAllCollectionProducts] Fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [category, options.includeHiddenAnchor]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return {
    products,
    isLoading,
    error,
    refresh: fetchAllProducts,
  };
}

// =============================================================================
// SINGLE PRODUCT HOOK
// =============================================================================

export function useProduct(handle: string | null): {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
} {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(!!handle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    if (!isShopifyConfigured()) {
      setError('Shopify not configured');
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchedProduct = await getProductByHandle(handle);
        setProduct(fetchedProduct);
        
        if (!fetchedProduct) {
          setError('Product not found');
        }
      } catch (err) {
        console.error('[useProduct] Fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  return { product, isLoading, error };
}

// =============================================================================
// PRODUCT SEARCH HOOK
// =============================================================================

export function useProductSearch(query: string): {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
} {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setHasMore(false);
      setCursor(null);
      return;
    }

    if (!isShopifyConfigured()) {
      setError('Shopify not configured');
      return;
    }

    const search = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await searchProducts(query, { first: 20 });
        setProducts(result.products);
        setHasMore(result.hasNextPage);
        setCursor(result.endCursor);
      } catch (err) {
        console.error('[useProductSearch] Search failed:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !cursor) return;

    try {
      setIsLoading(true);
      const result = await searchProducts(query, { first: 20, after: cursor });
      setProducts(prev => [...prev, ...result.products]);
      setHasMore(result.hasNextPage);
      setCursor(result.endCursor);
    } catch (err) {
      console.error('[useProductSearch] Load more failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, cursor, hasMore, isLoading]);

  return {
    products,
    isLoading,
    error,
    hasMore,
    loadMore,
  };
}

// =============================================================================
// MULTIPLE CATEGORIES HOOK
// =============================================================================

export function useMultiCategoryProducts(
  categories: CategorySlug[],
  options: { includeHiddenAnchor?: boolean } = {}
): {
  productsByCategory: Record<CategorySlug, Product[]>;
  allProducts: Product[];
  isLoading: boolean;
  error: string | null;
} {
  const [productsByCategory, setProductsByCategory] = useState<Record<CategorySlug, Product[]>>({
    verandas: [],
    sandwichpanelen: [],
    accessoires: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isShopifyConfigured()) {
      setError('Shopify not configured');
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const results = await Promise.all(
          categories.map(async (cat) => ({
            category: cat,
            products: await getAllCollectionProducts(cat, options),
          }))
        );

        const byCategory: Record<CategorySlug, Product[]> = {
          verandas: [],
          sandwichpanelen: [],
          accessoires: [],
        };

        results.forEach(({ category, products }) => {
          byCategory[category] = products;
        });

        setProductsByCategory(byCategory);
      } catch (err) {
        console.error('[useMultiCategoryProducts] Fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [categories.join(','), options.includeHiddenAnchor]);

  const allProducts = Object.values(productsByCategory).flat();

  return {
    productsByCategory,
    allProducts,
    isLoading,
    error,
  };
}
