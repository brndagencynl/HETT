import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Truck, ShieldCheck, PenTool, ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import VerandaConfigurator, { VerandaConfiguratorRef } from '../components/VerandaConfigurator';
import SandwichPanelBuilder from '../components/ui/sandwichpanel/SandwichPanelBuilder';
import ProductDetailContent from '../components/ui/ProductDetailContent';
import QuantitySelector from '../components/ui/QuantitySelector';
import { ProductConfig, Product } from '../types';
import { getProductByHandle } from '../src/lib/shopify';

type ProductDetailShopProps = {
    /** Pass a handle directly (for sandwichpanelen canonical route) */
    productHandle?: string;
};

const ProductDetailShop: React.FC<ProductDetailShopProps> = ({ productHandle }) => {
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

    // Fetch product from Shopify on mount / handle change
    useEffect(() => {
        async function fetchProduct() {
            if (!resolvedHandle) {
                setError('Geen product handle opgegeven');
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
                    setError('Product niet gevonden');
                    setLoading(false);
                    return;
                }

                if (import.meta.env.DEV) {
                    console.log('[ProductDetailShop] Product loaded:', shopifyProduct);
                }

                setProduct(shopifyProduct);
                
                // Set gallery images - use Shopify images array if available
                // The transformed product only has imageUrl (featured), so we use it as primary
                // In the future, we can extend transformShopifyProduct to include all images
                const images = shopifyProduct.imageUrl 
                    ? [shopifyProduct.imageUrl]
                    : ['/assets/images/placeholder.jpg'];
                setGalleryImages(images);
                setActiveImage(images[0]);
            } catch (err) {
                console.error('[ProductDetailShop] Error fetching product:', err);
                setError('Fout bij het laden van het product');
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
                    <p className="text-hett-muted font-bold">Product laden...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-black text-hett-text mb-4">Product niet gevonden</h2>
                    <p className="text-hett-muted mb-8">{error || 'Het opgevraagde product bestaat niet of is niet meer beschikbaar.'}</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft size={16} /> Terug naar shop
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
        // Add to cart - cart drawer opens automatically via CartContext
        // No redirect to /cart - user stays on PDP
        addToCart(product, payload.quantity, payload);
    };

    // Accessories Add
    const handleAccessoryAdd = () => {
        // Add to cart - cart drawer opens automatically via CartContext
        // No redirect to /cart - user stays on PDP
        addToCart(product, accessoryQuantity, {
            color: product.options?.colors?.[0] || 'Standaard'
        });
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
                onSubmit={handleVerandaSubmit}
            />

            <PageHeader title={product.title} subtitle={product.category} description={product.shortDescription} image={product.imageUrl} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

                <Link to={`/categorie/${product.category.toLowerCase()}`} className="inline-flex items-center text-hett-muted hover:text-hett-primary mb-8 text-sm font-bold">
                    <ArrowLeft size={16} className="mr-2" /> Terug naar {product.category}
                </Link>

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
                                <span className="flex items-center gap-1"><Truck size={14} className="text-green-600" /> Op voorraad</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-600" /> 10 Jaar garantie</span>
                            </div>

                            {product.category === 'sandwichpanelen' ? (
                                <SandwichPanelBuilder
                                    product={product}
                                    basePrice={product.price}
                                    onAddToCart={handleSandwichAddToCart}
                                />
                            ) : product.requiresConfiguration ? (
                                <>
                                    <h3 className="text-2xl font-black text-hett-text mb-4">Product configuratie</h3>
                                    <p className="text-hett-muted text-sm leading-relaxed mb-8">
                                        Stel uw overkapping volledig op maat samen in onze 3D configurator. Kies uw afmetingen, kleuren en accessoires.
                                    </p>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl font-black text-hett-text">€{product.price},-</span>
                                        <span className="text-hett-muted text-xs font-bold uppercase tracking-wider">Vanaf prijs</span>
                                    </div>

                                    <div className="space-y-3">
                                        <button onClick={handleOpenConfigurator} className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3">
                                            <PenTool size={20} />
                                            Stel samen
                                        </button>
                                        <button onClick={() => navigate('/offerte')} className="btn-outline w-full py-4 text-sm font-bold">
                                            Direct offerte aanvragen
                                        </button>
                                    </div>

                                    <div className="mt-8 bg-hett-light p-4 rounded-lg space-y-3">
                                        <div className="flex items-start gap-3 text-xs font-bold text-hett-text">
                                            <span className="text-hett-secondary flex-shrink-0">✓</span> Direct inzicht in de prijs
                                        </div>
                                        <div className="flex items-start gap-3 text-xs font-bold text-hett-text">
                                            <span className="text-hett-secondary flex-shrink-0">✓</span> Vrijblijvende offerte per mail
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-black text-hett-text mb-4">Bestellen</h3>
                                    <p className="text-hett-muted text-sm leading-relaxed mb-8">
                                        Bestel dit product direct uit onze voorraad. Snelle levering gegarandeerd.
                                    </p>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl font-black text-hett-text">€{product.price},-</span>
                                        <span className="text-hett-muted text-xs font-bold uppercase tracking-wider">Incl. BTW</span>
                                    </div>

                                    {product.category === 'accessoires' && (
                                        <div className="mb-3">
                                            <QuantitySelector value={accessoryQuantity} onChange={setAccessoryQuantity} />
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAccessoryAdd}
                                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCart size={20} /> In winkelwagen
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Standardized Content using ProductDetailContent */}
                <div className="mb-20">
                    <ProductDetailContent
                        uspItems={[
                            { icon: "shield", title: "Gratis 5 jaar garantie", subtitle: "Op constructie & systeem" },
                            { icon: "rail", title: "Unieke onderrail", subtitle: "Strak, stabiel en duurzaam" },
                            { icon: "truck", title: "Gratis levering", subtitle: "In Nederland & België" },
                            { icon: "tools", title: "Zelf eenvoudig monteren", subtitle: "Duidelijke handleiding inbegrepen" }
                        ]}
                        delivery={{
                            title: "Levering & montage",
                            text: "Wij leveren met eigen transport door de Benelux. Elk pakket is compleet en voorzien van een duidelijke montagehandleiding. Montage door ons team is optioneel (op aanvraag).",
                            leadTimeLabel: "Gemiddelde levertijd",
                            leadTimeValue: "10 werkdagen"
                        }}
                        description={{
                            title: `Over de ${product.title}`,
                            intro: product.description || product.shortDescription, // Fallback if no long desc
                            paragraphs: [
                                "Ontdek de perfecte combinatie van stijl en functionaliteit met onze hoogwaardige verandassystemen. Speciaal ontworpen om uw buitenleven te verrijken, ongeacht het seizoen.",
                                "Dankzij het gebruik van duurzame materialen en een slim ontwerp is montage eenvoudig en geniet u jarenlang van een onderhoudsvrij resultaat."
                            ]
                        }}
                        specs={Object.entries(product.specs).map(([label, value]) => ({
                            label: label,
                            value: Array.isArray(value) ? value.join(', ') : String(value)
                        }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductDetailShop;
