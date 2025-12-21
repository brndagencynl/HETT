import { ContentProvider } from './provider';
import { Post } from '../../types';
import { MOCK_POSTS } from '../../data/mockPosts';

export const mockProvider: ContentProvider = {
    getPosts: async (limit = 6): Promise<Post[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_POSTS.slice(0, limit);
    }
};
