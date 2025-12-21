
import { Product } from '../types';

export const isConfigOnly = (product: Product): boolean => {
    // Strict check based on configuration requirement or category
    if (product.requiresConfiguration) return true;

    // Fallback based on strict categories
    return ['verandas', 'sandwichpanelen'].includes(product.category);
};
