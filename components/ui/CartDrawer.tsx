import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Pencil, Info, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useVerandaEdit } from '../../context/VerandaEditContext';
import { useMaatwerkEdit } from '../../context/MaatwerkEditContext';
import { useSandwichpanelenEdit } from '../../context/SandwichpanelenEditContext';
import { isConfigOnly } from '../../utils/productRules';
import { isVerandaCategory, isMaatwerkVerandaItem } from './ConfigBreakdownPopup';
import { CartItemPreview } from './ConfigPreviewImage';
import ConfigBreakdownPopup from './ConfigBreakdownPopup';
import { beginCheckout, isShopifyConfigured } from '../../src/lib/shopify';
import { formatEUR } from '../../src/utils/money';

const MotionDiv = motion.div as any;

const CartDrawer: React.FC = () => {
    const { isCartOpen, closeCart, cart, cartProducts, removeFromCart, totalCents, subtotalCents, grandTotalCents, shippingCostCents, shippingMode, shippingIsValid } = useCart();
    const { openEditConfigurator } = useVerandaEdit();
    const { openMaatwerkEdit } = useMaatwerkEdit();
    const { openSandwichpanelenEdit } = useSandwichpanelenEdit();
    const navigate = useNavigate();
    const drawerRef = useRef<HTMLDivElement>(null);
    const [breakdownPopupKey, setBreakdownPopupKey] = useState<string | null>(null);
    
    // Checkout state
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
    
    // Reset checkout state when drawer opens
    useEffect(() => {
        if (isCartOpen) {
            setCheckoutError(null);
            setIsCheckingOut(false);
        }
    }, [isCartOpen]);
    
    // Handle Shopify checkout from drawer
    const handleCheckout = async () => {
        // Check if Shopify is configured
        if (!isShopifyConfigured()) {
            // Fallback to cart page
            closeCart();
            navigate('/cart');
            return;
        }
        
        // Start Shopify checkout
        setIsCheckingOut(true);
        setCheckoutError(null);
        
        try {
            const result = await beginCheckout({
                cartItems: cart,
                onError: (error) => {
                    console.error('[CartDrawer] Checkout error:', error);
                },
            });
            
            if (result.success && result.checkoutUrl) {
                // Redirect to Shopify checkout
                window.location.href = result.checkoutUrl;
            } else {
                setCheckoutError(result.error || 'Er is een fout opgetreden.');
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error('[CartDrawer] Unexpected error:', error);
            setCheckoutError('Er is een onverwachte fout opgetreden.');
            setIsCheckingOut(false);
        }
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
                        className="fixed inset-y-0 right-0 z-[101] w-full md:w-[480px] bg-[#eff6ff] shadow-2xl flex flex-col font-sans"
                        ref={drawerRef}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-hett-primary" />
                                <h2 className="text-xl font-black text-hett-dark">Winkelwagen</h2>
                                <span className="bg-hett-light text-hett-primary text-xs font-bold px-2 py-1 rounded-full">{cartProducts.length} items</span>
                            </div>
                            <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cartProducts.length === 0 ? (
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
                cartProducts.map((item, index) => {
                                    const isVeranda = isVerandaCategory(item);
                                    const isMaatwerk = isMaatwerkVerandaItem(item);
                                    const isSandwichpanelen = item.type === 'sandwichpanelen';
                                    const basePrice = item.price || 1250; // fallback base price
                                    const initialConfig = item.config?.category === 'verandas' ? item.config.data : undefined;
                                    const popupKey = `drawer-breakdown-${item.id || index}`;
                                    
                                    return (
                                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative group">
                                        {/* Product image - use ConfigPreviewImage for verandas */}
                                        {isVeranda && !isMaatwerk ? (
                                            <CartItemPreview
                                                render={item.render}
                                                config={initialConfig}
                                                fallbackImageUrl={item.imageUrl}
                                                size="md"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                                    <h4 className="font-bold text-sm text-hett-dark line-clamp-2">{item.title}</h4>
                                                    {/* Edit icon for regular verandas only (not maatwerk) */}
                                                    {isVeranda && !isMaatwerk && (
                                                        <button
                                                            onClick={() => openEditConfigurator({
                                                                cartIndex: index,
                                                                productTitle: item.title,
                                                                basePrice,
                                                                initialConfig,
                                                            })}
                                                            className="flex-shrink-0 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-gray-400 hover:text-hett-primary hover:bg-hett-light rounded-md transition-colors"
                                                            title="Bewerken"
                                                            aria-label="Configuratie bewerken"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    {/* Edit + Info icons for maatwerk items */}
                                                    {isMaatwerk && (
                                                        <>
                                                            <button
                                                                onClick={() => openMaatwerkEdit({ cartIndex: index, item })}
                                                                className="flex-shrink-0 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-gray-400 hover:text-hett-primary hover:bg-hett-light rounded-md transition-colors"
                                                                title="Bewerken"
                                                                aria-label="Maatwerk configuratie bewerken"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => setBreakdownPopupKey(popupKey)}
                                                                className="flex-shrink-0 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-gray-400 hover:text-hett-primary hover:bg-hett-light rounded-md transition-colors"
                                                                title="Configuratie details"
                                                                aria-label="Bekijk configuratie details"
                                                            >
                                                                <Info size={14} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Edit icon for sandwichpanelen items */}
                                                    {isSandwichpanelen && item.id && (
                                                        <button
                                                            onClick={() => openSandwichpanelenEdit({ lineId: item.id, item })}
                                                            className="flex-shrink-0 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-gray-400 hover:text-hett-primary hover:bg-hett-light rounded-md transition-colors"
                                                            title="Bewerken"
                                                            aria-label="Bewerken"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Maatwerk size display */}
                                            {isMaatwerk && item.maatwerkPayload?.size && (
                                                <div className="mb-2 text-xs text-[#003878] font-semibold">
                                                    {item.maatwerkPayload.size.width} × {item.maatwerkPayload.size.depth} cm
                                                </div>
                                            )}

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
                                                <span className="font-black text-hett-dark">{formatEUR(item.lineTotalCents || 0, 'cents')}</span>
                                            </div>
                                        </div>
                                        {/* Breakdown popup for maatwerk items */}
                                        {isMaatwerk && (
                                            <ConfigBreakdownPopup
                                                uniqueKey={popupKey}
                                                isOpen={breakdownPopupKey === popupKey}
                                                onClose={() => setBreakdownPopupKey(null)}
                                                item={item}
                                            />
                                        )}                                    </div>
                                );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {cartProducts.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-500 font-bold text-sm">Subtotaal (incl. BTW)</span>
                                    <span className="text-3xl font-black text-hett-dark">{formatEUR(subtotalCents, 'cents')}</span>
                                </div>
                                {checkoutError && (
                                    <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        <p>{checkoutError}</p>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors ${
                                            isCheckingOut
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-hett-primary text-white hover:bg-hett-dark shadow-hett-primary/20'
                                        }`}
                                    >
                                        {isCheckingOut ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Bezig...
                                            </>
                                        ) : (
                                            <>
                                                Afrekenen <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={closeCart}
                                        disabled={isCheckingOut}
                                        className="w-full py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-gray-300 hover:text-gray-800 transition-colors disabled:opacity-50"
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
