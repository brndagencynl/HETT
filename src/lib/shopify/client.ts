/**
 * Shopify Storefront API Client
 * Minimal GraphQL fetch wrapper for Shopify Storefront API
 */

// =============================================================================
// CONFIG
// =============================================================================

interface ShopifyConfig {
  domain: string;
  token: string;
  apiVersion: string;
  apiUrl: string;
  isValid: boolean;
}

/**
 * Get and validate Shopify configuration from environment variables
 * Logs debug info to help diagnose configuration issues (DEV only)
 */
export function getShopifyConfig(): ShopifyConfig {
  const domain = import.meta.env.VITE_SHOPIFY_DOMAIN || '';
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
  const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-10';

  const isValid = Boolean(domain && token);
  const apiUrl = domain ? `https://${domain}/api/${apiVersion}/graphql.json` : '';

  // Debug logging (DEV only)
  if (import.meta.env.DEV) {
    console.log('[Shopify Config]', {
      domain: domain || '(niet ingesteld)',
      tokenPresent: token ? `✓ (${token.length} chars)` : '✗ ontbreekt',
      apiVersion,
      apiUrl: apiUrl || '(niet beschikbaar)',
      isValid,
    });
  }

  if (!isValid) {
    if (!domain) {
      console.error('[Shopify] ❌ VITE_SHOPIFY_DOMAIN ontbreekt in environment variables');
    }
    if (!token) {
      console.error('[Shopify] ❌ VITE_SHOPIFY_STOREFRONT_TOKEN ontbreekt in environment variables');
    }
    console.error('[Shopify] Zorg dat .env bestand bestaat met:', 
      '\n  VITE_SHOPIFY_DOMAIN=hett-veranda.myshopify.com',
      '\n  VITE_SHOPIFY_STOREFRONT_TOKEN=xxx',
      '\n  VITE_SHOPIFY_API_VERSION=2024-10',
      '\n\nHerstart Vite dev server na aanpassen van .env'
    );
  }

  return { domain, token, apiVersion, apiUrl, isValid };
}

// Initialize config on module load
const CONFIG = getShopifyConfig();

// Legacy exports for backward compatibility
const SHOPIFY_DOMAIN = CONFIG.domain;
const STOREFRONT_TOKEN = CONFIG.token;
const API_VERSION = CONFIG.apiVersion;
const STOREFRONT_API_URL = CONFIG.apiUrl;

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
 * Returns true only if domain AND token are present
 */
export function isShopifyConfigured(): boolean {
  return CONFIG.isValid;
}

/**
 * Get the Shopify domain
 */
export function getShopifyDomain(): string {
  return CONFIG.domain;
}
