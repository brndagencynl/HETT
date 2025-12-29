import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '../constants';
import { Filter, Check, Star, Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Product } from '../types';
import { filterVisibleProducts } from '../src/catalog/productVisibility';

import ProductCard from '../components/ui/ProductCard';

const Shop: React.FC = () => {
    // Filter to only show public products (excludes hidden anchor products)
    const visibleProducts = useMemo(() => filterVisibleProducts(PRODUCTS), []);

    return (
        <div className="min-h-screen bg-[#f6f8fa] font-sans">
            <PageHeader
                title="Webshop"
                subtitle="Catalogus"
                description="Bekijk ons volledige assortiment veranda's, glazen schuifwanden en accessoires."
                image="https://picsum.photos/1200/400?random=shop"
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">

                    {/* Filters Sidebar */}
                    <div className="hidden lg:block">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                            <div className="flex items-center gap-2 mb-6">
                                <Filter size={20} className="text-hett-brown" />
                                <h3 className="font-bold text-hett-dark">Filters</h3>
                            </div>


                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold mb-3">Categorie</h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        {Object.values(CATEGORIES).map(c => (
                                            <li key={c.path}>
                                                <Link to={c.path} className="hover:text-hett-brown transition-colors">{c.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8">
                            <div className="text-sm text-gray-500 font-bold">
                                {visibleProducts.length} Producten
                            </div>
                            <select className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm font-bold outline-none">
                                <option>Sorteer op: Populair</option>
                                <option>Prijs: Laag - Hoog</option>
                                <option>Prijs: Hoog - Laag</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                            {visibleProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
