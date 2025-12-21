import { ProductConfig } from '../types';

const STORAGE_KEY_PREFIX = 'hett_config_';

export const saveConfig = (slug: string, config: ProductConfig) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(config));
};

export const loadConfig = (slug: string): ProductConfig | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slug}`);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as ProductConfig;
    } catch (e) {
        console.error('Failed to parse config', e);
        return null;
    }
};

export const clearConfig = (slug: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slug}`);
};
