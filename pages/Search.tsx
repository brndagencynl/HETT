
import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import PageHeader from '../components/PageHeader';
import { Search as SearchIcon, Check } from 'lucide-react';
import { filterVisibleProducts } from '../src/catalog/productVisibility';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Filter to only show public products first
  const visibleProducts = useMemo(() => filterVisibleProducts(PRODUCTS), []);

  const results = visibleProducts.filter(product => 
    product.title.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={`Zoekresultaten voor "${query}"`}
        subtitle="Zoeken"
        description={`${results.length} resultaten gevonden`}
        image="https://picsum.photos/1200/400?random=search"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product) => (
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
                                Stel samen
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
            <h2 className="text-2xl font-bold text-hett-dark mb-2">Geen resultaten gevonden</h2>
            <p className="text-gray-500 mb-8">
                We konden geen producten vinden die overeenkomen met "{query}".
                <br />Probeer een andere zoekterm of bekijk onze categorieën.
            </p>
            <Link to="/shop" className="inline-block bg-hett-dark text-white px-8 py-4 rounded-full font-bold hover:bg-hett-brown transition-colors">
                Bekijk alle producten
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
