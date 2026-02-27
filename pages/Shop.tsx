import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../constants';
import { Filter, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Product } from '../types';
import { getAllProducts } from '../src/lib/shopify';
import ProductCard from '../components/ui/ProductCard';

const Shop: React.FC = () => {
    const { t } = useTranslation();
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
            <PageHeader
                title={t('shop.title')}
                subtitle={t('shop.subtitle')}
                description={t('shop.description')}
                image="https://picsum.photos/1200/400?random=shop"
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">

                    {/* Filters Sidebar */}
                    <div className="hidden lg:block">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-32">
                            <div className="flex items-center gap-2 mb-6">
                                <Filter size={20} className="text-hett-brown" />
                                <h3 className="font-bold text-hett-dark">{t('shop.filters')}</h3>
                            </div>


                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold mb-3">{t('shop.category')}</h4>
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
                                {loading ? '...' : products.length} {t('shop.productsCount')}
                            </div>
                            <select className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm font-bold outline-none">
                                <option>{t('shop.sortPopular')}</option>
                                <option>{t('shop.sortPriceLow')}</option>
                                <option>{t('shop.sortPriceHigh')}</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-hett-secondary" />
                                <span className="ml-3 text-hett-muted font-medium">{t('shop.loading')}</span>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <p className="text-hett-muted font-medium">{t('shop.noProducts')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
