
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import { Search as SearchIcon, Check, Loader2 } from 'lucide-react';
import { searchProducts } from '../src/lib/shopify';
import { Product } from '../types';

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Shopify search state
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Search products from Shopify
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResult = await searchProducts(query);
        setResults(searchResult.products);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={`${t('search.resultsFor')} "${query}"`}
        subtitle={t('search.title')}
        description={`${results.length} ${t('search.resultsCount')}`}
        image="https://picsum.photos/1200/400?random=search"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-hett-secondary" />
            <span className="ml-3 text-hett-muted font-medium">{t('search.searching')}</span>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product) => (
               <div key={product.id} className="bg-white rounded-lg overflow-hidden flex flex-col h-full group hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-gray-200">
                    {/* Image */}
                    <Link to={`/products/${product.id}`} className="block relative h-56 overflow-hidden">
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
                        <Link to={`/products/${product.id}`} className="block mb-4">
                            <h3 className="text-[#1a1a1a] text-sm font-normal leading-snug hover:underline line-clamp-2">
                                {product.title} – {product.shortDescription}
                            </h3>
                        </Link>
                        
                        <div className="text-[#1a1a1a] font-bold text-sm mb-4">
                            {product.options?.sizes?.[0] ? product.options.sizes[0].replace('x', ' cm x ').replace('cm', ' cm') : '306 cm x 250 cm'}
                        </div>

                        <div className="flex items-center gap-2 text-[#5d734e] text-xs font-medium mb-6">
                            <Check size={14} strokeWidth={3} /> {t('common.inStock')}
                        </div>

                        <div className="mt-auto flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-[#1a1a1a] font-bold text-xl leading-none">{product.price}</span>
                                <span className="text-gray-500 text-[10px] mt-1">{t('common.inclVat')}</span>
                            </div>
                            <Link 
                                to={`/products/${product.id}`}
                                className="bg-[#293133] text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
                            >
                                {t('common.configure')}
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-hett-dark mb-2">{t('search.noResults')}</h2>
            <p className="text-gray-500 mb-8">
                {t('search.noResultsFor')} "{query}".
                <br />{t('search.suggestion')}
            </p>
            <Link to="/shop" className="inline-block bg-hett-dark text-white px-8 py-4 rounded-full font-bold hover:bg-hett-brown transition-colors">
                {t('search.viewAll')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
