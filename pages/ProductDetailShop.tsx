import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Truck, ShieldCheck, PenTool, ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import VerandaConfigurator, { VerandaConfiguratorRef } from '../components/VerandaConfigurator';
import SandwichPanelBuilder from '../components/ui/sandwichpanel/SandwichPanelBuilder';
import ProductDetailContent from '../components/ui/ProductDetailContent';
import QuantitySelector from '../components/ui/QuantitySelector';
import ProductUSPs from '../src/components/ui/ProductUSPs';
import { ProductConfig, Product } from '../types';
import { getProductByHandle } from '../src/lib/shopify';
import { formatEUR } from '../src/utils/money';
import { parseSpecifications } from '../src/utils/parseSpecifications';
import { extractWidthFromHandle } from '../src/services/addons/led';

type ProductDetailShopProps = {
    /** Pass a handle directly (for sandwichpanelen canonical route) */
    productHandle?: string;
};

const ProductDetailShop: React.FC<ProductDetailShopProps> = ({ productHandle }) => {
    const { t } = useTranslation();
    const { handle } = useParams<{ handle: string }>();
    const resolvedHandle = productHandle ?? handle;
    const configuratorRef = useRef<VerandaConfiguratorRef>(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Shopify product state
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Gallery images from Shopify
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [activeImage, setActiveImage] = useState('');
    const [accessoryQuantity, setAccessoryQuantity] = useState(1);

    // Accessories Add with validation (hooks must be called before any conditional returns!)
    const [accessoryError, setAccessoryError] = useState<string | null>(null);
    const [isAddingAccessory, setIsAddingAccessory] = useState(false);

    // Fetch product from Shopify on mount / handle change
    useEffect(() => {
        async function fetchProduct() {
            // Logging as requested
            console.log('[PDP] handle param', resolvedHandle);
            
            if (!resolvedHandle) {
                setError(t('shop.noHandleError'));
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            if (import.meta.env.DEV) {
                console.log('[ProductDetailShop] Fetching product:', resolvedHandle);
            }

            try {
                const shopifyProduct = await getProductByHandle(resolvedHandle);
                
                if (!shopifyProduct) {
                    setError(t('shop.productNotFound'));
                    setLoading(false);
                    return;
                }

                // Always log price info for debugging
                console.log('[ProductDetailShop] Product pricing:', {
                    handle: shopifyProduct.handle,
                    price: shopifyProduct.price,
                    priceCents: shopifyProduct.priceCents,
                    shopifyVariantId: shopifyProduct.shopifyVariantId,
                    source: 'Shopify variant',
                });

                if (import.meta.env.DEV) {
                    console.log('[ProductDetailShop] Product loaded:', shopifyProduct);
                }

                setProduct(shopifyProduct);
                
                // Set gallery images - use Shopify images array if available
                // The transformed product only has imageUrl (featured), so we use it as primary
                // In the future, we can extend transformShopifyProduct to include all images
                const images = shopifyProduct.imageUrl 
                    ? [shopifyProduct.imageUrl]
                    : ['/assets/images/placeholder.webp'];
                setGalleryImages(images);
                setActiveImage(images[0]);
            } catch (err) {
                console.error('[ProductDetailShop] Error fetching product:', err);
                setError(t('shop.productLoadError'));
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [resolvedHandle]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-hett-secondary mx-auto mb-4" />
                    <p className="text-hett-muted font-bold">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-black text-hett-text mb-4">{t('shop.productNotFound')}</h2>
                    <p className="text-hett-muted mb-8">{error || t('shop.productNotFound')}</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft size={16} /> {t('shop.backToOverview')}
                    </Link>
                </div>
            </div>
        );
    }

    const handleOpenConfigurator = () => {
        // Always start fresh with defaults - no persisted config
        configuratorRef.current?.open();
    };

    // Callback from Veranda Configurator (Modal)
    // Note: Configurator closes itself after calling onSubmit
    // Cart drawer opens automatically via CartContext.addToCart
    const handleVerandaSubmit = (config: any, mode: 'order' | 'quote', price: number, details: any[], priceBreakdown: any) => {
        const productConfig: ProductConfig = { category: 'verandas', data: config };

        if (mode === 'order') {
            const payload = {
                price: price,
                config: productConfig,
                configuration: config, // legacy
                details: details,
                priceBreakdown: priceBreakdown,
                isConfigured: true
            };
            // Add to cart - cart drawer will open automatically via CartContext
            // No redirect to /cart - user stays on PDP
            addToCart(product, 1, payload);
            // Configurator is closed by the wizard component itself
        } else {
            // Quote flow: redirect to quote page
            navigate('/offerte', { state: config });
        }
    };

    // Callback from Sandwich Builder - no persistence, just pass to cart
    const handleSandwichAddToCart = (payload: any) => {
        console.log('[ProductDetailShop] Sandwich add to cart:', payload);
        addToCart(product, payload.quantity, payload);
    };

    // Accessories Add with validation
    const handleAccessoryAdd = () => {
        console.log('[ProductDetailShop] handleAccessoryAdd clicked', {
            productId: product.id,
            title: product.title,
            shopifyVariantId: product.shopifyVariantId,
            quantity: accessoryQuantity,
        });

        // Validate variant ID
        if (!product.shopifyVariantId) {
            const errorMsg = t('shop.noVariantError');
            console.error('[ProductDetailShop] No variant ID:', product.id);
            setAccessoryError(errorMsg);
            setTimeout(() => setAccessoryError(null), 4000);
            return;
        }

        setIsAddingAccessory(true);
        setAccessoryError(null);

        try {
            addToCart(product, accessoryQuantity, {
                color: product.options?.colors?.[0] || 'Standaard'
            });
            console.log('[ProductDetailShop] addToCart called successfully');
        } catch (err) {
            console.error('[ProductDetailShop] addToCart error:', err);
            setAccessoryError(t('shop.addToCartError'));
            setTimeout(() => setAccessoryError(null), 4000);
        } finally {
            setIsAddingAccessory(false);
        }
    };

    // Navigate gallery
    const handlePrevImage = () => {
        if (galleryImages.length <= 1) return;
        const currentIndex = galleryImages.indexOf(activeImage);
        const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
        setActiveImage(galleryImages[prevIndex]);
    };

    const handleNextImage = () => {
        if (galleryImages.length <= 1) return;
        const currentIndex = galleryImages.indexOf(activeImage);
        const nextIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
        setActiveImage(galleryImages[nextIndex]);
    };

    return (
        <div className="min-h-screen bg-white">
            <VerandaConfigurator
                ref={configuratorRef}
                productTitle={product.title}
                basePrice={product.price}
                widthCm={extractWidthFromHandle(product.handle || resolvedHandle || product.id || '') || 606}
                onSubmit={handleVerandaSubmit}
            />

            <PageHeader title={product.title} subtitle={product.category} description={product.shortDescription} image={product.imageUrl} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 mb-20">

                    {/* Gallery Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/3] bg-hett-light rounded-lg overflow-hidden shadow-soft">
                            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />

                            {galleryImages.length > 1 && (
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                    <button onClick={handlePrevImage} className="btn-icon pointer-events-auto shadow-lg"><ChevronLeft size={24} /></button>
                                    <button onClick={handleNextImage} className="btn-icon pointer-events-auto shadow-lg"><ChevronRight size={24} /></button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {galleryImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(img)}
                                    className={`aspect-square bg-hett-light rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-hett-secondary scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="Detail" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Config & Buy Card */}
                    <div className="lg:col-span-5">
                        <div className="card sticky top-32">
                            <div className="flex items-center gap-4 text-xs font-bold text-hett-muted mb-6 pb-6 border-b border-hett-muted/10">
                                <span className="flex items-center gap-1"><Truck size={14} className="text-green-600" /> {t('common.inStock')}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-600" /> {t('warranty.tenYear')}</span>
                            </div>

                            {product.category === 'sandwichpanelen' ? (
                                <SandwichPanelBuilder
                                    product={product}
                                    basePrice={product.price}
                                    onAddToCart={handleSandwichAddToCart}
                                />
                            ) : product.requiresConfiguration ? (
                                <>
                                    <h3 className="text-2xl font-black text-hett-text mb-4">{product.title}</h3>
                                    <p className="text-hett-muted text-sm leading-relaxed mb-8">
                                        {product.shortDescription || product.description || t('shop.configureDescription')}
                                    </p>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl font-black text-hett-text">{formatEUR(product.priceCents, 'cents')}</span>
                                        <span className="text-hett-muted text-xs font-bold uppercase tracking-wider">{t('shop.from')}</span>
                                    </div>

                                    <ProductUSPs items={product.usps ?? []} />

                                    <div className="space-y-3">
                                        <button onClick={handleOpenConfigurator} className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3">
                                            <PenTool size={20} />
                                            {t('common.configure')}
                                        </button>
                                    </div>

                                    <div className="mt-8 bg-hett-light p-4 rounded-lg space-y-3">
                                        <div className="flex items-start gap-3 text-xs font-bold text-hett-text">
                                            <span className="text-hett-secondary flex-shrink-0">✓</span> {t('shop.usp.priceInsight')}
                                        </div>
                                        <div className="flex items-start gap-3 text-xs font-bold text-hett-text">
                                            <span className="text-hett-secondary flex-shrink-0">✓</span> {t('shop.usp.freeShippingNL')}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-black text-hett-text mb-4">{product.title}</h3>
                                    <p className="text-hett-muted text-sm leading-relaxed mb-8">
                                        {product.shortDescription}
                                    </p>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl font-black text-hett-text">{formatEUR(product.priceCents, 'cents')}</span>
                                        <span className="text-hett-muted text-xs font-bold uppercase tracking-wider">{t('common.inclVat')}</span>
                                    </div>

                                    <ProductUSPs items={product.usps ?? []} />

                                    {/* Error message */}
                                    {accessoryError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                                            {accessoryError}
                                        </div>
                                    )}

                                    <div className="flex flex-row items-stretch gap-3">
                                        {product.category === 'accessoires' && (
                                            <div className="w-32 flex-shrink-0">
                                                <QuantitySelector value={accessoryQuantity} onChange={setAccessoryQuantity} className="w-full h-full rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-stretch" />
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAccessoryAdd}
                                            disabled={isAddingAccessory}
                                            className={`flex-1 py-4 text-lg flex items-center justify-center gap-3 rounded-lg font-bold transition-colors ${
                                                isAddingAccessory
                                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                                    : 'btn-primary'
                                            }`}
                                        >
                                            <ShoppingCart size={20} /> 
                                            {isAddingAccessory ? t('shop.adding') : t('shop.addToCart')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Standardized Content using ProductDetailContent */}
                <div className="mb-20">
                    <ProductDetailContent
                        uspItems={[
                            { icon: "shield", title: t('productDetail.usp.freeWarranty'), subtitle: t('productDetail.usp.freeWarrantySubtitle') },
                            { icon: "rail", title: t('productDetail.usp.uniqueRail'), subtitle: t('productDetail.usp.uniqueRailSubtitle') },
                            { icon: "truck", title: t('productDetail.usp.freeDelivery'), subtitle: t('productDetail.usp.freeDeliverySubtitle') },
                            { icon: "tools", title: t('productDetail.usp.easyAssembly'), subtitle: t('productDetail.usp.easyAssemblySubtitle') }
                        ]}
                        delivery={{
                            title: t('productDetail.delivery.title'),
                            text: t('productDetail.delivery.text'),
                            leadTimeLabel: t('productDetail.delivery.leadTimeLabel'),
                            leadTimeValue: t('productDetail.delivery.leadTimeValue')
                        }}
                        description={{
                            title: t('productDetail.aboutProduct', { title: product.title }),
                            intro: product.description || product.shortDescription,
                            // Use extra description from Shopify metafield if available
                            extraDescriptionHtml: product.extraDescription || undefined
                        }}
                        specs={(() => {
                            // First try parsed specifications from Shopify metafield
                            const shopifySpecs = parseSpecifications(product.specificationsRaw);
                            if (shopifySpecs.length > 0) {
                                return shopifySpecs;
                            }
                            // Fallback to legacy specs object
                            const legacySpecs = Object.entries(product.specs || {}).map(([label, value]) => ({
                                label: label,
                                value: Array.isArray(value) ? value.join(', ') : String(value)
                            }));
                            // If still empty, return empty array (component will show fallback)
                            return legacySpecs;
                        })()}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductDetailShop;
