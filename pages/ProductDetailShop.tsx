
import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { Check, Truck, ShieldCheck, PenTool, ShoppingBag, ArrowLeft, Download, ChevronRight, FileText, HelpCircle, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import VerandaConfigurator, { VerandaConfiguratorRef } from '../components/VerandaConfigurator';

const ProductDetailShop: React.FC = () => {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const configuratorRef = useRef<VerandaConfiguratorRef>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!product) return <div>Product niet gevonden</div>;

  const handleOpenConfigurator = () => {
    if (configuratorRef.current) {
        configuratorRef.current.open({
            // Optional: Pre-fill default values
            profileColor: 'Antraciet (RAL7016)'
        });
    }
  };

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
        // Redirect to Quote page with config state
        navigate('/offerte', { state: config });
    }
    configuratorRef.current?.close();
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const TABS = [
    { id: 'description', label: 'Productomschrijving' },
    { id: 'specs', label: 'Specificaties' },
    { id: 'photos', label: 'Productfoto\'s' },
    { id: 'manual', label: 'Handleiding' },
    { id: 'faq', label: 'Veelgestelde vragen' }
  ];

  const PRODUCT_FAQS = [
      {
        question: "Wat is de levertijd?",
        answer: "De standaard levertijd voor voorraadproducten is 1 tot 2 weken. Voor maatwerk kan dit iets langer zijn."
      },
      {
        question: "Kan ik dit zelf monteren?",
        answer: "Ja, al onze producten zijn ontworpen als bouwpakket. U ontvangt een duidelijke handleiding en alle benodigde bevestigingsmaterialen."
      },
      {
        question: "Hoe zit het met de garantie?",
        answer: "Wij bieden standaard 10 jaar fabrieksgarantie op de constructie en coating, en 5 jaar op bewegende delen."
      },
      {
        question: "Is maatwerk mogelijk?",
        answer: "Ja, in onze configurator kunt u de veranda tot op de centimeter nauwkeurig samenstellen. Voor zeer specifieke situaties kunt u contact opnemen voor een offerte op maat."
      }
  ];

  return (
    <div className="min-h-screen bg-white font-sans relative">
      
      {/* The Hidden Configurator Module */}
      <VerandaConfigurator 
        ref={configuratorRef} 
        productTitle={product.title}
        basePrice={product.price}
        onSubmit={handleConfigSubmit}
      />

      <PageHeader 
        title={product.title}
        subtitle={product.category}
        description={product.shortDescription}
        image={product.imageUrl}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <Link to={`/categorie/${product.category.toLowerCase()}`} className="inline-flex items-center text-gray-500 hover:text-hett-dark mb-8 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Terug naar {product.category}
        </Link>

        {/* Product Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20">
            
            {/* Gallery */}
            <div className="space-y-4">
                <div className="aspect-[4/3] bg-gray-100 rounded-[32px] overflow-hidden shadow-sm border border-gray-100 relative group">
                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    {/* Overlay Button to Open Configurator from Image */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <button 
                            onClick={handleOpenConfigurator}
                            className="bg-white/90 backdrop-blur text-hett-dark px-6 py-3 rounded-full font-bold shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        >
                            Open in 3D
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100"><img src="https://picsum.photos/400/400?random=1" className="w-full h-full object-cover" /></div>
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100"><img src="https://picsum.photos/400/400?random=2" className="w-full h-full object-cover" /></div>
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100"><img src="https://picsum.photos/400/400?random=3" className="w-full h-full object-cover" /></div>
                </div>
            </div>

            {/* Right Side - Short Info & Trigger */}
            <div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                    <span className="flex items-center gap-1"><Truck size={16} className="text-green-500" /> Op voorraad</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-green-500" /> 5 Jaar garantie</span>
                </div>
                
                {/* Trigger Card */}
                <div className="bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 sticky top-32">
                    <h3 className="text-2xl font-black text-hett-dark mb-4">Samenstellen</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Stel uw overkapping volledig op maat samen in onze vernieuwde 3D configurator. Kies uw afmetingen, kleuren en accessoires.
                    </p>

                    <div className="flex items-end gap-2 mb-8">
                        <span className="text-4xl font-black text-hett-dark">€{product.price},-</span>
                        <span className="text-gray-400 font-medium mb-2">Vanaf prijs</span>
                    </div>
                    
                    <button 
                        onClick={handleOpenConfigurator}
                        className="w-full bg-hett-dark text-white font-black text-lg py-5 rounded-2xl shadow-xl hover:bg-black transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                    >
                        <PenTool size={20} />
                        Nu configureren
                    </button>

                    <div className="mt-6 space-y-3">
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                             <Check size={16} className="text-green-500" /> Direct inzicht in de prijs
                         </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                             <Check size={16} className="text-green-500" /> 3D visualisatie
                         </div>
                         <div className="flex items-center gap-3 text-sm text-gray-600">
                             <Check size={16} className="text-green-500" /> Vrijblijvende offerte
                         </div>
                    </div>
                </div>

            </div>
        </div>

        {/* TABS SECTION */}
        <div className="mb-20">
            {/* Tab Navigation */}
            <div className="bg-hett-brown rounded-t-2xl flex overflow-x-auto no-scrollbar shadow-sm">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-5 text-sm md:text-base font-bold whitespace-nowrap transition-colors relative focus:outline-none ${
                            activeTab === tab.id 
                            ? 'text-white bg-black/10' 
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-hett-brownLight"></div>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Tab Content */}
            <div className="bg-gray-50 border border-gray-100 border-t-0 p-8 md:p-12 rounded-b-2xl shadow-sm min-h-[400px]">
                {activeTab === 'description' && (
                     <div className="prose prose-slate max-w-none">
                        <h3 className="text-2xl font-bold text-hett-dark mb-6">Productomschrijving</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            De {product.title} is ontworpen om uw buitenleven te verrijken. 
                            Vervaardigd uit hoogwaardige materialen die bestand zijn tegen alle weersinvloeden. 
                            De combinatie van een strak design en robuuste constructie zorgt voor jarenlang plezier.
                        </p>
                        <h4 className="text-xl font-bold text-hett-dark mt-8 mb-4">Waarom kiezen voor deze {product.category.toLowerCase()}?</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                            <li className="flex items-center gap-3"><Check className="text-green-500" /> Onderhoudsarm aluminium</li>
                            <li className="flex items-center gap-3"><Check className="text-green-500" /> Eenvoudige montage</li>
                            <li className="flex items-center gap-3"><Check className="text-green-500" /> 10 jaar garantie op coating</li>
                            <li className="flex items-center gap-3"><Check className="text-green-500" /> Sneeuwbelasting tot 110kg/m²</li>
                        </ul>
                     </div>
                )}
                {activeTab === 'specs' && (
                    <div>
                        <h3 className="text-2xl font-bold text-hett-dark mb-6">Specificaties</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                            {Object.entries(product.specs).map(([key, value], idx) => (
                                <div key={key} className={`flex justify-between py-4 border-b border-gray-200 ${idx === 0 ? 'border-t' : ''}`}>
                                    <span className="font-bold text-gray-700">{key}</span>
                                    <span className="text-gray-600 font-medium">{Array.isArray(value) ? value.join(', ') : value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="font-bold text-gray-700">Land van herkomst</span>
                                <span className="text-gray-600 font-medium">Duitsland</span>
                            </div>
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="font-bold text-gray-700">Levertijd</span>
                                <span className="text-gray-600 font-medium">1-2 weken</span>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'photos' && (
                    <div>
                         <h3 className="text-2xl font-bold text-hett-dark mb-6">Productfoto's</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[1,2,3,4,5,6].map(i => (
                                 <div key={i} className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm group relative">
                                    <img src={`https://picsum.photos/800/800?random=${200+i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Detail" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                                 </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'manual' && (
                    <div>
                        <h3 className="text-2xl font-bold text-hett-dark mb-6">Documentatie</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-hett-dark mb-1">Montagehandleiding {product.title}</h4>
                                    <p className="text-gray-500 text-sm mb-4">PDF - 4.2 MB - Nederlands</p>
                                    <button className="flex items-center gap-2 text-hett-brown font-bold text-sm hover:underline">
                                        <Download size={16} /> Downloaden
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-hett-dark mb-1">Technische Tekeningen</h4>
                                    <p className="text-gray-500 text-sm mb-4">PDF - 2.8 MB - Technisch</p>
                                    <button className="flex items-center gap-2 text-hett-brown font-bold text-sm hover:underline">
                                        <Download size={16} /> Downloaden
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'faq' && (
                    <div>
                        <h3 className="text-2xl font-bold text-hett-dark mb-6">Veelgestelde vragen</h3>
                        <div className="space-y-4 max-w-3xl">
                            {PRODUCT_FAQS.map((faq, index) => (
                                <div key={index} className="bg-white rounded-[16px] shadow-sm overflow-hidden border border-transparent hover:border-gray-100 transition-all">
                                    <button 
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex justify-between items-center p-5 text-left font-bold text-hett-dark hover:bg-gray-50 transition-colors text-sm md:text-base"
                                    >
                                        <span>{faq.question}</span>
                                        {openFaqIndex === index ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </button>
                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${openFaqIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
        
      {/* Others Also Viewed Section - Full Width Background */}
      <div className="bg-[#f2f2f0] py-20 mt-12">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
             <div className="mb-8">
                 <span className="text-[#5d734e] text-sm font-medium block mb-1">Populair</span>
                 <h2 className="text-4xl font-normal text-hett-dark">Anderen bekeken ook</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4).map(related => (
                    <div key={related.id} className="bg-white rounded-lg overflow-hidden flex flex-col h-full group hover:shadow-lg transition-shadow duration-300">
                        {/* Image */}
                        <Link to={`/product/${related.id}`} className="block relative h-56 overflow-hidden">
                             <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </Link>
                        
                        {/* Content */}
                        <div className="p-6 flex flex-col flex-grow">
                            <Link to={`/product/${related.id}`} className="block mb-4">
                                <h3 className="text-hett-dark text-sm font-normal leading-snug hover:underline line-clamp-2">
                                    {related.title} – {related.shortDescription}
                                </h3>
                            </Link>
                            
                            <div className="text-hett-dark font-bold text-sm mb-4">
                                {related.options?.sizes?.[0] ? related.options.sizes[0].replace('x', ' cm x ').replace('cm', ' cm') : '306 cm x 250 cm'}
                            </div>

                            <div className="flex items-center gap-2 text-[#5d734e] text-xs font-medium mb-6">
                                <Check size={14} /> Op voorraad
                            </div>

                            <div className="mt-auto flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-hett-dark font-bold text-xl leading-none">{related.price}</span>
                                    <span className="text-gray-500 text-[10px] mt-1">incl. BTW</span>
                                </div>
                                <Link 
                                    to={`/product/${related.id}`}
                                    className="bg-hett-dark text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-hett-brown transition-colors"
                                >
                                    Configureer nu
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Fallback if no related products found */}
                {PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).length === 0 && (
                     <div className="col-span-4 text-center text-gray-500">Geen vergelijkbare producten gevonden.</div>
                )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default ProductDetailShop;
