import { Post } from '../../types';

export interface ContentProvider {
    getPosts(limit?: number): Promise<Post[]>;
}
