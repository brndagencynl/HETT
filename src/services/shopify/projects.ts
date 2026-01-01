/**
 * Shopify Projects Service
 * Fetches project articles from Shopify Blog: "projecten"
 * 
 * Requires Storefront scope: unauthenticated_read_content
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ProjectImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ShopifyProject {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  image: ProjectImage | null;
}

export interface ProjectsPageResult {
  projects: ShopifyProject[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

/**
 * Simplified project card for Home inspiration section
 */
export interface ProjectCard {
  id: string;
  handle: string;
  title: string;
  imageUrl: string;
  alt?: string;
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

const BLOG_HANDLE = 'projecten';
const PLACEHOLDER_IMAGE = '/assets/images/project-placeholder.jpg';

/**
 * Extract first image URL from HTML content
 */
function extractFirstImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

// =============================================================================
// GRAPHQL QUERIES
// =============================================================================

const PROJECTS_LIST_QUERY = `
  query ProjectsList($first: Int!, $after: String) {
    blog(handle: "${BLOG_HANDLE}") {
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          excerpt
          contentHtml
          publishedAt
          tags
          image {
            url
            altText
            width
            height
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const PROJECT_BY_HANDLE_QUERY = `
  query ProjectByHandle($handle: String!) {
    blog(handle: "${BLOG_HANDLE}") {
      articleByHandle(handle: $handle) {
        id
        handle
        title
        excerpt
        contentHtml
        publishedAt
        tags
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

// =============================================================================
// CACHE
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
 * Clear projects cache
 */
export function clearProjectsCache(): void {
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.startsWith('projects:')) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
  
  if (import.meta.env.DEV) {
    console.log('[Projects] Cache cleared');
  }
}

// =============================================================================
// GRAPHQL CLIENT
// =============================================================================

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!STOREFRONT_API_URL || !STOREFRONT_TOKEN) {
    console.error('[Projects] Shopify not configured');
    throw new Error('Shopify not configured');
  }

  if (import.meta.env.DEV) {
    console.log('[Projects] Fetching from Shopify...', { variables });
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
    console.error('[Projects] API error:', response.status, response.statusText);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const json = await response.json();
  
  if (json.errors) {
    console.error('[Projects] GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data;
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

interface RawArticle {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string;
  tags: string[];
  image?: ProjectImage;
}

function transformArticle(article: RawArticle): ShopifyProject {
  // Debug log for image fields
  if (import.meta.env.DEV) {
    console.log('[Projects][Home] article', article.handle, 'image', article.image);
  }

  return {
    id: article.id,
    handle: article.handle,
    title: article.title,
    excerpt: article.excerpt || '',
    contentHtml: article.contentHtml || '',
    publishedAt: article.publishedAt,
    tags: article.tags || [],
    image: article.image || null,
  };
}

/**
 * Transform ShopifyProject to simplified ProjectCard for Home section
 * Uses image priority: image.url > contentHtml img > placeholder
 */
export function projectToCard(project: ShopifyProject): ProjectCard {
  let imageUrl = PLACEHOLDER_IMAGE;

  // Priority 1: article.image
  if (project.image?.url) {
    imageUrl = project.image.url;
  }
  // Priority 2: first image from contentHtml
  else if (project.contentHtml) {
    const htmlImage = extractFirstImageFromHtml(project.contentHtml);
    if (htmlImage) {
      imageUrl = htmlImage;
    }
  }

  if (import.meta.env.DEV) {
    console.log('[Projects][Card] project', project.handle, 'resolved imageUrl:', imageUrl);
  }

  return {
    id: project.id,
    handle: project.handle,
    title: project.title,
    imageUrl,
    alt: project.image?.altText || project.title,
  };
}

/**
 * Get latest projects as simplified cards for Home inspiration section
 */
export async function getLatestProjectCards(limit = 6): Promise<ProjectCard[]> {
  const projects = await getLatestProjects(limit);
  return projects.map(projectToCard);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fetch latest projects
 * @param limit - Number of projects to fetch (default: 6)
 */
export async function getLatestProjects(limit = 6): Promise<ShopifyProject[]> {
  const cacheKey = `projects:latest:${limit}`;
  const cached = getCached<ShopifyProject[]>(cacheKey);
  
  if (cached) {
    if (import.meta.env.DEV) {
      console.log('[Projects] Returning cached latest projects');
    }
    return cached;
  }

  try {
    interface ProjectsResponse {
      blog: {
        articles: {
          nodes: RawArticle[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        };
      } | null;
    }

    const data = await shopifyFetch<ProjectsResponse>(PROJECTS_LIST_QUERY, { 
      first: limit,
      after: null,
    });

    if (!data.blog?.articles?.nodes) {
      if (import.meta.env.DEV) {
        console.log('[Projects] No blog or articles found');
      }
      return [];
    }

    const projects = data.blog.articles.nodes.map(transformArticle);
    
    if (import.meta.env.DEV) {
      console.log(`[Projects] Loaded ${projects.length} projects from Shopify`);
    }

    setCache(cacheKey, projects);
    return projects;
  } catch (error) {
    console.error('[Projects] Failed to fetch latest projects:', error);
    return [];
  }
}

/**
 * Fetch projects with pagination
 * @param limit - Number of projects per page (default: 12)
 * @param cursor - Pagination cursor for next page
 */
export async function getProjectsPage(limit = 12, cursor?: string): Promise<ProjectsPageResult> {
  const cacheKey = `projects:page:${limit}:${cursor || 'first'}`;
  const cached = getCached<ProjectsPageResult>(cacheKey);
  
  if (cached) {
    if (import.meta.env.DEV) {
      console.log('[Projects] Returning cached projects page');
    }
    return cached;
  }

  try {
    interface ProjectsResponse {
      blog: {
        articles: {
          nodes: RawArticle[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        };
      } | null;
    }

    const data = await shopifyFetch<ProjectsResponse>(PROJECTS_LIST_QUERY, { 
      first: limit,
      after: cursor || null,
    });

    if (!data.blog?.articles) {
      if (import.meta.env.DEV) {
        console.log('[Projects] No blog found');
      }
      return {
        projects: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    const result: ProjectsPageResult = {
      projects: data.blog.articles.nodes.map(transformArticle),
      pageInfo: data.blog.articles.pageInfo,
    };

    if (import.meta.env.DEV) {
      console.log(`[Projects] Loaded page with ${result.projects.length} projects`);
    }

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[Projects] Failed to fetch projects page:', error);
    return {
      projects: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch single project by handle
 * @param handle - Article handle (URL slug)
 */
export async function getProjectByHandle(handle: string): Promise<ShopifyProject | null> {
  const cacheKey = `projects:single:${handle}`;
  const cached = getCached<ShopifyProject>(cacheKey);
  
  if (cached) {
    if (import.meta.env.DEV) {
      console.log(`[Projects] Returning cached project: ${handle}`);
    }
    return cached;
  }

  try {
    interface ProjectResponse {
      blog: {
        articleByHandle: RawArticle | null;
      } | null;
    }

    const data = await shopifyFetch<ProjectResponse>(PROJECT_BY_HANDLE_QUERY, { handle });

    if (!data.blog?.articleByHandle) {
      if (import.meta.env.DEV) {
        console.log(`[Projects] Project not found: ${handle}`);
      }
      return null;
    }

    const project = transformArticle(data.blog.articleByHandle);
    
    if (import.meta.env.DEV) {
      console.log(`[Projects] Loaded project: ${project.title}`);
    }

    setCache(cacheKey, project);
    return project;
  } catch (error) {
    console.error(`[Projects] Failed to fetch project "${handle}":`, error);
    return null;
  }
}

/**
 * Get placeholder image URL for projects without images
 */
export function getProjectPlaceholder(): string {
  return PLACEHOLDER_IMAGE;
}
