
import React from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Filter, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Shop: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Webshop"
        subtitle="Catalogus"
        description="Bekijk ons volledige assortiment veranda's, glazen schuifwanden en accessoires."
        image="https://picsum.photos/1200/400?random=shop"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Filters Sidebar */}
            <div className="hidden lg:block">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 sticky top-32">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter size={20} className="text-hett-brown" />
                        <h3 className="font-bold text-hett-dark">Filters</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold mb-3">Categorie</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link to="/categorie/overkappingen" className="hover:text-hett-brown">Overkappingen</Link></li>
                                <li><Link to="/categorie/glazen-schuifwanden" className="hover:text-hett-brown">Glazen schuifwanden</Link></li>
                                <li><Link to="/categorie/profielen" className="hover:text-hett-brown">Profielen</Link></li>
                                <li><Link to="/categorie/accessoires" className="hover:text-hett-brown">Accessoires</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold mb-3">Prijs</h4>
                            <input type="range" className="w-full accent-hett-brown" />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>€0</span>
                                <span>€5000+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {PRODUCTS.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg overflow-hidden flex flex-col h-full group hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-gray-200">
                            {/* Image */}
                            <Link to={`/product/${product.id}`} className="block relative h-56 overflow-hidden">
                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                {product.isBestseller && (
                                    <div className="absolute top-4 left-4 bg-[#a05a2c] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Populair
                                    </div>
                                )}
                                {product.isNew && (
                                    <div className="absolute top-4 left-4 bg-[#293133] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Nieuw
                                    </div>
                                )}
                            </Link>
                            
                            {/* Content */}
                            <div className="p-6 flex flex-col flex-grow">
                                <Link to={`/product/${product.id}`} className="block mb-4">
                                    <h3 className="text-[#1a1a1a] text-sm font-normal leading-snug hover:underline line-clamp-2">
                                        {product.title} – {product.shortDescription}
                                    </h3>
                                </Link>
                                
                                <div className="text-[#1a1a1a] font-bold text-sm mb-4">
                                    {product.options?.sizes?.[0] ? product.options.sizes[0].replace('x', ' cm x ').replace('cm', ' cm') : '306 cm x 250 cm'}
                                </div>

                                <div className="flex items-center gap-2 text-[#5d734e] text-xs font-medium mb-6">
                                    <Check size={14} strokeWidth={3} /> Op voorraad
                                </div>

                                <div className="mt-auto flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[#1a1a1a] font-bold text-xl leading-none">{product.price}</span>
                                        <span className="text-gray-500 text-[10px] mt-1">incl. BTW</span>
                                    </div>
                                    <Link 
                                        to={`/product/${product.id}`}
                                        className="bg-[#293133] text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
                                    >
                                        Configureer nu
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Shop;
