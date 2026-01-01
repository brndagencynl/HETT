import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, FileText, Download, ArrowLeft, Box, Image as ImageIcon, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import Panel3D from '../components/Panel3D';
import { getProductByHandle } from '../src/lib/shopify';
import { Product } from '../types';
import ProductDetailContent from '../components/ui/ProductDetailContent';

const ProductDetail: React.FC = () => {
    const { handle } = useParams<{ handle: string }>();
    
    // Shopify product state
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<'image' | '3d'>('image');

    // Fetch product from Shopify
    useEffect(() => {
        const fetchProduct = async () => {
            if (!handle) {
                setError('Geen product handle opgegeven');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const shopifyProduct = await getProductByHandle(handle);
                
                if (!shopifyProduct) {
                    setError('Product niet gevonden');
                    setLoading(false);
                    return;
                }

                setProduct(shopifyProduct);
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError('Fout bij het laden van het product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [handle]);

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
                    <h2 className="text-2xl font-black text-hett-dark mb-4">Product niet gevonden</h2>
                    <p className="text-hett-muted mb-8">{error || 'Het opgevraagde product bestaat niet of is niet meer beschikbaar.'}</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft size={16} /> Terug naar shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-24 pb-20">

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <Link to="/producten" className="text-gray-500 hover:text-hett-dark flex items-center gap-1 text-sm mb-4">
                    <ArrowLeft size={16} /> Terug naar overzicht
                </Link>
                <h1 className="text-4xl font-bold text-hett-dark">{product.title}</h1>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

                    {/* Left Column: Images & 3D */}
                    <div>
                        <div className="relative h-[400px] w-full rounded-[24px] overflow-hidden shadow-lg mb-4 bg-gray-100 border border-gray-100">

                            {/* 3D Toggle Button */}
                            <div className="absolute top-4 right-4 z-20 flex bg-white/90 backdrop-blur rounded-full p-1 shadow-md border border-gray-100">
                                <button
                                    onClick={() => setViewMode('image')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'image'
                                        ? 'bg-hett-dark text-white shadow-sm'
                                        : 'text-gray-500 hover:text-hett-dark'
                                        }`}
                                >
                                    <ImageIcon size={16} /> Foto
                                </button>
                                <button
                                    onClick={() => setViewMode('3d')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === '3d'
                                        ? 'bg-hett-brown text-white shadow-sm'
                                        : 'text-gray-500 hover:text-hett-dark'
                                        }`}
                                >
                                    <Box size={16} /> 3D Model
                                </button>
                            </div>

                            {viewMode === 'image' ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Panel3D />
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <img
                                src="https://picsum.photos/400/300?random=30"
                                className="rounded-xl cursor-pointer hover:opacity-80 transition-opacity border border-gray-100"
                                alt="Detail 1"
                                onClick={() => setViewMode('image')}
                            />
                            <img
                                src="https://picsum.photos/400/300?random=31"
                                className="rounded-xl cursor-pointer hover:opacity-80 transition-opacity border border-gray-100"
                                alt="Detail 2"
                                onClick={() => setViewMode('image')}
                            />
                            <div
                                onClick={() => setViewMode('3d')}
                                className="rounded-xl cursor-pointer bg-hett-light border border-hett-brown/20 flex flex-col items-center justify-center text-hett-brown hover:bg-hett-brown hover:text-white transition-all group"
                            >
                                <Box size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase">Bekijk in 3D</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: CTA / Summary (Simplifying for standardization) */}
                    <div className="flex flex-col justify-center">
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            {product.shortDescription}
                        </p>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-black text-hett-dark">€{product.price},-</span>
                                <span className="text-sm text-gray-500 font-bold uppercase">Incl. BTW</span>
                            </div>
                            <Link to="/contact" className="block w-full text-center bg-hett-dark text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-900/10">
                                Offerte Aanvragen
                            </Link>
                            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-gray-500">
                                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-600" /> 5 Jaar Garantie</span>
                                <span className="flex items-center gap-1"><Truck size={14} className="text-green-600" /> Gratis bezorgd</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Standardized Content Section (Full Width below) */}
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
                        title: "Beschrijving",
                        intro: product.description || product.shortDescription,
                        paragraphs: [
                            "Dit product is ontworpen met oog voor detail en kwaliteit. Het duurzame materiaalgebruik garandeert een lange levensduur en minimale onderhoudskosten.",
                            "Dankzij de modulaire opbouw is het systeem eenvoudig aan te passen aan uw specifieke situatie."
                        ]
                    }}
                    specs={Object.entries(product.specs).map(([label, value]) => ({
                        label: label,
                        value: Array.isArray(value) ? value.join(', ') : String(value)
                    }))}
                />

                <div className="h-20"></div> {/* Spacer */}

            </div>
        </div>
    );
};

export default ProductDetail;