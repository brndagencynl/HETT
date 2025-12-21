import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { isConfigOnly } from '../../utils/productRules';

const MotionDiv = motion.div as any;

const CartDrawer: React.FC = () => {
    const { isCartOpen, closeCart, cart, removeFromCart, total, addToCart } = useCart();
    const navigate = useNavigate();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeCart();
        };
        if (isCartOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen, closeCart]);

    const handleQuantityChange = (item: any, change: number) => {
        if (item.quantity + change < 1) return;
    };

    if (!isCartOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <MotionDiv
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[101] w-full md:w-[480px] bg-[#EDF0F2] shadow-2xl flex flex-col font-sans"
                        ref={drawerRef}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-hett-primary" />
                                <h2 className="text-xl font-black text-hett-dark">Winkelwagen</h2>
                                <span className="bg-hett-light text-hett-primary text-xs font-bold px-2 py-1 rounded-full">{cart.length} items</span>
                            </div>
                            <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <ShoppingBag size={64} className="mb-4 text-gray-300" />
                                    <p className="text-lg font-bold text-gray-600 mb-6">Je winkelwagen is momenteel leeg!</p>
                                    <button
                                        onClick={() => { closeCart(); navigate('/shop'); }}
                                        className="bg-hett-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-hett-dark transition-colors"
                                    >
                                        Begin met winkelen
                                    </button>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative group">
                                        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm text-hett-dark line-clamp-2 pr-6">{item.title}</h4>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Config Details */}
                                            {item.displayConfigSummary ? (
                                                <div className="mb-2 p-2 bg-gray-50 rounded text-[10px] text-gray-500 font-medium">
                                                    {item.displayConfigSummary}
                                                    {/* Also show details if needed, or summary replaces it? */}
                                                    {/* item.configurationLabel is legacy fallback */}
                                                </div>
                                            ) : isConfigOnly(item) && (
                                                <div className="mb-2">
                                                    {item.details ? (
                                                        <div className="text-[10px] text-gray-500 space-y-0.5 border-l-2 border-hett-light pl-2">
                                                            {item.details.map((d, i) => (
                                                                <div key={i}><span className="font-semibold">{d.label}:</span> {d.value}</div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                            <ShieldCheck size={12} /> Configuratie vereist
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                    <span>Aantal: {item.quantity}</span>
                                                </div>
                                                <span className="font-black text-hett-dark">€ {item.totalPrice.toLocaleString()},-</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-500 font-bold text-sm">Subtotaal (incl. BTW)</span>
                                    <span className="text-3xl font-black text-hett-dark">€ {total.toLocaleString()},-</span>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => { closeCart(); navigate('/checkout'); }}
                                        className="w-full py-4 bg-hett-primary text-white rounded-xl font-bold text-lg hover:bg-hett-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-hett-primary/20"
                                    >
                                        Afrekenen <ArrowRight size={20} />
                                    </button>
                                    <button
                                        onClick={closeCart}
                                        className="w-full py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-gray-300 hover:text-gray-800 transition-colors"
                                    >
                                        Verder winkelen
                                    </button>
                                </div>
                            </div>
                        )}
                    </MotionDiv>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CartDrawer;
