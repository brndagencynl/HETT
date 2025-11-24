import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import PageHeader from '../components/PageHeader';

const Products: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      {/* Header */}
      <PageHeader 
        title="Producten"
        subtitle="Collectie"
        description="Hoogwaardige panelen en profielen voor de professionele bouwer. Bekijk ons assortiment gevel- en dakoplossingen."
        image="https://picsum.photos/1200/800?random=1"
        action={{ label: "Bekijk Configurator", link: "/configurator" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No Results */}
        {PRODUCTS.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Geen producten gevonden.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Link to={`/producten/${product.id}`} className="block h-full">
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
        <div className="relative h-80 overflow-hidden bg-gray-100">
            <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            {product.isNew && (
            <div className="absolute top-6 left-6 bg-blue-500 text-white text-xs font-bold uppercase px-4 py-2 rounded-full shadow-md">
                Nieuw
            </div>
            )}
            <div className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-hett-dark opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                <ArrowRight size={20} />
            </div>
        </div>
        
        <div className="p-8 flex-grow flex flex-col">
            <div className="mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">{product.category}paneel</span>
                <h3 className="text-2xl font-bold text-hett-dark mb-3 group-hover:text-hett-brown transition-colors">{product.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{product.shortDescription}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">Dikte</span>
                        <span className="text-sm font-bold text-gray-800">{product.specs.thickness[0]}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold mb-1">Brandklasse</span>
                        <span className="text-sm font-bold text-gray-800">A2-s1,d0</span>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </Link>
  );
};

export default Products;