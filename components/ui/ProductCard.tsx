import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Placeholder for wishlist logic
        console.log('Toggle wishlist', product.id);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product, 1, {
            color: product.options?.colors?.[0] || 'Standaard',
            size: product.options?.sizes?.[0] || 'Standaard'
        });
    };

    return (
        <div
            onClick={handleCardClick}
            className={`bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-md transition-all flex flex-col group overflow-hidden cursor-pointer ${viewMode === 'list' ? 'md:flex-row' : ''}`}
        >
            {/* Action Bar (Wishlist) */}
            <div className={`px-2 py-1.5 flex justify-end ${viewMode === 'list' ? 'hidden' : 'absolute top-0 right-0 z-10 w-full'}`}>
                <button
                    onClick={handleWishlistClick}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 bg-white/80 backdrop-blur-sm rounded-bl-lg"
                    title="Aan verlanglijst toevoegen"
                >
                    <Heart size={18} />
                </button>
            </div>

            {/* Image Section */}
            <div className={`relative flex items-center justify-center overflow-hidden bg-gray-50 ${viewMode === 'list' ? 'w-full md:w-64 p-4' : 'h-32 sm:h-64'}`}>
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
                {product.isBestseller && (
                    <div className="absolute top-2 left-2 bg-hett-secondary text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase z-10">
                        Populair
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-2.5 sm:p-5 flex flex-col flex-grow relative bg-white">
                {/* List View Heart */}
                {viewMode === 'list' && (
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={handleWishlistClick}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                            <Heart size={18} />
                        </button>
                    </div>
                )}

                <div className="block mb-1 sm:mb-2">
                    <h3 className="text-hett-dark font-bold text-[13px] sm:text-base leading-tight group-hover:underline line-clamp-2 min-h-[2.4rem] sm:min-h-[3rem]">
                        {product.title}
                    </h3>
                </div>

                <div className="flex items-center gap-1 mb-2 sm:mb-4">
                    <div className="flex text-yellow-400">
                        <Star size={10} fill="currentColor" />
                    </div>
                    <span className="text-[9px] sm:text-xs text-gray-400 font-bold">({product.reviewCount || 0})</span>
                </div>

                <div className="mb-3 sm:mb-4">
                    <div className="text-base sm:text-2xl font-black text-hett-dark leading-none">€ {product.price},-</div>
                </div>

                <div className="mt-auto">
                    {product.requiresConfiguration ? (
                        <button
                            className="w-full rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-colors bg-hett-dark text-white hover:bg-hett-primary"
                        >
                            Stel samen
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="w-full rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-colors bg-hett-primary text-white hover:bg-hett-dark"
                        >
                            In winkelwagen
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
