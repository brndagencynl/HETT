import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import { Check, Heart, ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, List, Star } from 'lucide-react';
import { filterVisibleProducts } from '../src/catalog/productVisibility';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import ActiveFilters from '../components/ui/ActiveFilters';
import ProductCard from '../components/ui/ProductCard';

import { CATEGORIES } from '../constants';
import { CategorySlug } from '../types';

const Category: React.FC = () => {
    const { categorySlug } = useParams();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMoreDesc, setShowMoreDesc] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Filter State
    const [activeBrands, setActiveBrands] = useState<string[]>([]);
    const [pendingBrands, setPendingBrands] = useState<string[]>([]);

    // Reset pending state when sheet opens
    useEffect(() => {
        if (mobileFiltersOpen) {
            setPendingBrands([...activeBrands]);
        }
    }, [mobileFiltersOpen, activeBrands]);

    const getCategoryName = (slug: string | undefined): string => {
        if (!slug) return 'Assortiment';
        const category = CATEGORIES[slug as CategorySlug];
        return category ? category.label : slug.charAt(0).toUpperCase() + slug.slice(1);
    };

    const categoryName = getCategoryName(categorySlug);

    const categoryIntro =
        categorySlug === 'accessoires'
            ? 'Bij HETT Veranda vindt u accessoires die perfect aansluiten op onze veranda’s en panelen, zoals LED-verlichting en afwerkingscomponenten. Eenvoudig mee te bestellen.'
            : `Bij HETT.nl vind je een ruime selectie aan hoogwaardige ${categoryName.toLowerCase()} van topmerken. Onze systemen zijn verkrijgbaar in verschillende maten en materialen, waaronder aluminium en gepoedercoat staal, zodat je altijd de juiste oplossing hebt voor jouw tuinproject.`;

    // Filter to only show public products first, then apply category/brand filters
    const visibleProducts = useMemo(() => filterVisibleProducts(PRODUCTS), []);
    
    // Filtering Logic
    const products = visibleProducts.filter(p => {
        const matchesCategory = !categorySlug || p.category === categorySlug;
        const matchesBrand = activeBrands.length === 0 || activeBrands.includes(p.badges?.[0] || 'Onbekend'); // Workaround since brand field missing in interface
        // Note: PRODUCTS constant usually has a brand field, if not we fall back to logic.
        // For this demo, we'll assume the brand labels match product properties.
        return matchesCategory && matchesBrand;
    });

    const handleApplyFilters = () => {
        setActiveBrands([...pendingBrands]);
    };

    const handleToggleBrand = (brand: string, isPending: boolean) => {
        const setter = isPending ? setPendingBrands : setActiveBrands;
        setter(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handleRemoveBrand = (brand: string) => {
        setActiveBrands(prev => prev.filter(b => b !== brand));
    };

    const handleClearAll = () => {
        setActiveBrands([]);
    };

    // Extracted filter content for reuse
    const FilterContent = ({ isPending = false }: { isPending?: boolean }) => {
        const currentBrands = isPending ? pendingBrands : activeBrands;
        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                <FilterAccordion title="Laat resultaten zien in" defaultOpen>
                    <div className="text-blue-700 text-sm font-bold pl-2 cursor-pointer hover:underline">
                        {categoryName} ({products.length})
                    </div>
                </FilterAccordion>
                <FilterAccordion title="Merk" defaultOpen>
                    <FilterCheckbox
                        label="HETT Premium"
                        count={42}
                        checked={currentBrands.includes("HETT Premium")}
                        onChange={() => handleToggleBrand("HETT Premium", isPending)}
                    />
                    <FilterCheckbox
                        label="Deponti"
                        count={15}
                        checked={currentBrands.includes("Deponti")}
                        onChange={() => handleToggleBrand("Deponti", isPending)}
                    />
                </FilterAccordion>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <PageHeader />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-hett-dark mb-4">{categoryName}</h1>
                    <div className="max-w-4xl">
                        <p className={`text-sm text-gray-600 leading-relaxed transition-all ${showMoreDesc ? '' : 'line-clamp-2'}`}>
                            {categoryIntro}
                        </p>
                        <button onClick={() => setShowMoreDesc(!showMoreDesc)} className="text-blue-700 font-bold text-sm mt-1 hover:underline">
                            {showMoreDesc ? 'Minder weergeven' : 'Lees meer'}
                        </button>
                    </div>
                    <div className="w-full h-px bg-gray-200 mt-8"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Desktop Filter Sidebar */}
                    <aside className="hidden lg:block w-full lg:w-[300px] flex-shrink-0">
                        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-hett-dark">
                            <SlidersHorizontal size={24} /> Filters
                        </div>
                        <FilterContent />
                    </aside>

                    <main className="flex-grow">
                        {/* Mobile Filter Button */}
                        <button
                            className="mobile-filter-btn lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                        >
                            <SlidersHorizontal size={20} />
                            Filters
                        </button>

                        {/* Active Filter Badges */}
                        <ActiveFilters
                            activeBrands={activeBrands}
                            onRemoveBrand={handleRemoveBrand}
                            onClearAll={handleClearAll}
                        />

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

            {/* Mobile Filter Bottom Sheet */}
            <MobileFilterSheet
                isOpen={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
                onApply={handleApplyFilters}
            >
                <FilterContent isPending />
            </MobileFilterSheet>
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

const FilterCheckbox: React.FC<{
    label: string,
    count: number,
    checked: boolean,
    onChange: () => void
}> = ({ label, count, checked, onChange }) => {
    return (
        <label className="flex items-center justify-between group cursor-pointer py-1.5">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-hett-dark"
                    checked={checked}
                    onChange={onChange}
                />
                <span className={`text-xs sm:text-sm ${checked ? 'font-bold text-hett-dark' : 'text-gray-600'}`}>{label}</span>
            </div>
            <span className="text-gray-400 text-[10px] sm:text-xs">({count})</span>
        </label>
    );
};

export default Category;