
import { Product } from '../types';

export const isConfigOnly = (product: Product): boolean => {
    // Manual override flag check
    if (product.requiresConfiguration) return true;

    // Categories that require configuration
    const configKeywords = [
        'overkapping',
        'veranda',
        'sandwich',
        'tuinkamer',
        'glazen schuifwand'
    ];

    const category = product.category.toLowerCase();

    return configKeywords.some(keyword => category.includes(keyword));
};
