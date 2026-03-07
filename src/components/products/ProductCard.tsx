import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../../types';
import DeliveryTime from '../ui/DeliveryTime';
import { useCart } from '../../../context/CartContext';
import QuantitySelector from '../../../components/ui/QuantitySelector';
import { formatEUR } from '../../utils/money';
import { isConfigOnly } from '../../../utils/productRules';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDeliveryTimeLabel(product: Product): string {
    const specs = product.specs || {};
    const keys = Object.keys(specs);
    const matchKey = keys.find(
        (k) =>
            k.toLowerCase().includes('levertijd') ||
            k.toLowerCase().includes('delivery') ||
            k.toLowerCase().includes('lead'),
    );
    if (matchKey) {
        const value = specs[matchKey];
        const text = Array.isArray(value) ? value.join(', ') : String(value);
        if (text.trim()) return text.trim();
    }
    return '1-2 weken';
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ProductCardProps {
    /** A full Product object — or a lightweight "preset" shape (homepage cards). */
    product: Product;

    /** Card layout variant: "listing" (default grid card) or "compact" (horizontal list row). */
    variant?: 'listing' | 'compact';

    /** Override the default navigation href. */
    href?: string;

    /** Callback for adding to cart (accessories only). */
    onAddToCart?: (qty: number) => Promise<void>;

    /** Callback for "Stel samen" (configurable products). */
    onConfigure?: () => void;

    /** Show delivery badge (default: true). */
    showDeliveryBadge?: boolean;

    /** Show product USPs (default: false — reserved for future use). */
    showUsps?: boolean;

    /** Show price (default: true). */
    showPrice?: boolean;

    /** Show quantity selector for accessories (default: true). */
    showQuantity?: boolean;

    /** Override the delivery time string. */
    deliveryLabel?: string;

    /** Override the CTA label. */
    ctaLabel?: string;

    /** Show "vanaf" suffix next to price — auto-detected for configurable products. */
    showFromSuffix?: boolean;

    /** Additional action overlay (e.g. Wishlist delete button). */
    actionSlot?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'listing',
    href,
    onAddToCart,
    onConfigure,
    showDeliveryBadge = true,
    showPrice = true,
    showQuantity = true,
    deliveryLabel,
    ctaLabel,
    showFromSuffix,
    actionSlot,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requiresConfig = isConfigOnly(product);
    const productHref = href || `/products/${product.id}`;
    const delivery = deliveryLabel || getDeliveryTimeLabel(product);
    const subtitle = (product.shortDescription || '').trim();
    const fromSuffix = showFromSuffix ?? requiresConfig;
    const isCompact = variant === 'compact';

    /* ---- Handlers ---- */

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (requiresConfig) {
            if (onConfigure) {
                onConfigure();
            } else {
                navigate(productHref);
            }
            return;
        }

        // Use custom onAddToCart if provided
        if (onAddToCart) {
            setIsAdding(true);
            setError(null);
            try {
                await onAddToCart(quantity);
            } catch {
                setError(t('shop.addToCartError'));
                setTimeout(() => setError(null), 3000);
            } finally {
                setIsAdding(false);
            }
            return;
        }

        if (!product.shopifyVariantId) {
            setError(t('shop.noVariantError'));
            setTimeout(() => setError(null), 3000);
            return;
        }

        setIsAdding(true);
        setError(null);
        try {
            addToCart(product, quantity, {
                color: product.options?.colors?.[0] || 'Standaard',
                size: product.options?.sizes?.[0] || 'Standaard',
            });
        } catch {
            setError(t('shop.addToCartError'));
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsAdding(false);
        }
    };

    const handleConfigure = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onConfigure) {
            onConfigure();
        } else {
            navigate(productHref);
        }
    };

    /* ---- Render ---- */

    return (
        <Link
            to={productHref}
            className={`ds-card ds-card--hover flex overflow-hidden group cursor-pointer transition-all ${
                isCompact ? 'flex-row' : 'flex-col'
            }`}
        >
            {/* Image */}
            <div
                className={`relative flex items-center justify-center overflow-hidden bg-[var(--surface)] ${
                    isCompact ? 'w-48 flex-shrink-0' : 'aspect-[4/3]'
                }`}
            >
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                />
                {actionSlot && (
                    <div className="absolute top-2 right-2 z-10">{actionSlot}</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Title + subtitle */}
                <div className="mb-2">
                    <h3 className="text-[var(--text)] font-bold text-sm sm:text-base leading-snug line-clamp-2">
                        {product.title}
                    </h3>
                    {subtitle && (
                        <p className="mt-1 text-[var(--muted)] text-xs leading-tight line-clamp-2">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Price */}
                {showPrice && (
                    <div className="mb-4">
                        <span className="text-[var(--text)] font-bold text-lg sm:text-xl leading-none">
                            {formatEUR(product.priceCents, 'cents')}
                        </span>
                        {fromSuffix && (
                            <span className="ml-1 text-[var(--muted)] text-xs font-normal">
                                {t('shop.from')}
                            </span>
                        )}
                    </div>
                )}

                {/* CTA area — pushed to bottom */}
                <div className="mt-auto">
                    {error && (
                        <div className="mb-2 p-2 border border-red-200 bg-red-50 rounded text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}

                    {requiresConfig ? (
                        <button
                            onClick={handleConfigure}
                            className="ds-btn ds-btn--primary w-full text-sm"
                        >
                            {ctaLabel || t('common.configure')}
                        </button>
                    ) : (
                        <div
                            className="flex items-stretch gap-2"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            {showQuantity && (
                                <div className="w-24 flex-shrink-0">
                                    <QuantitySelector value={quantity} onChange={setQuantity} />
                                </div>
                            )}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className={`ds-btn flex-1 text-sm ${
                                    isAdding
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'ds-btn--primary'
                                }`}
                            >
                                {isAdding
                                    ? t('shop.adding')
                                    : ctaLabel || t('shop.addToCart')}
                            </button>
                        </div>
                    )}

                    {/* Delivery line */}
                    {showDeliveryBadge && (
                        <div className="mt-2.5">
                            <DeliveryTime label={delivery} />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
