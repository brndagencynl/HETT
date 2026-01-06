/**
 * Shopify Storefront API Service
 * Single source of truth for commerce + content via Metaobjects and Blog
 * 
 * =============================================================================
 * SHOPIFY STOREFRONT API SCOPES REQUIRED:
 * =============================================================================
 * 
 * For PRODUCTS (always needed):
 *   - unauthenticated_read_product_listings
 *   - unauthenticated_read_product_inventory
 * 
 * For METAOBJECTS (content blocks - optional):
 *   - unauthenticated_read_metaobjects
 * 
 * For PAGES & BLOG:
 *   - unauthenticated_read_content
 * 
 * For CART/CHECKOUT:
 *   - unauthenticated_write_checkouts
 *   - unauthenticated_read_checkouts
 * 
 * See config/contentMode.ts for instructions on enabling metaobjects.
 * =============================================================================
 */

import { CONTENT_MODE, isMetaobjectsEnabled } from '../config/contentMode';

// =============================================================================
// TYPES
// =============================================================================

export interface ShopifyImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ShopifyLink {
  label: string;
  url: string;
}

// Homepage Hero
export interface HomepageHero {
  title: string;
  subtitle: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  image: ShopifyImage;
}

// Homepage USPs (4 items)
export interface HomepageUsp {
  iconName: string;
  title: string;
  text: string;
}

// FAQ Item
export interface FaqItem {
  question: string;
  answer: string;
}

// Inspiration Card
export interface InspirationCard {
  image: ShopifyImage;
  title: string;
  subtitle: string;
  url: string;
}

// Footer Column
export interface FooterColumn {
  title: string;
  links: ShopifyLink[];
}

// Blog Article
export interface BlogArticle {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  image: ShopifyImage | null;
  author?: string;
}

// Generic Page
export interface ShopifyPage {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
}

// =============================================================================
// CONFIG
// =============================================================================

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || '';
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-10';

const STOREFRONT_API_URL = SHOPIFY_DOMAIN
  ? `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`
  : '';

// Debug logging bij module load (DEV only)
if (import.meta.env.DEV) {
  console.log('[Shopify services/shopify.ts Config]', {
    domain: SHOPIFY_DOMAIN || '(niet ingesteld)',
    tokenPresent: STOREFRONT_TOKEN ? `✓ (${STOREFRONT_TOKEN.length} chars)` : '✗ ontbreekt',
    apiVersion: API_VERSION,
    apiUrl: STOREFRONT_API_URL || '(niet beschikbaar)',
    contentMode: CONTENT_MODE,
  });
}

// =============================================================================
// SIMPLE IN-MEMORY CACHE
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear cache (useful for development)
 */
export function clearShopifyCache(): void {
  cache.clear();
  if (import.meta.env.DEV) {
    console.log('[Shopify] Cache cleared');
  }
}

// =============================================================================
// GRAPHQL CLIENT
// =============================================================================

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!STOREFRONT_API_URL || !STOREFRONT_TOKEN) {
    console.error('[Shopify] Niet geconfigureerd. Controleer .env bestand met:',
      '\n  VITE_SHOPIFY_DOMAIN=hett-veranda.myshopify.com',
      '\n  VITE_SHOPIFY_STOREFRONT_TOKEN=xxx'
    );
    throw new Error('Shopify not configured');
  }

  const response = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const json = await response.json();
  
  if (json.errors) {
    console.error('Shopify GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data;
}

// =============================================================================
// METAOBJECT QUERIES
// =============================================================================

const HOMEPAGE_HERO_QUERY = `
  query HomepageHero {
    metaobject(handle: { type: "homepage_hero", handle: "main" }) {
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

const HOMEPAGE_USPS_QUERY = `
  query HomepageUsps {
    metaobjects(type: "homepage_usp", first: 4) {
      nodes {
        fields {
          key
          value
        }
      }
    }
  }
`;

const HOMEPAGE_FAQ_QUERY = `
  query HomepageFaq {
    metaobjects(type: "homepage_faq", first: 20) {
      nodes {
        fields {
          key
          value
        }
      }
    }
  }
`;

const HOMEPAGE_INSPIRATION_QUERY = `
  query HomepageInspiration {
    metaobjects(type: "homepage_inspiration", first: 10) {
      nodes {
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

const FOOTER_COLUMNS_QUERY = `
  query FooterColumns {
    metaobjects(type: "footer_column", first: 10, sortKey: "display_name") {
      nodes {
        fields {
          key
          value
        }
      }
    }
  }
`;

const BLOG_ARTICLES_QUERY = `
  query BlogArticles($first: Int!) {
    blog(handle: "nieuws") {
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          excerpt
          content
          publishedAt
          authorV2 {
            name
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

const BLOG_ARTICLE_BY_HANDLE_QUERY = `
  query BlogArticleByHandle($handle: String!) {
    blog(handle: "nieuws") {
      articleByHandle(handle: $handle) {
        id
        handle
        title
        excerpt
        content
        publishedAt
        authorV2 {
          name
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const PAGE_BY_HANDLE_QUERY = `
  query PageByHandle($handle: String!) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
    }
  }
`;

// =============================================================================
// FETCH FUNCTIONS - CONTENT BLOCKS (with CONTENT_MODE support)
// =============================================================================

/**
 * Safely fetch metaobject data with fallback
 * Returns fallback if:
 * - CONTENT_MODE is 'static'
 * - Fetch fails (access denied, missing data, network error)
 */
async function safeMetaobjectFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T | null>,
  fallback: T,
  label: string
): Promise<T> {
  // If static mode, skip fetch entirely
  if (!isMetaobjectsEnabled()) {
    if (import.meta.env.DEV) {
      console.log(`[Shopify Metaobjects] ${label}: Using static content (CONTENT_MODE=static)`);
    }
    return fallback;
  }

  // Check cache first
  const cached = getCached<T>(cacheKey);
  if (cached !== null) {
    if (import.meta.env.DEV) {
      console.log(`[Shopify Metaobjects] ${label}: Returning cached data`);
    }
    return cached;
  }

  // Try fetching from Shopify
  try {
    const data = await fetcher();
    
    if (data === null) {
      if (import.meta.env.DEV) {
        console.log(`[Shopify Metaobjects] ${label}: No data returned -> fallback to static`);
      }
      return fallback;
    }

    // Cache successful result
    setCache(cacheKey, data);
    
    if (import.meta.env.DEV) {
      console.log(`[Shopify Metaobjects] ${label}: Loaded from Shopify`);
    }
    return data;
  } catch (error) {
    // Check for access denied error
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isAccessDenied = errorMsg.toLowerCase().includes('access denied') || 
                           errorMsg.toLowerCase().includes('unauthenticated_read_metaobjects');
    
    if (import.meta.env.DEV) {
      if (isAccessDenied) {
        console.warn(`[Shopify Metaobjects] ${label}: Access denied (scope missing) -> fallback to static`);
        console.warn('  → Enable unauthenticated_read_metaobjects scope in Shopify Admin');
        console.warn('  → See config/contentMode.ts for instructions');
      } else {
        console.warn(`[Shopify Metaobjects] ${label}: Fetch failed -> fallback to static`, error);
      }
    }
    return fallback;
  }
}

/**
 * Internal fetcher for homepage hero from metaobjects
 */
async function fetchHeroFromMetaobjects(): Promise<HomepageHero | null> {
  interface HeroResponse {
    metaobject: {
      fields: Array<{
        key: string;
        value: string;
        reference?: {
          image?: ShopifyImage;
        };
      }>;
    } | null;
  }
  
  const data = await shopifyFetch<HeroResponse>(HOMEPAGE_HERO_QUERY);
  
  if (!data.metaobject) return null;

  const fields = data.metaobject.fields;
  const getField = (key: string) => fields.find(f => f?.key === key);

  return {
    title: getField('title')?.value || '',
    subtitle: getField('subtitle')?.value || '',
    description: getField('description')?.value || '',
    primaryCtaLabel: getField('primary_cta_label')?.value || '',
    primaryCtaUrl: getField('primary_cta_url')?.value || '',
    secondaryCtaLabel: getField('secondary_cta_label')?.value || '',
    secondaryCtaUrl: getField('secondary_cta_url')?.value || '',
    image: getField('image')?.reference?.image || { url: '' },
  };
}

/**
 * Fetch homepage hero content
 * Uses CONTENT_MODE to determine source
 */
export async function getHomepageHero(): Promise<HomepageHero> {
  return safeMetaobjectFetch(
    'metaobject:homepage_hero',
    fetchHeroFromMetaobjects,
    FALLBACK_HERO,
    'getHomepageHero'
  );
}

/**
 * Internal fetcher for USPs from metaobjects
 */
async function fetchUspsFromMetaobjects(): Promise<HomepageUsp[] | null> {
  interface UspsResponse {
    metaobjects: {
      nodes: Array<{
        fields: Array<{ key: string; value: string }>;
      }>;
    };
  }

  const data = await shopifyFetch<UspsResponse>(HOMEPAGE_USPS_QUERY);
  
  if (!data.metaobjects?.nodes?.length) return null;

  return data.metaobjects.nodes.map(node => {
    const getField = (key: string) => node.fields?.find(f => f?.key === key)?.value || '';
    return {
      iconName: getField('icon_name'),
      title: getField('title'),
      text: getField('text'),
    };
  });
}

/**
 * Fetch homepage USPs
 * Uses CONTENT_MODE to determine source
 */
export async function getHomepageUsps(): Promise<HomepageUsp[]> {
  return safeMetaobjectFetch(
    'metaobject:homepage_usps',
    fetchUspsFromMetaobjects,
    FALLBACK_USPS,
    'getHomepageUsps'
  );
}

/**
 * Internal fetcher for FAQ from metaobjects
 */
async function fetchFaqFromMetaobjects(): Promise<FaqItem[] | null> {
  interface FaqResponse {
    metaobjects: {
      nodes: Array<{
        fields: Array<{ key: string; value: string }>;
      }>;
    };
  }

  const data = await shopifyFetch<FaqResponse>(HOMEPAGE_FAQ_QUERY);
  
  if (!data.metaobjects?.nodes?.length) return null;

  return data.metaobjects.nodes.map(node => {
    const getField = (key: string) => node.fields?.find(f => f?.key === key)?.value || '';
    return {
      question: getField('question'),
      answer: getField('answer'),
    };
  });
}

/**
 * Fetch homepage FAQ items
 * Uses CONTENT_MODE to determine source
 */
export async function getHomepageFaq(): Promise<FaqItem[]> {
  return safeMetaobjectFetch(
    'metaobject:homepage_faq',
    fetchFaqFromMetaobjects,
    FALLBACK_FAQ,
    'getHomepageFaq'
  );
}

/**
 * Internal fetcher for inspiration cards from metaobjects
 */
async function fetchInspirationFromMetaobjects(): Promise<InspirationCard[] | null> {
  interface InspirationResponse {
    metaobjects: {
      nodes: Array<{
        fields: Array<{
          key: string;
          value: string;
          reference?: { image?: ShopifyImage };
        }>;
      }>;
    };
  }

  const data = await shopifyFetch<InspirationResponse>(HOMEPAGE_INSPIRATION_QUERY);
  
  if (!data.metaobjects?.nodes?.length) return null;

  return data.metaobjects.nodes.map(node => {
    const getField = (key: string) => node.fields?.find(f => f?.key === key);
    return {
      image: getField('image')?.reference?.image || { url: '' },
      title: getField('title')?.value || '',
      subtitle: getField('subtitle')?.value || '',
      url: getField('url')?.value || '',
    };
  });
}

/**
 * Fetch homepage inspiration cards
 * Uses CONTENT_MODE to determine source
 */
export async function getHomepageInspiration(): Promise<InspirationCard[]> {
  return safeMetaobjectFetch(
    'metaobject:homepage_inspiration',
    fetchInspirationFromMetaobjects,
    FALLBACK_INSPIRATION,
    'getHomepageInspiration'
  );
}

/**
 * Internal fetcher for footer columns from metaobjects
 */
async function fetchFooterFromMetaobjects(): Promise<FooterColumn[] | null> {
  interface FooterResponse {
    metaobjects: {
      nodes: Array<{
        fields: Array<{ key: string; value: string }>;
      }>;
    };
  }

  const data = await shopifyFetch<FooterResponse>(FOOTER_COLUMNS_QUERY);
  
  if (!data.metaobjects?.nodes?.length) return null;

  return data.metaobjects.nodes.map(node => {
    const getField = (key: string) => node.fields?.find(f => f?.key === key)?.value || '';
    const linksJson = getField('links');
    
    let links: ShopifyLink[] = [];
    try {
      links = JSON.parse(linksJson) as ShopifyLink[];
    } catch {
      // If not JSON, try line-separated format: "Label|URL"
      links = linksJson.split('\n').filter(Boolean).map(line => {
        const [label, url] = line.split('|');
        return { label: label?.trim() || '', url: url?.trim() || '' };
      });
    }

    return {
      title: getField('title'),
      links,
    };
  });
}

/**
 * Fetch footer columns
 * Uses CONTENT_MODE to determine source
 */
export async function getFooterColumns(): Promise<FooterColumn[]> {
  return safeMetaobjectFetch(
    'metaobject:footer_columns',
    fetchFooterFromMetaobjects,
    FALLBACK_FOOTER_COLUMNS,
    'getFooterColumns'
  );
}

// =============================================================================
// FETCH FUNCTIONS - BLOG (always tries Shopify, falls back gracefully)
// =============================================================================

/**
 * Fetch blog articles
 */
export async function getBlogArticles(first = 6): Promise<BlogArticle[]> {
  // Check cache
  const cacheKey = `blog:articles:${first}`;
  const cached = getCached<BlogArticle[]>(cacheKey);
  if (cached) return cached;

  try {
    interface BlogResponse {
      blog: {
        articles: {
          nodes: Array<{
            id: string;
            handle: string;
            title: string;
            excerpt: string;
            content: string;
            publishedAt: string;
            authorV2?: { name: string };
            image?: ShopifyImage;
          }>;
        };
      } | null;
    }

    const data = await shopifyFetch<BlogResponse>(BLOG_ARTICLES_QUERY, { first });

    if (!data.blog?.articles?.nodes) return [];

    const articles = data.blog.articles.nodes.map(article => ({
      id: article.id,
      handle: article.handle,
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      publishedAt: article.publishedAt,
      image: article.image || null,
      author: article.authorV2?.name,
    }));

    setCache(cacheKey, articles);
    return articles;
  } catch (error) {
    console.error('Failed to fetch blog articles:', error);
    return [];
  }
}

/**
 * Fetch single blog article by handle
 */
export async function getBlogArticleByHandle(handle: string): Promise<BlogArticle | null> {
  try {
    interface ArticleResponse {
      blog: {
        articleByHandle: {
          id: string;
          handle: string;
          title: string;
          excerpt: string;
          content: string;
          publishedAt: string;
          authorV2?: { name: string };
          image?: ShopifyImage;
        } | null;
      } | null;
    }

    const data = await shopifyFetch<ArticleResponse>(BLOG_ARTICLE_BY_HANDLE_QUERY, { handle });

    if (!data.blog?.articleByHandle) return null;

    const article = data.blog.articleByHandle;
    return {
      id: article.id,
      handle: article.handle,
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      publishedAt: article.publishedAt,
      image: article.image || null,
      author: article.authorV2?.name,
    };
  } catch (error) {
    console.error('Failed to fetch blog article:', error);
    return null;
  }
}

/**
 * Fetch page by handle
 */
export async function getPageByHandle(handle: string): Promise<ShopifyPage | null> {
  try {
    interface PageResponse {
      page: {
        id: string;
        handle: string;
        title: string;
        body: string;
        bodySummary: string;
      } | null;
    }

    const data = await shopifyFetch<PageResponse>(PAGE_BY_HANDLE_QUERY, { handle });

    if (!data.page) return null;

    return {
      id: data.page.id,
      handle: data.page.handle,
      title: data.page.title,
      body: data.page.body,
      bodySummary: data.page.bodySummary,
    };
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return null;
  }
}

// =============================================================================
// FALLBACK DATA (used when Shopify is not configured)
// =============================================================================

export const FALLBACK_HERO: HomepageHero = {
  title: 'Veranda\'s vanaf € 1.350,00',
  subtitle: 'HETT Veranda\'s',
  description: 'De beste en voordeligste in de markt voor de doe-het-zelver!',
  primaryCtaLabel: 'Stel zelf samen',
  primaryCtaUrl: '/categorie/overkappingen',
  secondaryCtaLabel: '',
  secondaryCtaUrl: '',
  image: { url: '/assets/images/hero_veranda.png' },
};

export const FALLBACK_USPS: HomepageUsp[] = [
  { iconName: 'Wrench', title: 'Zelf te monteren', text: 'Eenvoudig zelf te monteren' },
  { iconName: 'Truck', title: 'Snelle levering', text: 'Binnen 10 werkdagen geleverd' },
  { iconName: 'Package', title: 'Gratis bezorging', text: 'Gratis thuisbezorgd' },
  { iconName: 'Award', title: 'Duitse kwaliteit', text: 'Duitse Precisie & Vakmanschap' },
];

export const FALLBACK_FAQ: FaqItem[] = [
  {
    question: 'Kan ik een veranda volledig op maat samenstellen?',
    answer: 'Ja. Met onze configurator stelt u eenvoudig uw veranda samen op basis van afmetingen, kleuren, daktype en opties zoals zijwanden en verlichting. Afwijkende maten zijn mogelijk via maatwerk.',
  },
  {
    question: 'Wat is de levertijd van een veranda of sandwichpaneel?',
    answer: 'De gemiddelde levertijd bedraagt 5–10 werkdagen. Bij maatwerk of specifieke uitvoeringen kan de levertijd iets afwijken. U ziet dit altijd duidelijk bij het product.',
  },
  {
    question: 'Leveren jullie ook in België en Duitsland?',
    answer: 'Ja. Wij leveren in Nederland, België en Duitsland. Levering binnen Nederland is gratis. Voor België en Duitsland worden de bezorgkosten berekend op basis van afstand.',
  },
  {
    question: 'Kan ik de producten zelf monteren?',
    answer: 'Ja. Onze producten zijn ontworpen voor eenvoudige montage door doe-het-zelvers. U ontvangt een duidelijke montagehandleiding. Montage door ons team is optioneel op aanvraag.',
  },
  {
    question: 'Kan ik de producten ook bekijken in een showroom?',
    answer: 'Ja. In onze showroom kunt u verschillende veranda\'s, sandwichpanelen en afwerkingen bekijken. Zo krijgt u een goed beeld van materialen, kleuren en mogelijkheden.',
  },
];

export const FALLBACK_INSPIRATION: InspirationCard[] = [
  {
    image: { url: '/assets/images/inspiration1.jpg' },
    title: 'Moderne Veranda',
    subtitle: 'Strak design met aluminium',
    url: '/projecten/moderne-veranda',
  },
  {
    image: { url: '/assets/images/inspiration2.jpg' },
    title: 'Klassieke Overkapping',
    subtitle: 'Tijdloos en elegant',
    url: '/projecten/klassieke-overkapping',
  },
];

export const FALLBACK_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Producten',
    links: [
      { label: "Veranda's", url: '/categorie/verandas' },
      { label: 'Sandwichpanelen', url: '/products/sandwichpaneel' },
      { label: 'Accessoires', url: '/categorie/accessoires' },
      { label: 'Maatwerk Veranda', url: '/maatwerk-configurator' },
    ],
  },
  {
    title: 'Over HETT',
    links: [
      { label: 'Over ons', url: '/over-ons' },
      { label: 'Showroom', url: '/showroom' },
      { label: 'Projecten', url: '/projecten' },
      { label: 'Blog', url: '/blog' },
    ],
  },
  {
    title: 'Service',
    links: [
      { label: 'Veelgestelde vragen', url: '/veelgestelde-vragen' },
      { label: 'Bezorging', url: '/bezorging' },
      { label: 'Montage', url: '/montage-handleiding' },
      { label: 'Garantie', url: '/garantie-en-klachten' },
    ],
  },
];
