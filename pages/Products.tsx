import React from 'react';
import { PRODUCTS } from '../constants';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ui/ProductCard';

const Products: React.FC = () => {
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

export default Products;