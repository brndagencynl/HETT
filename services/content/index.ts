
import { mockProvider } from './mockProvider';
import { wpProvider } from './wpProvider';
import { ContentProvider } from './provider';

const providerName = import.meta.env.VITE_CONTENT_PROVIDER || 'mock';

export const content: ContentProvider = providerName === 'wp' ? wpProvider : mockProvider;
