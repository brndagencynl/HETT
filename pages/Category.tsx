import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '../types';
import { Check, Heart, ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, List, Star, Loader2 } from 'lucide-react';
import { getCollectionProducts } from '../src/lib/shopify';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import MobileFilterSheet from '../components/ui/MobileFilterSheet';
import ActiveFilters from '../components/ui/ActiveFilters';
import ProductCard from '../components/ui/ProductCard';
import { parseVerandaDimensions, VERANDA_WIDTH_OPTIONS, VERANDA_DEPTH_OPTIONS } from '../src/utils/verandaDimensions';
import { toCents } from '../src/utils/money';

import { CATEGORIES } from '../constants';
import { CategorySlug } from '../types';
import { useTranslation } from 'react-i18next';

const Category: React.FC = () => {
    const { t } = useTranslation();
    const { categorySlug } = useParams();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMoreDesc, setShowMoreDesc] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Shopify products state
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [activeBrands, setActiveBrands] = useState<string[]>([]);
    const [pendingBrands, setPendingBrands] = useState<string[]>([]);

    // Veranda-specific filters
    // Draft values are bound to inputs; applied values drive actual filtering.
    const [draftPriceMin, setDraftPriceMin] = useState<string>('');
    const [draftPriceMax, setDraftPriceMax] = useState<string>('');
    const [appliedPriceMin, setAppliedPriceMin] = useState<number | null>(null);
    const [appliedPriceMax, setAppliedPriceMax] = useState<number | null>(null);

    // Mobile sheet uses pending drafts until user taps "Apply"
    const [pendingDraftPriceMin, setPendingDraftPriceMin] = useState<string>('');
    const [pendingDraftPriceMax, setPendingDraftPriceMax] = useState<string>('');

    const skipNextPriceDebounceRef = useRef(false);
    const [activeWidths, setActiveWidths] = useState<number[]>([]);
    const [pendingWidths, setPendingWidths] = useState<number[]>([]);
    const [activeDepths, setActiveDepths] = useState<number[]>([]);
    const [pendingDepths, setPendingDepths] = useState<number[]>([]);

    // Check if this is the veranda category
    const isVerandaCategory = categorySlug === 'verandas' || categorySlug === 'overkappingen';
    
    // Check if this is the accessoires category
    const isAccessoiresCategory = categorySlug === 'accessoires';

    // Fetch products from Shopify
    useEffect(() => {
        const fetchProducts = async () => {
            if (!categorySlug) return;
            
            setLoading(true);
            try {
                const result = await getCollectionProducts(categorySlug as CategorySlug);
                setProducts(result.products);
            } catch (err) {
                console.error('Failed to fetch category products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categorySlug]);

    // Reset pending state when sheet opens
    useEffect(() => {
        if (mobileFiltersOpen) {
            setPendingBrands([...activeBrands]);
            setPendingDraftPriceMin(draftPriceMin);
            setPendingDraftPriceMax(draftPriceMax);
            setPendingWidths([...activeWidths]);
            setPendingDepths([...activeDepths]);
        }
    }, [mobileFiltersOpen, activeBrands, draftPriceMin, draftPriceMax, activeWidths, activeDepths]);

    const applyPriceDraft = (
        nextDraftMin: string = draftPriceMin,
        nextDraftMax: string = draftPriceMax,
        commit: boolean = true
    ) => {
        console.log('[PriceFilter] draft', { draftMin: nextDraftMin, draftMax: nextDraftMax, commit });

        const parseDraft = (value: string): { value: number | null; pending: boolean } => {
            const trimmed = value.trim();
            if (trimmed === '') return { value: null, pending: false };

            // Allow comma as decimal separator.
            const normalized = trimmed.replace(',', '.');

            // While typing (debounced apply), don't apply if it's clearly a partial number
            // like "12." or "12,", because that would temporarily clear the filter.
            if (!commit) {
                const looksNumeric = /^\d+(?:\.\d*)?$/.test(normalized);
                const isTrailingDot = normalized.endsWith('.');
                if (looksNumeric && isTrailingDot) return { value: null, pending: true };
            }

            const cleaned = commit ? normalized.replace(/\.$/, '') : normalized;
            const numeric = Number(cleaned);
            return Number.isFinite(numeric) ? { value: numeric, pending: false } : { value: null, pending: true };
        };

        const parsedMin = parseDraft(nextDraftMin);
        const parsedMax = parseDraft(nextDraftMax);

        // If either field is mid-typing (partial/invalid), keep current applied values.
        if (!commit && (parsedMin.pending || parsedMax.pending)) return;

        let min = parsedMin.value;
        let max = parsedMax.value;

        if (min !== null && max !== null && min > max) {
            // Prefer swap to keep intent
            [min, max] = [max, min];
        }

        setAppliedPriceMin(min);
        setAppliedPriceMax(max);
        console.log('[PriceFilter] applied', { appliedMin: min, appliedMax: max });
    };

    // Debounced apply while typing (desktop). Only for veranda, not for accessoires.
    // Accessoires uses explicit apply (button, Enter, or blur).
    useEffect(() => {
        // Skip debounce for accessoires - they use explicit apply
        if (categorySlug === 'accessoires') return;
        
        if (skipNextPriceDebounceRef.current) {
            skipNextPriceDebounceRef.current = false;
            return;
        }

        const t = window.setTimeout(() => {
            applyPriceDraft(draftPriceMin, draftPriceMax, false);
        }, 600);

        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftPriceMin, draftPriceMax, categorySlug]);

    const getCategoryName = (slug: string | undefined): string => {
        if (!slug) return 'Assortiment';
        if (slug === 'verandas' || slug === 'overkappingen') return t('nav.verandas');
        if (slug === 'accessoires') return t('nav.accessoires');
        const category = CATEGORIES[slug as CategorySlug];
        return category ? category.label : slug.charAt(0).toUpperCase() + slug.slice(1);
    };

    const categoryName = getCategoryName(categorySlug);

    const categoryIntro =
        categorySlug === 'accessoires'
            ? t('categoryPage.introAccessoires')
            : isVerandaCategory
            ? t('categoryPage.introVerandas')
            : t('categoryPage.introDefault', { category: categoryName.toLowerCase() });

    // Filter to only show public products first, then apply category/brand filters
    const filteredProducts = products.filter(p => {
        // Brand filter (for non-veranda and non-accessoires categories)
        const matchesBrand = activeBrands.length === 0 || activeBrands.includes(p.badges?.[0] || 'Onbekend');
        
        // Accessoires-specific filters (only price)
        if (isAccessoiresCategory) {
            // Get product price (priceCents is in cents)
            const productPrice = (p.priceCents ?? toCents(p.price)) / 100;
            
            // Price filter
            if (appliedPriceMin !== null && productPrice < appliedPriceMin) return false;
            if (appliedPriceMax !== null && productPrice > appliedPriceMax) return false;
            
            return true; // No brand filter for accessoires
        }
        
        // Veranda-specific filters
        if (isVerandaCategory) {
            // Get product price (priceCents is in cents)
            const productPrice = (p.priceCents ?? toCents(p.price)) / 100;
            
            // Price filter
            if (appliedPriceMin !== null && productPrice < appliedPriceMin) return false;
            if (appliedPriceMax !== null && productPrice > appliedPriceMax) return false;
            
            // Dimension filters
            const dimensions = parseVerandaDimensions(p.handle || p.title);
            
            console.log('[Veranda Filters] product', p.handle, 'dimensions:', dimensions, 'price:', productPrice);
            
            // Width filter
            if (activeWidths.length > 0) {
                if (!dimensions.width) {
                    console.warn('[Veranda Filters] dimensions missing width', p.handle, p.title);
                    return false;
                }
                if (!activeWidths.includes(dimensions.width)) return false;
            }
            
            // Depth filter
            if (activeDepths.length > 0) {
                if (!dimensions.depth) {
                    console.warn('[Veranda Filters] dimensions missing depth', p.handle, p.title);
                    return false;
                }
                if (!activeDepths.includes(dimensions.depth)) return false;
            }
        }
        
        return matchesBrand;
    });

    const handleApplyFilters = () => {
        setActiveBrands([...pendingBrands]);
        setDraftPriceMin(pendingDraftPriceMin);
        setDraftPriceMax(pendingDraftPriceMax);
        skipNextPriceDebounceRef.current = true;
        applyPriceDraft(pendingDraftPriceMin, pendingDraftPriceMax, true);
        setActiveWidths([...pendingWidths]);
        setActiveDepths([...pendingDepths]);
    };

    const handleToggleBrand = (brand: string, isPending: boolean) => {
        const setter = isPending ? setPendingBrands : setActiveBrands;
        setter(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    const handleToggleWidth = (width: number, isPending: boolean) => {
        const setter = isPending ? setPendingWidths : setActiveWidths;
        setter(prev =>
            prev.includes(width)
                ? prev.filter(w => w !== width)
                : [...prev, width]
        );
    };

    const handleToggleDepth = (depth: number, isPending: boolean) => {
        const setter = isPending ? setPendingDepths : setActiveDepths;
        setter(prev =>
            prev.includes(depth)
                ? prev.filter(d => d !== depth)
                : [...prev, depth]
        );
    };

    const handleRemoveBrand = (brand: string) => {
        setActiveBrands(prev => prev.filter(b => b !== brand));
    };

    const handleRemoveWidth = (width: number) => {
        setActiveWidths(prev => prev.filter(w => w !== width));
    };

    const handleRemoveDepth = (depth: number) => {
        setActiveDepths(prev => prev.filter(d => d !== depth));
    };

    const handleClearPriceFilter = () => {
        setDraftPriceMin('');
        setDraftPriceMax('');
        setAppliedPriceMin(null);
        setAppliedPriceMax(null);
    };

    const handleClearAll = () => {
        setActiveBrands([]);
        setDraftPriceMin('');
        setDraftPriceMax('');
        setAppliedPriceMin(null);
        setAppliedPriceMax(null);
        setActiveWidths([]);
        setActiveDepths([]);
    };

    // Count active filters for display
    const activeFilterCount = activeBrands.length + activeWidths.length + activeDepths.length + 
        (appliedPriceMin !== null || appliedPriceMax !== null ? 1 : 0);

    // Render filter content for reuse.
    // NOTE: Keep this as a plain function (not an inline component) to avoid remounting
    // the whole filter tree on every render, which can reset focus/caret while typing.
    const renderFilterContent = (isPending: boolean = false) => {
        const currentBrands = isPending ? pendingBrands : activeBrands;
        const currentWidths = isPending ? pendingWidths : activeWidths;
        const currentDepths = isPending ? pendingDepths : activeDepths;
        const currentPriceMin = isPending ? pendingDraftPriceMin : draftPriceMin;
        const currentPriceMax = isPending ? pendingDraftPriceMax : draftPriceMax;

        // Debug log for filters
        console.log('[Filters] config', { isVerandaCategory, isAccessoiresCategory, categorySlug });
        console.log('[Filters] selected', { currentWidths, currentDepths, currentPriceMin, currentPriceMax, currentBrands });

        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                <FilterAccordion title={t('categoryPage.resultsIn')} defaultOpen>
                    <div className="text-blue-700 text-sm font-bold pl-2 cursor-pointer hover:underline">
                        {categoryName} ({filteredProducts.length})
                    </div>
                </FilterAccordion>
                
                {isAccessoiresCategory ? (
                    /* Accessoires: Only show Price filter */
                    <FilterAccordion title={t('filters.price')} defaultOpen>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[.,]?[0-9]*"
                                    placeholder={t('categoryPage.minPrice')}
                                    value={currentPriceMin}
                                    onChange={(e) => isPending ? setPendingDraftPriceMin(e.target.value) : setDraftPriceMin(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (isPending) return;
                                        if (e.key === 'Enter') {
                                            skipNextPriceDebounceRef.current = true;
                                            applyPriceDraft((e.currentTarget as HTMLInputElement).value, currentPriceMax, true);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (isPending) return;
                                        skipNextPriceDebounceRef.current = true;
                                        applyPriceDraft(currentPriceMin, currentPriceMax, true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-hett-secondary"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[.,]?[0-9]*"
                                    placeholder={t('categoryPage.maxPrice')}
                                    value={currentPriceMax}
                                    onChange={(e) => isPending ? setPendingDraftPriceMax(e.target.value) : setDraftPriceMax(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (isPending) return;
                                        if (e.key === 'Enter') {
                                            skipNextPriceDebounceRef.current = true;
                                            applyPriceDraft(currentPriceMin, (e.currentTarget as HTMLInputElement).value, true);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (isPending) return;
                                        skipNextPriceDebounceRef.current = true;
                                        applyPriceDraft(currentPriceMin, currentPriceMax, true);
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-hett-secondary"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (isPending) return;
                                skipNextPriceDebounceRef.current = true;
                                applyPriceDraft(currentPriceMin, currentPriceMax, true);
                            }}
                            className="mt-3 w-full py-2 bg-hett-primary text-white text-sm font-bold rounded-md hover:bg-hett-dark transition-colors"
                        >
                            {t('filters.apply')}
                        </button>
                    </FilterAccordion>
                ) : isVerandaCategory ? (
                    <>
                        {/* Price Filter */}
                        <FilterAccordion title={t('filters.price')} defaultOpen>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*[.,]?[0-9]*"
                                        placeholder={t('categoryPage.minPrice')}
                                        value={currentPriceMin}
                                        onChange={(e) => isPending ? setPendingDraftPriceMin(e.target.value) : setDraftPriceMin(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (isPending) return;
                                            if (e.key === 'Enter') {
                                                skipNextPriceDebounceRef.current = true;
                                                applyPriceDraft((e.currentTarget as HTMLInputElement).value, currentPriceMax, true);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isPending) return;
                                            skipNextPriceDebounceRef.current = true;
                                            applyPriceDraft(currentPriceMin, currentPriceMax, true);
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-hett-secondary"
                                    />
                                </div>
                                <span className="text-gray-400">-</span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9]*[.,]?[0-9]*"
                                        placeholder={t('categoryPage.maxPrice')}
                                        value={currentPriceMax}
                                        onChange={(e) => isPending ? setPendingDraftPriceMax(e.target.value) : setDraftPriceMax(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (isPending) return;
                                            if (e.key === 'Enter') {
                                                skipNextPriceDebounceRef.current = true;
                                                applyPriceDraft(currentPriceMin, (e.currentTarget as HTMLInputElement).value, true);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isPending) return;
                                            skipNextPriceDebounceRef.current = true;
                                            applyPriceDraft(currentPriceMin, currentPriceMax, true);
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-hett-secondary"
                                    />
                                </div>
                            </div>
                        </FilterAccordion>
                        
                        {/* Width Filter */}
                        <FilterAccordion title={`${t('filters.width')} (cm)`} defaultOpen>
                            {VERANDA_WIDTH_OPTIONS.map((width) => (
                                <FilterCheckbox
                                    key={width}
                                    label={`${width} cm`}
                                    count={products.filter(p => parseVerandaDimensions(p.handle || p.title).width === width).length}
                                    checked={currentWidths.includes(width)}
                                    onChange={() => handleToggleWidth(width, isPending)}
                                />
                            ))}
                        </FilterAccordion>
                        
                        {/* Depth Filter */}
                        <FilterAccordion title={`${t('filters.depth')} (cm)`} defaultOpen>
                            {VERANDA_DEPTH_OPTIONS.map((depth) => (
                                <FilterCheckbox
                                    key={depth}
                                    label={`${depth} cm`}
                                    count={products.filter(p => parseVerandaDimensions(p.handle || p.title).depth === depth).length}
                                    checked={currentDepths.includes(depth)}
                                    onChange={() => handleToggleDepth(depth, isPending)}
                                />
                            ))}
                        </FilterAccordion>
                    </>
                ) : (
                    /* Default brand filter for non-veranda categories */
                    <FilterAccordion title={t('filters.brand')} defaultOpen>
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
                )}
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
                            {showMoreDesc ? t('common.less') : t('common.more')}
                        </button>
                    </div>
                    <div className="w-full h-px bg-gray-200 mt-8"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Desktop Filter Sidebar */}
                    <aside className="hidden lg:block w-full lg:w-[300px] flex-shrink-0">
                        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-hett-dark">
                            <SlidersHorizontal size={24} /> {t('shop.filters')}
                        </div>
                            {renderFilterContent()}
                    </aside>

                    <main className="flex-grow">
                        {/* Mobile Filter Button */}
                        <button
                            className="mobile-filter-btn lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                        >
                            <SlidersHorizontal size={20} />
                            {t('shop.filters')}
                        </button>

                        {/* Active Filter Badges */}
                        <ActiveFilters
                            activeBrands={activeBrands}
                            onRemoveBrand={handleRemoveBrand}
                            onClearAll={handleClearAll}
                            priceMin={appliedPriceMin}
                            priceMax={appliedPriceMax}
                            activeWidths={activeWidths}
                            activeDepths={activeDepths}
                            onRemoveWidth={handleRemoveWidth}
                            onRemoveDepth={handleRemoveDepth}
                            onClearPrice={handleClearPriceFilter}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-xs sm:text-sm font-medium text-gray-500">
                                <span className="font-bold text-hett-dark">{loading ? '...' : filteredProducts.length}</span> {t('categoryPage.results')}
                            </div>

                            <div className="flex items-center gap-4">
                                <select className="bg-white border border-gray-300 rounded px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-hett-dark outline-none">
                                    <option>{t('categoryPage.defaultSort')}</option>
                                    <option>{t('shop.sortPriceLow')}</option>
                                    <option>{t('shop.sortPriceHigh')}</option>
                                </select>

                                <div className="hidden sm:flex items-center bg-gray-200/50 rounded-lg p-1">
                                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-hett-dark text-white shadow-sm' : 'text-gray-500'}`}><LayoutGrid size={18} /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-hett-dark text-white shadow-sm' : 'text-gray-500'}`}><List size={18} /></button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-hett-secondary" />
                                <span className="ml-3 text-hett-muted font-medium">{t('shop.loading')}</span>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <p className="text-hett-muted font-medium">{t('shop.noProducts')}</p>
                            </div>
                        ) : (
                            <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Bottom Sheet */}
            <MobileFilterSheet
                isOpen={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
                onApply={handleApplyFilters}
            >
                {renderFilterContent(true)}
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