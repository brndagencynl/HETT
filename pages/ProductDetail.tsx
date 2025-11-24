import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { CheckCircle, FileText, Download, ArrowLeft, Box, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import Panel3D from '../components/Panel3D';

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Images & 3D */}
            <div>
                <div className="relative h-[400px] w-full rounded-[24px] overflow-hidden shadow-lg mb-4 bg-gray-100 border border-gray-100">
                    
                    {/* 3D Toggle Button */}
                    <div className="absolute top-4 right-4 z-20 flex bg-white/90 backdrop-blur rounded-full p-1 shadow-md border border-gray-100">
                        <button 
                            onClick={() => setViewMode('image')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                viewMode === 'image' 
                                ? 'bg-hett-dark text-white shadow-sm' 
                                : 'text-gray-500 hover:text-hett-dark'
                            }`}
                        >
                            <ImageIcon size={16} /> Foto
                        </button>
                        <button 
                            onClick={() => setViewMode('3d')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                viewMode === '3d' 
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

            {/* Right Column: Info & Specs */}
            <div>
                <div className="prose prose-slate mb-8">
                    <h3 className="text-xl font-semibold text-hett-dark mb-4">Productomschrijving</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {product.description}
                        <br /><br />
                        Dit paneel combineert een esthetische afwerking met hoogwaardige thermische eigenschappen, waardoor het de ideale keuze is voor de moderne verandabouwer. Verkrijgbaar in diverse RAL-kleuren om perfect aan te sluiten bij de bestaande woning.
                    </p>
                </div>

                {/* Key Features List */}
                <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
                    <h4 className="font-bold text-hett-dark mb-4">Belangrijkste Voordelen</h4>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span>Uitstekende thermische isolatie ({product.specs.uValue})</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span>Lichtgewicht en snel te monteren</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span>Duurzame coating ({product.specs.coating})</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span>Op maat gezaagd geleverd</span>
                        </li>
                    </ul>
                </div>

                {/* Technical Specs Table */}
                <div className="mb-8">
                    <h4 className="font-bold text-hett-dark mb-4">Technische Specificaties</h4>
                    <table className="w-full text-sm text-left text-gray-600 border border-gray-200 rounded-xl overflow-hidden">
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 font-medium bg-gray-50 w-1/3">Diktes</td>
                                <td className="px-4 py-3">{product.specs.thickness.join(', ')}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium bg-gray-50">Werkende breedte</td>
                                <td className="px-4 py-3">{product.specs.width}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium bg-gray-50">U-Waarde</td>
                                <td className="px-4 py-3">{product.specs.uValue}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium bg-gray-50">Coating</td>
                                <td className="px-4 py-3">{product.specs.coating}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium bg-gray-50">Brandklasse</td>
                                <td className="px-4 py-3">B-s2, d0 (conform EN 13501-1)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Brandveiligheid Section (Highlighted) */}
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl mb-8 flex items-start gap-4">
                    <div className="bg-white p-3 rounded-full text-orange-500 shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-hett-dark text-lg mb-1">Brandveiligheid</h4>
                        <p className="text-sm text-gray-600 mb-2">
                            Gecertificeerd volgens Europese normen voor veilig bouwen.
                        </p>
                        <div className="inline-block bg-white px-3 py-1 rounded border border-orange-200 text-orange-700 font-bold text-sm">
                            B-s2, d0 (conform EN 13501-1)
                        </div>
                    </div>
                </div>

                {/* Downloads */}
                <div>
                    <h4 className="font-bold text-hett-dark mb-4">Downloads & Documentatie</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-gray-800">Technisch Datasheet</span>
                                <span className="block text-xs text-gray-500">PDF (2.4 MB)</span>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left group">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Download size={20} />
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-gray-800">Montagehandleiding</span>
                                <span className="block text-xs text-gray-500">PDF (5.1 MB)</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                     <Link to="/contact" className="block w-full text-center bg-hett-dark text-white font-bold py-4 rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        Offerte Aanvragen
                     </Link>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;