/**
 * Shopify Customer Account URL Helpers
 * 
 * Provides URLs to redirect users to Shopify's hosted customer account pages.
 * This approach leverages Shopify's built-in authentication and account management.
 */

// Get the Shopify domain from environment and ensure proper URL format
function getShopifyBaseUrl(): string {
  const domain = import.meta.env.VITE_SHOPIFY_DOMAIN || '';
  
  if (!domain) {
    console.warn('[Account] VITE_SHOPIFY_DOMAIN is not configured');
    return '';
  }
  
  // Ensure https:// prefix and strip trailing slash
  let baseUrl = domain;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  console.log('[Account] Shopify base URL:', baseUrl);
  return baseUrl;
}

/**
 * Returns the URL to the Shopify customer account page.
 * Users can view orders, addresses, and account details here.
 */
export function getShopifyAccountUrl(): string {
  const baseUrl = getShopifyBaseUrl();
  const accountUrl = baseUrl ? `${baseUrl}/account` : '';
  console.log('[Account] account URL:', accountUrl);
  return accountUrl;
}

/**
 * Returns the URL to the Shopify customer login page.
 * Users are redirected here to authenticate.
 */
export function getShopifyLoginUrl(): string {
  const baseUrl = getShopifyBaseUrl();
  const loginUrl = baseUrl ? `${baseUrl}/account/login` : '';
  console.log('[Account] login URL:', loginUrl);
  return loginUrl;
}

/**
 * Returns the URL to the Shopify customer registration page.
 */
export function getShopifyRegisterUrl(): string {
  const baseUrl = getShopifyBaseUrl();
  return baseUrl ? `${baseUrl}/account/register` : '';
}

/**
 * Returns the URL to the Shopify order history page.
 */
export function getShopifyOrdersUrl(): string {
  const baseUrl = getShopifyBaseUrl();
  return baseUrl ? `${baseUrl}/account/orders` : '';
}
