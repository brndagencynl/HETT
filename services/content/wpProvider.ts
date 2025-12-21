
import { ContentProvider } from './provider';
import { Post } from '../../types';

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

// Simple in-memory cache to avoid excessive requests during session
const cache: { data: Post[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const wpProvider: ContentProvider = {
    getPosts: async (limit = 6): Promise<Post[]> => {
        const now = Date.now();
        if (cache && now - cache.timestamp < CACHE_TTL) {
            return cache.data.slice(0, limit);
        }

        const baseUrl = import.meta.env.VITE_WP_API_BASE || 'https://hettveranda.nl';
        const endpoint = `${baseUrl}/wp-json/wp/v2/posts?_embed&per_page=${limit}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                console.error(`WP Fetch failed: ${response.status}`);
                return [];
            }

            const wpPosts: WPPost[] = await response.json();

            const posts: Post[] = wpPosts.map(post => {
                // Decode title
                const title = decodeHtml(post.title.rendered);

                // Strip HTML from excerpt and limit length
                const rawExcerpt = (post.excerpt.rendered || '').replace(/<[^>]+>/g, '');
                const excerpt = rawExcerpt.length > 140
                    ? rawExcerpt.substring(0, 140) + '...'
                    : rawExcerpt;

                // Get Image
                const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

                // Get Category
                const categories = post._embedded?.['wp:term']?.find(term => term.length > 0 && term[0].taxonomy === 'category');
                const category = categories?.[0]?.name || 'Nieuws';

                // Format Date (DD-MM-YYYY)
                const dateObj = new Date(post.date);
                const dateStr = dateObj.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

                // Calculate Reading Time (rough estimate)
                const textContent = (post.content?.rendered || post.excerpt.rendered || '').replace(/<[^>]+>/g, '');
                const wordCount = textContent.split(/\s+/).length;
                const readingTime = `${Math.ceil(Object.is(wordCount, NaN) ? 0 : wordCount / 200)} min`;

                return {
                    id: post.slug, // Using slug as ID for compatibility with previous implementation/routing
                    slug: post.slug,
                    title,
                    excerpt,
                    date: dateStr,
                    category,
                    image,
                    readingTime: readingTime === '0 min' ? '1 min' : readingTime
                };
            });

            return posts;

        } catch (error) {
            console.error('WP Provider Error:', error);
            return [];
        }
    }
};

function decodeHtml(html: string) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
