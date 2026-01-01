/**
 * Content Mode Configuration
 * =============================================================================
 * Single source of truth for how non-product content is loaded.
 * 
 * CONTENT_MODE determines where homepage blocks (hero, FAQ, USPs, inspiration, 
 * footer columns) are sourced from:
 * 
 * - 'static': Use hardcoded frontend content (FALLBACK_* constants)
 *   Safe default, works without any Shopify metaobject scopes.
 * 
 * - 'shopify_metaobjects': Fetch from Shopify Metaobjects API
 *   Requires unauthenticated_read_metaobjects scope on Storefront token.
 *   Falls back to static content if scope is missing or fetch fails.
 * 
 * =============================================================================
 * HOW TO ENABLE SHOPIFY METAOBJECTS:
 * =============================================================================
 * 
 * 1. Go to Shopify Admin → Settings → Apps and sales channels → Develop apps
 * 2. Select your app (or create one)
 * 3. Click "Configure Storefront API scopes"
 * 4. Enable these scopes:
 *    ✓ unauthenticated_read_product_listings
 *    ✓ unauthenticated_read_product_inventory  
 *    ✓ unauthenticated_read_metaobjects        ← Required for content blocks
 *    ✓ unauthenticated_read_content            ← Required for pages
 *    ✓ unauthenticated_write_checkouts
 *    ✓ unauthenticated_read_checkouts
 * 5. Click "Save"
 * 6. Go to "API credentials" tab
 * 7. Click "Install app" (if not installed) or "Reinstall app"
 * 8. Copy the new Storefront API access token
 * 9. Update your .env file:
 *    VITE_SHOPIFY_STOREFRONT_TOKEN=<new_token>
 * 10. Restart dev server / redeploy
 * 11. Change CONTENT_MODE below to 'shopify_metaobjects'
 * 
 * =============================================================================
 */

export type ContentMode = 'static' | 'shopify_metaobjects';

/**
 * Current content mode setting.
 * 
 * Can also be controlled via environment variable:
 * VITE_CONTENT_MODE=static | shopify_metaobjects
 * 
 * Default: 'static' (safe, works without metaobject scopes)
 */
export const CONTENT_MODE: ContentMode = 
  (import.meta.env.VITE_CONTENT_MODE as ContentMode) || 'static';

/**
 * Check if metaobject content should be fetched
 */
export function useMetaobjects(): boolean {
  return CONTENT_MODE === 'shopify_metaobjects';
}

/**
 * Log content mode on initialization (DEV only)
 */
if (import.meta.env.DEV) {
  console.log('[ContentMode]', {
    mode: CONTENT_MODE,
    description: CONTENT_MODE === 'static' 
      ? 'Using static frontend content' 
      : 'Fetching from Shopify Metaobjects (with fallback)',
  });
}
