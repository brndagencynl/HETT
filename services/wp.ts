
import { NewsItem } from '../types';

const CACHE_KEY = 'hett_wp_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface WPCache {
    data: NewsItem[];
    timestamp: number;
}

interface WPPost {
    id: number;
    date: string;
    slug: string;
    link: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    _embedded?: {
        'wp:featuredmedia'?: Array<{ source_url: string }>;
        'wp:term'?: Array<Array<{ name: string; taxonomy: string }>>;
    };
    content?: { rendered: string };
}

export const getLatestPosts = async (): Promise<NewsItem[]> => {
    // Check in-memory/navigation cache first (simple implementation)
    // Note: Since this is a module, a top-level variable would persist slightly, 
    // but a proper global cache or reacting to mounting is better handled via state in components 
    // or a dedicated cache utility. For this requirements "in-memory caching", 
    // we'll use a module-level variable to cache across re-renders/navigations.

    const now = Date.now();
    if (globalCache && (now - globalCache.timestamp < CACHE_TTL)) {
        return globalCache.data;
    }

    const baseUrl = import.meta.env.VITE_WP_BASE_URL || 'https://hettveranda.nl';
    const endpoint = `${baseUrl}/wp-json/wp/v2/posts?per_page=6&_embed=1`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`WP Fetch Error: ${response.status}`);
        }
        const posts: WPPost[] = await response.json();

        const newsItems: NewsItem[] = posts.map(post => {
            // Decode title
            const title = decodeHtml(post.title.rendered);

            // Strip HTML from excerpt and limit length
            const rawExcerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '');
            const excerpt = rawExcerpt.length > 140
                ? rawExcerpt.substring(0, 140) + '...'
                : rawExcerpt;

            // Get Image
            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

            // Get Category
            const categories = post._embedded?.['wp:term']?.find(term => term.length > 0 && term[0].taxonomy === 'category');
            const category = categories?.[0]?.name || 'Nieuws';

            // Format Date (DD-MM-YYYY)
            const dateObj = new Date(post.date);
            const dateStr = dateObj.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

            // Calculate Reading Time
            // Use content if available, else excerpt. Fallback length.
            const textContent = (post.content?.rendered || post.excerpt.rendered).replace(/<[^>]+>/g, '');
            const wordCount = textContent.split(/\s+/).length;
            const readTimeMinutes = Math.ceil(wordCount / 200);
            const readTime = `${readTimeMinutes} min`;

            // Map mapping: "id = id", "slug = slug"
            // Note: BlogCarousel links to `/nieuws/${id}`. Content requirements say "Routing: ... Gebruik de slug".
            // Therefore, we treat the slug as the ID for the detailed view link, or we strictly follow "id=id" and change BlogCarousel.
            // Requirement 1 says "NIET de layout/markup/styling/DOM-structuur ... aanpassen". Logic adaptation is allowed.
            // If we pass `id: post.slug`, the link becomes `/nieuws/my-post-slug`. This satisfies the routing requirement.
            // However, "id = id" was also specified. 
            // We will store the original WP ID in the object but cast/hack the ID used for linking if strict types enforce string.
            // NewsItem.id is string. WP id is number.
            // So we MUST convert WP ID to string anyway.
            // If we use post.slug as the ID, we satisfy the routing requirement perfectly without changing BlogCarousel's link logic.
            // "Mapping ... id = id" might refer to data preservation, but "Routing ... Gebruik de slug" affects action.
            // I will prioritize the routing action for the view model passed to the Carousel.

            return {
                id: post.slug, // Using slug as ID for correct routing URL generation in standard BlogCarousel
                title,
                excerpt,
                content: post.content?.rendered || '', // Required by type, though unused in Carousel
                date: dateStr,
                author: 'HETT', // Default or fetch from _embedded if needed, prompt didn't specify author mapping
                category,
                imageUrl,
                readTime
            };
        });

        globalCache = {
            data: newsItems,
            timestamp: now
        };

        return newsItems;
    } catch (error) {
        console.error('Failed to fetch WP posts:', error);
        throw error;
    }
};

let globalCache: WPCache | null = null;

function decodeHtml(html: string) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
