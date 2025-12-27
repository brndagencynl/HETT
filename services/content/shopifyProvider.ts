/**
 * Shopify Content Provider
 * Replaces WordPress with Shopify Storefront API + Metaobjects
 */

import { ContentProvider } from './provider';
import { Post } from '../../types';
import { getBlogArticles, BlogArticle } from '../shopify';

/**
 * Convert Shopify blog article to internal Post format
 */
function articleToPost(article: BlogArticle): Post {
  // Format date (DD-MM-YYYY)
  const dateObj = new Date(article.publishedAt);
  const dateStr = dateObj.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  // Calculate reading time (rough estimate: 200 words/min)
  const textContent = article.content.replace(/<[^>]+>/g, '');
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract excerpt or create from content
  let excerpt = article.excerpt;
  if (!excerpt) {
    const plainText = article.content.replace(/<[^>]+>/g, '');
    excerpt = plainText.length > 140 ? plainText.substring(0, 140) + '...' : plainText;
  }

  return {
    id: article.handle,
    slug: article.handle,
    title: article.title,
    excerpt,
    date: dateStr,
    category: 'Nieuws',
    image: article.image?.url || '',
    readingTime: `${readingTime} min`,
  };
}

export const shopifyProvider: ContentProvider = {
  /**
   * Fetch blog posts from Shopify
   */
  getPosts: async (limit = 6): Promise<Post[]> => {
    try {
      const articles = await getBlogArticles(limit);
      return articles.map(articleToPost);
    } catch (error) {
      console.error('Shopify provider error:', error);
      return [];
    }
  },
};
