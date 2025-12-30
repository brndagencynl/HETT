/**
 * Shopify Storefront API Client
 * Minimal GraphQL fetch wrapper for Shopify Storefront API
 */

// =============================================================================
// CONFIG
// =============================================================================

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-10';

const STOREFRONT_API_URL = SHOPIFY_DOMAIN
  ? `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`
  : '';

// =============================================================================
// ERROR TYPES
// =============================================================================

export class ShopifyError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ShopifyError';
  }
}

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Execute a GraphQL query against the Shopify Storefront API
 * @param query - GraphQL query string
 * @param variables - Optional variables for the query
 * @returns Typed response data
 * @throws ShopifyError on API errors
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!STOREFRONT_API_URL || !STOREFRONT_TOKEN) {
    console.warn(
      '[Shopify] Not configured. Set VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN.'
    );
    throw new ShopifyError('Shopify not configured', 'NOT_CONFIGURED');
  }

  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new ShopifyError(
        `Shopify API error: ${response.status} ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      const firstError = json.errors[0];
      console.error('[Shopify] GraphQL errors:', json.errors);
      throw new ShopifyError(
        firstError.message || 'GraphQL error',
        firstError.extensions?.code || 'GRAPHQL_ERROR'
      );
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    console.error('[Shopify] Fetch error:', error);
    throw new ShopifyError(
      error instanceof Error ? error.message : 'Unknown error',
      'FETCH_ERROR'
    );
  }
}

/**
 * Check if Shopify is configured
 */
export function isShopifyConfigured(): boolean {
  return Boolean(STOREFRONT_API_URL && STOREFRONT_TOKEN);
}

/**
 * Get the Shopify domain
 */
export function getShopifyDomain(): string {
  return SHOPIFY_DOMAIN;
}
