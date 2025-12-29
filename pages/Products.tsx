import React, { useMemo } from 'react';
import { PRODUCTS } from '../constants';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import { filterVisibleProducts } from '../src/catalog/productVisibility';

const Products: React.FC = () => {
  // Filter to only show public products (excludes hidden anchor products)
  const visibleProducts = useMemo(() => filterVisibleProducts(PRODUCTS), []);

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      {/* Header */}
      <PageHeader
        title="Producten"
        subtitle="Onze Collectie"
        description="Hoogwaardige panelen en profielen voor de professionele bouwer. Bekijk ons exclusieve assortiment."
        image="/product-kroc.jpg"
        action={{ label: "Bekijk Configurator", link: "/configurator" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No Results */}
        {visibleProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Geen producten gevonden.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;