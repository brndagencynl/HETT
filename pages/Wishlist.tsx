
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import PageHeader from '../components/PageHeader';
import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '../src/components/products/ProductCard';

const Wishlist: React.FC = () => {
    const { t } = useTranslation();
    const { wishlist, removeFromWishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-[#f6f8fa] font-sans">
            <PageHeader
                title={t('wishlist.title')}
                subtitle={t('wishlist.subtitle')}
                description={t('wishlist.description')}
                image="https://images.unsplash.com/photo-1513161455079-7dc1bad1563f?q=80&w=1788&auto=format&fit=crop"
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Heart size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-hett-dark mb-4">{t('wishlist.empty')}</h2>
                        <p className="text-gray-500 mb-8">
                            {t('wishlist.emptySubtitle')}
                        </p>
                        <Link to="/shop" className="inline-block bg-hett-dark text-white px-8 py-4 rounded-lg font-bold hover:bg-hett-brown transition-colors">
                            {t('common.viewProducts')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                actionSlot={
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(product.id); }}
                                        className="w-9 h-9 bg-white/90 backdrop-blur rounded flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors border border-[var(--border)]"
                                        title="Verwijderen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
