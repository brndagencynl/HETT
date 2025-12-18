import React from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Filter, Check, Star, Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Product } from '../types';

const Shop: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Webshop"
        subtitle="Catalogus"
        description="Bekijk ons volledige assortiment veranda's, glazen schuifwanden en accessoires."
        image="https://picsum.photos/1200/400?random=shop"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
            
            {/* Filters Sidebar */}
            <div className="hidden lg:block">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter size={20} className="text-hett-brown" />
                        <h3 className="font-bold text-hett-dark">Filters</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold mb-3">Categorie</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link to="/categorie/overkappingen" className="hover:text-hett-brown transition-colors">Overkappingen</Link></li>
                                <li><Link to="/categorie/sandwichpanelen" className="hover:text-hett-brown transition-colors">Sandwichpanelen</Link></li>
                                <li><Link to="/categorie/profielen" className="hover:text-hett-brown transition-colors">Aluminium Profielen</Link></li>
                                <li><Link to="/categorie/accessoires" className="hover:text-hett-brown transition-colors">Montage Accessoires</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-8">
                    <div className="text-sm text-gray-500 font-bold">
                        {PRODUCTS.length} Producten
                    </div>
                    <select className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm font-bold outline-none">
                        <option>Sorteer op: Populair</option>
                        <option>Prijs: Laag - Hoog</option>
                        <option>Prijs: Hoog - Laag</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {PRODUCTS.map((product) => (
                        <ShopProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ShopProductCard: React.FC<{ product: Product }> = ({ product }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-md transition-all flex flex-col group overflow-hidden">
            <div className="px-2 py-1.5 flex justify-end">
                <button className="text-gray-300 hover:text-red-500 transition-colors p-1"><Heart size={18} /></button>
            </div>

            <Link to={`/product/${product.id}`} className="relative flex items-center justify-center overflow-hidden bg-gray-50 h-32 sm:h-64">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                {product.isBestseller && (
                    <div className="absolute top-2 left-2 bg-hett-secondary text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase">Populair</div>
                )}
            </Link>

            <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
                <Link to={`/product/${product.id}`} className="block mb-1 sm:mb-2">
                    <h3 className="text-hett-dark font-bold text-[13px] sm:text-base leading-tight hover:underline line-clamp-2 min-h-[2.4rem] sm:min-h-[3rem]">
                        {product.title}
                    </h3>
                </Link>

                <div className="flex items-center gap-1 mb-2 sm:mb-4">
                    <div className="flex text-yellow-400">
                        <Star size={10} fill="currentColor" />
                    </div>
                    <span className="text-[9px] sm:text-xs text-gray-400 font-bold">({product.reviewCount})</span>
                </div>

                <div className="mb-3 sm:mb-4">
                    <div className="text-base sm:text-2xl font-black text-hett-dark leading-none">€ {product.price},-</div>
                </div>

                <div className="mt-auto">
                    <Link 
                        to={`/product/${product.id}`}
                        className="w-full bg-hett-dark text-white rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:bg-hett-primary transition-colors"
                    >
                        Configureer
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Shop;