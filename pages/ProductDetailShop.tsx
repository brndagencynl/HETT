
import React, { useState, useRef, MouseEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { Check, Truck, ShieldCheck, PenTool, ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import VerandaConfigurator, { VerandaConfiguratorRef } from '../components/VerandaConfigurator';
import SandwichPanelBuilder from '../components/ui/sandwichpanel/SandwichPanelBuilder';
import ProductDetailContent, { ProductDetailContentProps } from '../components/ui/ProductDetailContent';
import { ShoppingCart } from 'lucide-react'; // Ensure no unused imports, but Keep necessary ones


const ProductDetailShop: React.FC = () => {
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === id);
    const configuratorRef = useRef<VerandaConfiguratorRef>(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [activeImage, setActiveImage] = useState(product?.imageUrl || '');

    if (!product) return <div className="pt-40 text-center">Product niet gevonden</div>;

    const handleOpenConfigurator = () => configuratorRef.current?.open({ profileColor: 'Antraciet (RAL7016)' });

    const handleConfigSubmit = (config: any, mode: 'order' | 'quote', price: number, details: any[]) => {
        if (mode === 'order') {
            addToCart(product, 1, {
                size: `${config.widthCm}x${config.depthCm}cm`,
                color: config.profileColor,
                roof: config.roofType,
                configuration: config,
                price: price || product.price,
                details: details
            });
            navigate('/cart');
        } else {
            navigate('/offerte', { state: config });
        }
        configuratorRef.current?.close();
    };

    const galleryImages = [product.imageUrl, "https://picsum.photos/1200/900?random=10", "https://picsum.photos/1200/900?random=11"];

    return (
        <div className="min-h-screen bg-white">
            <VerandaConfigurator ref={configuratorRef} productTitle={product.title} basePrice={product.price} onSubmit={handleConfigSubmit} />

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

                            {/* Square Slider Nav Buttons (from Tokens) */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                <button className="btn-icon pointer-events-auto shadow-lg"><ChevronLeft size={24} /></button>
                                <button className="btn-icon pointer-events-auto shadow-lg"><ChevronRight size={24} /></button>
                            </div>
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
                                <SandwichPanelBuilder product={product} basePrice={product.price} />
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
                                            <PenTool size={20} /> Configureer nu
                                        </button>
                                        <button onClick={() => navigate('/offerte')} className="btn-outline w-full py-4 text-sm font-bold">
                                            Direct offerte aanvragen
                                        </button>
                                    </div>

                                    <div className="mt-8 bg-hett-light p-4 rounded-lg space-y-3">
                                        <div className="flex items-start gap-3 text-xs font-bold text-hett-text">
                                            <Check size={16} className="text-hett-secondary flex-shrink-0" strokeWidth={3} /> Direct inzicht in de prijs
                                        </div>
                                        <div className="flex items-start gap-3 text-xs font-bold text-hett-text">
                                            <Check size={16} className="text-hett-secondary flex-shrink-0" strokeWidth={3} /> Vrijblijvende offerte per mail
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

                                    <button
                                        onClick={() => {
                                            addToCart(product, 1, {
                                                color: product.options?.colors?.[0] || 'Standaard'
                                            });
                                            navigate('/cart');
                                        }}
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
