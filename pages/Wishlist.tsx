
import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import { Trash2, ShoppingCart, Heart, ArrowRight, Check } from 'lucide-react';

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
      // Default config for direct add from wishlist
      addToCart(product, 1, {
          color: product.options?.colors?.[0] || 'Standaard',
          size: product.options?.sizes?.[0] || 'Standaard',
          roof: product.options?.roofTypes?.[0] || 'Standaard'
      });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Mijn Favorieten"
        subtitle="Wishlist"
        description="Bewaar je favoriete items voor later."
        image="https://images.unsplash.com/photo-1513161455079-7dc1bad1563f?q=80&w=1788&auto=format&fit=crop"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {wishlist.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                    <Heart size={32} />
                </div>
                <h2 className="text-2xl font-bold text-hett-dark mb-4">Je verlanglijstje is nog leeg</h2>
                <p className="text-gray-500 mb-8">
                    Sla je favoriete items op om ze later makkelijk terug te vinden.
                </p>
                <Link to="/shop" className="inline-block bg-hett-dark text-white px-8 py-4 rounded-lg font-bold hover:bg-hett-brown transition-colors">
                    Bekijk onze producten
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map(product => (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group flex flex-col hover:shadow-md transition-shadow">
                        <Link to={`/product/${product.id}`} className="relative h-64 overflow-hidden block bg-gray-100">
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <button 
                                onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-colors border border-gray-100"
                                title="Verwijderen"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Link>
                        <div className="p-6 flex flex-col flex-grow">
                            <Link to={`/product/${product.id}`} className="block mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">{product.category}</span>
                                <h3 className="font-bold text-hett-dark text-lg leading-tight hover:underline line-clamp-2">{product.title}</h3>
                            </Link>
                            
                            <div className="flex items-center gap-2 text-green-600 text-xs font-bold mb-4">
                                <Check size={14} strokeWidth={3} /> Op voorraad
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="font-black text-xl text-hett-dark">€{product.price}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">incl. BTW</span>
                                </div>
                                <button 
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-hett-dark text-white p-3 rounded-lg hover:bg-hett-brown transition-colors flex items-center gap-2 text-sm font-bold flex-grow justify-center"
                                >
                                    <ShoppingCart size={18} /> In winkelwagen
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
