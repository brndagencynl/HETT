
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { searchProducts } from '../src/lib/shopify';
import { Product } from '../types';
import ProductCard from '../src/components/products/ProductCard';

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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-md shadow-sm border border-gray-100">
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
