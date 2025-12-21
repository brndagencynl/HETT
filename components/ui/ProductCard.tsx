
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Product } from '../../types';
import { isConfigOnly } from '../../utils/productRules';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const configOnly = isConfigOnly(product);
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        // Default options for direct add
        addToCart(product, 1, {
            color: product.options?.colors?.[0] || 'Standaard',
            size: product.options?.sizes?.[0] || 'Standaard'
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-md transition-all flex flex-col group overflow-hidden">
            <div className="px-2 py-1.5 flex justify-end">
                {/* Hide Wishlist Heart for config-only products to prevent unconfigured adds */}
                {!configOnly && (
                    <button className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Aan verlanglijst toevoegen">
                        <Heart size={18} />
                    </button>
                )}
            </div>

            <Link to={`/product/${product.id}`} className="relative flex items-center justify-center overflow-hidden bg-gray-50 h-32 sm:h-64">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                {product.isBestseller && (
                    <div className="absolute top-2 left-2 bg-hett-secondary text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase">Populair</div>
                )}
            </Link>

            <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
                <Link to={`/product/${product.id}`} className="block mb-1 sm:mb-2">
                    <h3 className="text-hett-dark font-bold text-[13px] sm:text-base leading-tight hover:underline line-clamp-2 min-h-[2.4rem] sm:min-h-[3rem]">
                        {product.title}
                    </h3>
                </Link>

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
                    {/* Primary Action Button */}
                    {configOnly ? (
                        <Link
                            to={`/product/${product.id}`}
                            className="w-full rounded-md py-2 sm:py-3 text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-colors bg-hett-dark text-white hover:bg-hett-primary"
                        >
                            Stel samen
                        </Link>
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
