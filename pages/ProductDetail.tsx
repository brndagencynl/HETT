import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { CheckCircle, FileText, Download, ArrowLeft, Box, Image as ImageIcon, ShieldCheck, Truck } from 'lucide-react';
import Panel3D from '../components/Panel3D';

import ProductDetailContent from '../components/ui/ProductDetailContent';

const ProductDetail: React.FC = () => {
    // In a real app, use the ID to fetch specific data. 
    // For this demo, we'll just show the first product or find by ID if passed, fallback to first.
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

    const [viewMode, setViewMode] = useState<'image' | '3d'>('image');

    if (!product) return <div>Product niet gevonden</div>;

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