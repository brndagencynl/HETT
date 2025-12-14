
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Filter, Check, X, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterCheckboxProps {
  label: string;
  count?: number;
  defaultChecked?: boolean;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ label, count, defaultChecked = false }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <label className="flex items-center justify-between py-3 cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${checked ? 'bg-hett-dark border-hett-dark' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                    <Check size={14} className={`text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                </div>
                <span className={`text-base ${checked ? 'font-bold text-hett-dark' : 'font-medium text-gray-700'}`}>{label}</span>
                <input type="checkbox" className="hidden" checked={checked} onChange={() => setChecked(!checked)} />
            </div>
            {count !== undefined && <span className="text-gray-400 text-sm">({count})</span>}
        </label>
    );
};

interface FilterGroupProps {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center justify-between w-full text-left py-5 group bg-gray-50/50 px-4 hover:bg-gray-50 transition-colors"
            >
                <h4 className="font-bold text-hett-dark text-base">{title}</h4>
                {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white"
                    >
                        <div className="px-4 pb-5 pt-2">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Category: React.FC = () => {
  const { categorySlug } = useParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Aanbevolen');
  
  // Simple mapping from slug to category name
  const getCategoryName = (slug: string | undefined) => {
    if (!slug) return '';
    if (slug === 'overkappingen') return 'Overkappingen';
    if (slug === 'sandwichpanelen') return 'Sandwichpanelen';
    if (slug === 'profielen') return 'Profielen';
    if (slug === 'accessoires') return 'Accessoires';
    return slug;
  };

  const categoryName = getCategoryName(categorySlug);
  const products = PRODUCTS.filter(p => p.category === categoryName);
  const isOverkappingen = categorySlug === 'overkappingen';

  const handleResetFilters = () => {
      // Reset logic
  };

  const FilterContent = () => (
    <div className="flex flex-col h-full bg-white">
        
        {/* Sortering Section */}
        <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-bold text-hett-dark mb-2">Sortering</label>
            <div className="relative">
                <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium focus:outline-none focus:border-hett-dark focus:ring-1 focus:ring-hett-dark"
                >
                    <option>Aanbevolen</option>
                    <option>Prijs: Laag - Hoog</option>
                    <option>Prijs: Hoog - Laag</option>
                    <option>Nieuwste eerst</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto">
            
            {/* Specific Filters for Overkappingen */}
            {isOverkappingen ? (
                <>
                    <FilterGroup title="Populaire filters">
                        <div className="flex flex-col">
                            <FilterCheckbox label="Direct leverbaar" count={12} />
                            <FilterCheckbox label="Actie producten" count={4} />
                            <FilterCheckbox label="Nieuw" count={8} />
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Breedte">
                        <div className="flex flex-col">
                            {[306, 406, 506, 606, 706, 806, 906, 1006].map(w => (
                                <FilterCheckbox key={w} label={`${w} cm`} count={Math.floor(Math.random() * 15) + 1} />
                            ))}
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Diepte">
                        <div className="flex flex-col">
                            {[250, 300, 350, 400, 500].map(d => (
                                <FilterCheckbox key={d} label={`${d} cm`} count={Math.floor(Math.random() * 20) + 1} />
                            ))}
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Kleur">
                        <div className="flex flex-col">
                            <FilterCheckbox label="Antraciet (RAL7016)" count={42} defaultChecked />
                            <FilterCheckbox label="Crèmewit (RAL9001)" count={18} />
                            <FilterCheckbox label="Zwart (RAL9005)" count={12} />
                        </div>
                    </FilterGroup>

                    <FilterGroup title="Type dakbedekking">
                        <div className="flex flex-col">
                            <FilterCheckbox label="Polycarbonaat Opaal" count={35} />
                            <FilterCheckbox label="Polycarbonaat Helder" count={28} />
                            <FilterCheckbox label="Glas Helder" count={15} />
                            <FilterCheckbox label="Glas Melk" count={8} />
                        </div>
                    </FilterGroup>
                </>
            ) : (
                // Generic Categories for other pages
                <FilterGroup title="Categorie">
                    <ul className="space-y-3">
                        <li><Link to="/categorie/overkappingen" className="text-gray-700 hover:text-hett-brown font-medium block">Overkappingen (14)</Link></li>
                        <li><Link to="/categorie/sandwichpanelen" className="text-gray-700 hover:text-hett-brown font-medium block">Sandwichpanelen (8)</Link></li>
                        <li><Link to="/categorie/profielen" className="text-gray-700 hover:text-hett-brown font-medium block">Profielen (24)</Link></li>
                        <li><Link to="/categorie/accessoires" className="text-gray-700 hover:text-hett-brown font-medium block">Accessoires (32)</Link></li>
                    </ul>
                </FilterGroup>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={categoryName}
        subtitle="Shop"
        description={`Bekijk ons assortiment ${categoryName.toLowerCase()}. Hoogwaardige kwaliteit voor uw tuinproject.`}
        image={`https://picsum.photos/1200/400?random=${categorySlug?.length}`}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Filters Sidebar (Desktop) */}
            <div className="hidden lg:block">
                <div className="bg-white rounded-[16px] shadow-sm border border-gray-200 sticky top-32 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2 font-black text-hett-dark text-lg">
                            <SlidersHorizontal size={20} />
                            <h3>Filters</h3>
                        </div>
                        <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-hett-brown uppercase tracking-wider">
                            Wis alles
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <FilterContent />
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button className="w-full bg-[#7fb035] text-white font-bold py-3 rounded-lg hover:bg-[#719d2f] transition-colors shadow-sm">
                            Toon {products.length} resultaten
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Grid & Mobile Filter */}
            <div className="lg:col-span-3">
                
                {/* Mobile Filter Bar (Horizontal Scroll) */}
                <div className="lg:hidden mb-6">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                        {/* Main Filter Button */}
                        <button 
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="flex-shrink-0 flex items-center gap-2 bg-[#002f5d] text-white px-5 py-3 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-transform"
                        >
                            <SlidersHorizontal size={18} />
                            Filter
                        </button>

                        {/* Quick Pills */}
                        <button className="flex-shrink-0 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 whitespace-nowrap active:bg-gray-50">
                            Bekijk de TOP 10
                        </button>
                        <button className="flex-shrink-0 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 whitespace-nowrap active:bg-gray-50">
                            Merk HETT
                        </button>
                        <button className="flex-shrink-0 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 whitespace-nowrap active:bg-gray-50">
                            Type Premium
                        </button>
                        <button className="flex-shrink-0 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 whitespace-nowrap active:bg-gray-50">
                            Direct leverbaar
                        </button>
                    </div>
                    
                    {/* Active Filters Summary (Optional) */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span><strong>{products.length}</strong> resultaten</span>
                        <div className="flex items-center gap-1">
                            <span>Sortering:</span>
                            <span className="font-bold text-hett-dark">{sortOption}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                    {products.map((product) => (
                         <div key={product.id} className="bg-white rounded-lg overflow-hidden flex flex-col h-full group hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-gray-200">
                            {/* Image */}
                            <Link to={`/product/${product.id}`} className="block relative h-36 md:h-56 overflow-hidden bg-gray-100">
                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                {product.isBestseller && (
                                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-[#a05a2c] text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Populair
                                    </div>
                                )}
                                {product.isNew && (
                                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-[#293133] text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Nieuw
                                    </div>
                                )}
                            </Link>
                            
                            {/* Content */}
                            <div className="p-3 md:p-6 flex flex-col flex-grow">
                                <Link to={`/product/${product.id}`} className="block mb-2 md:mb-4">
                                    <h3 className="text-[#1a1a1a] text-xs md:text-sm font-normal leading-snug hover:underline line-clamp-2 min-h-[2.5em]">
                                        {product.title} – {product.shortDescription}
                                    </h3>
                                </Link>
                                
                                <div className="text-[#1a1a1a] font-bold text-xs md:text-sm mb-2 md:mb-4">
                                    {product.options?.sizes?.[0] ? product.options.sizes[0].replace('x', ' cm x ').replace('cm', ' cm') : '306 cm x 250 cm'}
                                </div>

                                <div className="flex items-center gap-1.5 md:gap-2 text-[#5d734e] text-[10px] md:text-xs font-medium mb-3 md:mb-6">
                                    <Check size={12} strokeWidth={3} /> Op voorraad
                                </div>

                                <div className="mt-auto flex flex-col gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[#1a1a1a] font-bold text-lg md:text-xl leading-none">{product.price}</span>
                                        <span className="text-gray-500 text-[10px] mt-1">incl. BTW</span>
                                    </div>
                                    <Link 
                                        to={`/product/${product.id}`}
                                        className="w-full bg-[#293133] text-white text-xs font-medium px-4 py-3 rounded-full hover:bg-[#1a1a1a] transition-colors text-center"
                                    >
                                        Configureer nu
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">Geen producten gevonden in deze categorie.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* Mobile Filter Drawer (Full Screen / Slide Up) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[100] font-sans">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileFilterOpen(false)}
                />
                
                {/* Drawer */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-x-0 bottom-0 top-[10vh] bg-white rounded-t-[20px] flex flex-col shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white z-10">
                        <h3 className="text-2xl font-black text-hett-dark">Filters</h3>
                        <button 
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={28} className="text-hett-dark" strokeWidth={2.5} />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow overflow-y-auto bg-white pb-24">
                        <FilterContent />
                    </div>

                    {/* Sticky Footer Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                        <button 
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="w-full bg-[#7fb035] text-white font-black text-lg py-4 rounded-xl hover:bg-[#719d2f] transition-colors shadow-md active:scale-[0.99] transform"
                        >
                            Toon {products.length} resultaten
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Category;
