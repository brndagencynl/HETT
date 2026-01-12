import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import { getAllProducts } from '../src/lib/shopify';
import { Product } from '../types';
import { Loader2 } from 'lucide-react';

const Products: React.FC = () => {
  // Shopify products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Shopify
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const shopifyProducts = await getAllProducts();
        setProducts(shopifyProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      {/* Header */}
      <PageHeader
        title="Producten"
        subtitle="Onze Collectie"
        description="Hoogwaardige panelen en profielen voor de professionele bouwer. Bekijk ons exclusieve assortiment."
        image="/product-kroc.webp"
        action={{ label: "Bekijk Configurator", link: "/configurator" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-hett-secondary" />
            <span className="ml-3 text-hett-muted font-medium">Producten laden...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Geen producten gevonden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;