import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Heart, Settings, ShoppingCart, Truck } from 'lucide-react';
import { Product, CategorySlug } from '../../types';
import { useCart } from '../../context/CartContext';
import QuantitySelector from './QuantitySelector';
import { formatEUR, mulCents, toCents } from '../../src/utils/money';

function getDeliveryTimeLabel(product: Product): string {
    const specs = product.specs || {};
    const keys = Object.keys(specs);
    const matchKey = keys.find((k) => k.toLowerCase().includes('levertijd') || k.toLowerCase().includes('delivery') || k.toLowerCase().includes('lead'));
    if (matchKey) {
        const value = specs[matchKey];
        const text = Array.isArray(value) ? value.join(', ') : String(value);
        const trimmed = text.trim();
        if (trimmed) return trimmed;
    }

    // Fallback used elsewhere in the site.
    return '1-2 weken';
}

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
}

// Categories that require configuration before adding to cart
const CONFIG_REQUIRED_CATEGORIES: CategorySlug[] = ['verandas', 'sandwichpanelen'];

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine if this product requires configuration
    const requiresConfiguration = CONFIG_REQUIRED_CATEGORIES.includes(product.category);

    const mainTitle = product.title;
    const subtitleText = (product.shortDescription || '').trim();
    const deliveryTime = getDeliveryTimeLabel(product);
    const firstUSP = (product.usps ?? []).map((x) => (typeof x === 'string' ? x.trim() : '')).find(Boolean) || '';

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('[ProductCard] Toggle wishlist', product.id);
    };

    // Direct add to cart for accessoires only
    const handleAddToCart = (e: React.MouseEvent) => {
        // CRITICAL: Stop event propagation to prevent Link navigation
        e.stopPropagation();
        e.preventDefault();
        
        console.log('[ProductCard] handleAddToCart clicked', {
            productId: product.id,
            title: product.title,
            category: product.category,
            requiresConfiguration,
            shopifyVariantId: product.shopifyVariantId,
            quantity,
        });

        // Safety check: redirect to PDP if config required
        if (requiresConfiguration) {
            console.log('[ProductCard] Redirecting to PDP for configuration');
            navigate(`/products/${product.id}`);
            return;
        }

        // Check for variant ID before attempting add
        if (!product.shopifyVariantId) {
            const errorMsg = t('shop.noVariantError');
            console.error('[ProductCard] No variant ID:', product.id);
            setError(errorMsg);
            setTimeout(() => setError(null), 3000);
            return;
        }
        
        setIsAdding(true);
        setError(null);
        
        try {
            // Add accessoire directly to cart
            addToCart(product, quantity, {
                color: product.options?.colors?.[0] || 'Standaard',
                size: product.options?.sizes?.[0] || 'Standaard'
            });
            console.log('[ProductCard] addToCart called successfully');
        } catch (err) {
            console.error('[ProductCard] addToCart error:', err);
            setError(t('shop.addToCartError'));
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsAdding(false);
        }
    };

    // Navigate to product detail page for configuration
    const handleConfigureClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('[ProductCard] Configure click, navigating to:', `/products/${product.id}`);
        navigate(`/products/${product.id}`);
    };

    return (
        <Link
            to={`/products/${product.id}`}
            className={`bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-md transition-all flex flex-col group overflow-hidden cursor-pointer ${viewMode === 'list' ? 'md:flex-row' : ''}`}
        >
            {/* Action Bar (Wishlist) */}
            <div className={`px-2 py-1.5 flex justify-end ${viewMode === 'list' ? 'hidden' : 'absolute top-0 right-0 z-10 w-full'}`}>
                <button
                    onClick={handleWishlistClick}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 bg-white/80 backdrop-blur-sm rounded-bl-lg"
                    title={t('wishlist.add')}
                >
                    <Heart size={18} />
                </button>
            </div>

            {/* Image Section */}
            <div className={`relative flex items-center justify-center overflow-hidden bg-gray-50 ${viewMode === 'list' ? 'w-full md:w-64 p-4' : 'h-32 sm:h-64'}`}>
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
                {product.isBestseller && (
                    <div className="absolute top-2 left-2 bg-hett-secondary text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase z-10">
                        {t('common.popular')}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-2.5 sm:p-5 flex flex-col flex-grow relative bg-white">
                {/* List View Heart */}
                {viewMode === 'list' && (
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={handleWishlistClick}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                            <Heart size={18} />
                        </button>
                    </div>
                )}

                <div className="block mb-1 sm:mb-2">
                    <h3 className="text-hett-dark font-bold text-[13px] sm:text-base leading-tight group-hover:underline line-clamp-2 min-h-[2.4rem] sm:min-h-[3rem]">
                        {mainTitle}
                    </h3>
                    <div className="mt-0.5 sm:mt-1 space-y-0.5">
                        {subtitleText && (
                            <div className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight line-clamp-2">
                                {subtitleText}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-3 sm:mb-4">
                    <div className="text-base sm:text-2xl font-black text-hett-dark leading-none">
                        {requiresConfiguration ? (
                            <>{formatEUR(product.priceCents, 'cents')} <span className="text-xs font-medium text-gray-500">{t('shop.from')}</span></>
                        ) : (
                            <>{formatEUR(product.priceCents, 'cents')}</>
                        )}
                    </div>
                    {firstUSP && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">
                            <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                            <span className="line-clamp-1">{firstUSP}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    {/* Error message */}
                    {error && (
                        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}
                    
                    {requiresConfiguration ? (
                        <>
                            <button
                                onClick={handleConfigureClick}
                                className="w-full rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-colors bg-hett-dark text-white hover:bg-hett-primary"
                            >
                                <Settings size={16} />
                                {t('common.configure')}
                            </button>
                            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-green-600 font-medium leading-tight">
                                <Truck size={14} className="flex-shrink-0" />
                                <span>{deliveryTime}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                className="flex flex-row items-stretch gap-2"
                                onMouseDown={(e) => {
                                    // Don't let the parent Link start navigation.
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    // Prevent Link navigation when interacting with the CTA row.
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <div className="w-28 flex-shrink-0">
                                    <QuantitySelector value={quantity} onChange={setQuantity} />
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className={`flex-1 rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-colors ${
                                        isAdding 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-hett-primary text-white hover:bg-hett-dark'
                                    }`}
                                >
                                    <ShoppingCart size={16} />
                                    {isAdding ? t('shop.adding') : t('shop.addToCart')}
                                </button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-green-600 font-medium leading-tight">
                                <Truck size={14} className="flex-shrink-0" />
                                <span>{deliveryTime}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
