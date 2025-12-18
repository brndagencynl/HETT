import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import { Check, Heart, ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, List, Star } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const Category: React.FC = () => {
  const { categorySlug } = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMoreDesc, setShowMoreDesc] = useState(false);

  const getCategoryName = (slug: string | undefined) => {
    if (!slug) return 'Assortiment';
    const names: Record<string, string> = {
        'overkappingen': 'Universele Overkappingen',
        'sandwichpanelen': 'Geïsoleerde Panelen',
        'profielen': 'Aluminium Profielen',
        'accessoires': 'Montage Accessoires'
    };
    return names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  const categoryName = getCategoryName(categorySlug);
  const products = PRODUCTS.filter(p => !categorySlug || p.category.toLowerCase() === categorySlug);

  return (
    <div className="min-h-screen bg-white font-sans">
      <PageHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-hett-dark mb-4">{categoryName}</h1>
            <div className="max-w-4xl">
                <p className={`text-sm text-gray-600 leading-relaxed transition-all ${showMoreDesc ? '' : 'line-clamp-2'}`}>
                    Bij HETT.nl vind je een ruime selectie aan hoogwaardige {categoryName.toLowerCase()} van topmerken. Onze systemen zijn verkrijgbaar in verschillende maten en materialen, waaronder aluminium en gepoedercoat staal, zodat je altijd de juiste oplossing hebt voor jouw tuinproject.
                </p>
                <button onClick={() => setShowMoreDesc(!showMoreDesc)} className="text-blue-700 font-bold text-sm mt-1 hover:underline">
                    {showMoreDesc ? 'Minder weergeven' : 'Lees meer'}
                </button>
            </div>
            <div className="w-full h-px bg-gray-200 mt-8"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <aside className="w-full lg:w-[300px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-6 text-xl font-bold text-hett-dark">
                    <SlidersHorizontal size={24} /> Filters
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                    <FilterAccordion title="Laat resultaten zien in" defaultOpen>
                        <div className="text-blue-700 text-sm font-bold pl-2 cursor-pointer hover:underline">
                            {categoryName} ({products.length})
                        </div>
                    </FilterAccordion>
                    <FilterAccordion title="Merk" defaultOpen>
                        <FilterCheckbox label="HETT Premium" count={42} checked />
                        <FilterCheckbox label="Deponti" count={15} />
                    </FilterAccordion>
                </div>
            </aside>

            <main className="flex-grow">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs sm:text-sm font-medium text-gray-500">
                        <span className="font-bold text-hett-dark">{products.length}</span> resultaten
                    </div>

                    <div className="flex items-center gap-4">
                        <select className="bg-white border border-gray-300 rounded px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-hett-dark outline-none">
                            <option>Standaard</option>
                            <option>Prijs: Laag - Hoog</option>
                            <option>Prijs: Hoog - Laag</option>
                        </select>

                        <div className="hidden sm:flex items-center bg-gray-200/50 rounded-lg p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-hett-dark text-white shadow-sm' : 'text-gray-500'}`}><LayoutGrid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-hett-dark text-white shadow-sm' : 'text-gray-500'}`}><List size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                </div>
            </main>
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, viewMode: 'grid' | 'list' }> = ({ product, viewMode }) => {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-md transition-all flex flex-col group overflow-hidden ${viewMode === 'list' ? 'md:flex-row' : ''}`}>
            {/* Action Bar (Compare & Wishlist) */}
            <div className={`px-2 py-1.5 flex justify-between items-center ${viewMode === 'list' ? 'hidden' : ''}`}>
                <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 border-gray-300 rounded text-hett-dark focus:ring-hett-primary" />
                    <span className="text-[10px] sm:text-xs font-bold text-blue-700">Vergelijk</span>
                </label>
                <button className="text-gray-300 hover:text-red-500 transition-colors p-1"><Heart size={18} /></button>
            </div>

            <Link to={`/product/${product.id}`} className={`relative flex items-center justify-center overflow-hidden bg-gray-50 ${viewMode === 'list' ? 'w-full md:w-64 p-4' : 'h-32 sm:h-64'}`}>
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                {product.isBestseller && (
                    <div className="absolute top-2 left-2 bg-hett-secondary text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase">Bestseller</div>
                )}
            </Link>

            <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {product.badges?.slice(0, 1).map(badge => (
                        <span key={badge} className="text-[8px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 whitespace-nowrap">
                            {badge}
                        </span>
                    ))}
                </div>

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
                    <button className="w-full bg-hett-dark text-white rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:bg-hett-primary transition-colors">
                        Bestel
                    </button>
                    {product.variantCount && (
                        <Link to={`/product/${product.id}`} className="block text-center mt-1.5 text-blue-700 text-[10px] sm:text-xs font-bold hover:underline">
                            {product.variantCount} Varianten
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const FilterAccordion: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                <h4 className="text-xs sm:text-sm font-black text-hett-dark uppercase tracking-wider text-left">{title}</h4>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && <div className="p-4 pt-0 space-y-1 bg-white">{children}</div>}
        </div>
    );
};

const FilterCheckbox: React.FC<{ label: string, count: number, checked?: boolean }> = ({ label, count, checked = false }) => {
    const [isChecked, setIsChecked] = useState(checked);
    return (
        <label className="flex items-center justify-between group cursor-pointer py-1.5">
            <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded text-hett-dark" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                <span className={`text-xs sm:text-sm ${isChecked ? 'font-bold text-hett-dark' : 'text-gray-600'}`}>{label}</span>
            </div>
            <span className="text-gray-400 text-[10px] sm:text-xs">({count})</span>
        </label>
    );
};

export default Category;