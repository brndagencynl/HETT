/**
 * Shopify Storefront API Service
 * Single source of truth for commerce + content via Metaobjects and Blog
 */

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

const STOREFRONT_API_URL = SHOPIFY_DOMAIN
  ? `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`
  : '';

// =============================================================================
// GRAPHQL CLIENT
// =============================================================================

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!STOREFRONT_API_URL || !STOREFRONT_TOKEN) {
    console.warn('Shopify not configured. Set VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN.');
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
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch homepage hero content from metaobject
 */
export async function getHomepageHero(): Promise<HomepageHero | null> {
  try {
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
    const getField = (key: string) => fields.find(f => f.key === key);

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
  } catch (error) {
    console.error('Failed to fetch homepage hero:', error);
    return null;
  }
}

/**
 * Fetch homepage USPs from metaobjects (exactly 4)
 */
export async function getHomepageUsps(): Promise<HomepageUsp[]> {
  try {
    interface UspsResponse {
      metaobjects: {
        nodes: Array<{
          fields: Array<{ key: string; value: string }>;
        }>;
      };
    }

    const data = await shopifyFetch<UspsResponse>(HOMEPAGE_USPS_QUERY);

    return data.metaobjects.nodes.map(node => {
      const getField = (key: string) => node.fields.find(f => f.key === key)?.value || '';
      return {
        iconName: getField('icon_name'),
        title: getField('title'),
        text: getField('text'),
      };
    });
  } catch (error) {
    console.error('Failed to fetch homepage USPs:', error);
    return [];
  }
}

/**
 * Fetch homepage FAQ items from metaobjects
 */
export async function getHomepageFaq(): Promise<FaqItem[]> {
  try {
    interface FaqResponse {
      metaobjects: {
        nodes: Array<{
          fields: Array<{ key: string; value: string }>;
        }>;
      };
    }

    const data = await shopifyFetch<FaqResponse>(HOMEPAGE_FAQ_QUERY);

    return data.metaobjects.nodes.map(node => {
      const getField = (key: string) => node.fields.find(f => f.key === key)?.value || '';
      return {
        question: getField('question'),
        answer: getField('answer'),
      };
    });
  } catch (error) {
    console.error('Failed to fetch homepage FAQ:', error);
    return [];
  }
}

/**
 * Fetch homepage inspiration cards from metaobjects
 */
export async function getHomepageInspiration(): Promise<InspirationCard[]> {
  try {
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

    return data.metaobjects.nodes.map(node => {
      const getField = (key: string) => node.fields.find(f => f.key === key);
      return {
        image: getField('image')?.reference?.image || { url: '' },
        title: getField('title')?.value || '',
        subtitle: getField('subtitle')?.value || '',
        url: getField('url')?.value || '',
      };
    });
  } catch (error) {
    console.error('Failed to fetch homepage inspiration:', error);
    return [];
  }
}

/**
 * Fetch footer columns from metaobjects
 */
export async function getFooterColumns(): Promise<FooterColumn[]> {
  try {
    interface FooterResponse {
      metaobjects: {
        nodes: Array<{
          fields: Array<{ key: string; value: string }>;
        }>;
      };
    }

    const data = await shopifyFetch<FooterResponse>(FOOTER_COLUMNS_QUERY);

    return data.metaobjects.nodes.map(node => {
      const getField = (key: string) => node.fields.find(f => f.key === key)?.value || '';
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
  } catch (error) {
    console.error('Failed to fetch footer columns:', error);
    return [];
  }
}

/**
 * Fetch blog articles
 */
export async function getBlogArticles(first = 6): Promise<BlogArticle[]> {
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

    if (!data.blog) return [];

    return data.blog.articles.nodes.map(article => ({
      id: article.id,
      handle: article.handle,
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      publishedAt: article.publishedAt,
      image: article.image || null,
      author: article.authorV2?.name,
    }));
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
  title: 'Veranda\'s vanaf €1350',
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
    question: 'Hoe lang duurt de levering?',
    answer: 'Standaard leveren wij binnen 10 werkdagen na bestelling. Voor maatwerk kan dit iets langer duren.',
  },
  {
    question: 'Kan ik de veranda zelf monteren?',
    answer: 'Ja! Al onze veranda\'s zijn ontworpen voor doe-het-zelvers. We leveren een complete montagehandleiding mee.',
  },
  {
    question: 'Wat is de garantie?',
    answer: 'Wij bieden 10 jaar garantie op constructie en 5 jaar op dakbedekking.',
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
      { label: 'Sandwichpanelen', url: '/categorie/sandwichpanelen' },
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
