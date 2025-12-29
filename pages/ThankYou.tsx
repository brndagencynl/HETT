/**
 * Thank You Page (Bedankt)
 * 
 * Displayed after successful Shopify checkout completion.
 * Shopify redirects here after payment (configure in Shopify Admin).
 * 
 * Setup in Shopify Admin:
 * Settings → Checkout → Order status page → Additional content or redirect
 * Add: <script>window.location.href = 'https://your-domain.com/#/bedankt';</script>
 * 
 * Or use the default Shopify thank you page and just clear cart on next visit.
 */

import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resetCart as resetShopifyCart } from '../src/lib/shopify';
import PageHeader from '../components/PageHeader';
import { Card } from '../components/ui/card';

const ThankYou: React.FC = () => {
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    
    // Optional: Get order info from URL params (if Shopify passes them)
    const orderId = searchParams.get('order_id');
    const orderNumber = searchParams.get('order_number');
    
    // Clear local cart on mount (user completed checkout)
    useEffect(() => {
        // Clear local React cart
        clearCart();
        // Reset Shopify cart ID
        resetShopifyCart();
        console.log('[ThankYou] Cart cleared after successful checkout');
    }, [clearCart]);
    
    return (
        <div className="min-h-screen bg-[#f6f8fa] font-sans">
            <PageHeader 
                title="Bedankt voor uw bestelling!" 
                description="Uw bestelling is succesvol geplaatst." 
                image="https://picsum.photos/1200/400?random=thankyou" 
            />
            
            <div className="container py-12 md:py-20">
                <Card padding="wide" className="max-w-2xl mx-auto text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                    </div>
                    
                    {/* Message */}
                    <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">
                        Bedankt voor uw bestelling!
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        Uw bestelling is succesvol geplaatst. U ontvangt binnen enkele minuten een bevestiging per e-mail.
                    </p>
                    
                    {/* Order Info (if available) */}
                    {(orderId || orderNumber) && (
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 inline-block">
                            <p className="text-sm text-gray-500 mb-1">Bestelnummer</p>
                            <p className="text-xl font-black text-hett-primary">
                                #{orderNumber || orderId}
                            </p>
                        </div>
                    )}
                    
                    {/* Next Steps */}
                    <div className="border-t border-gray-100 pt-8 mb-8">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Wat gebeurt er nu?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-hett-light flex items-center justify-center flex-shrink-0">
                                    <span className="text-hett-primary font-bold">1</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Bevestigingsmail</p>
                                    <p className="text-sm text-gray-500">U ontvangt een e-mail met uw bestelling.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-hett-light flex items-center justify-center flex-shrink-0">
                                    <span className="text-hett-primary font-bold">2</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Verwerking</p>
                                    <p className="text-sm text-gray-500">We bereiden uw bestelling voor.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-hett-light flex items-center justify-center flex-shrink-0">
                                    <Package size={18} className="text-hett-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">Verzending</p>
                                    <p className="text-sm text-gray-500">U ontvangt een track & trace code.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/shop" 
                            className="btn btn-primary btn-lg inline-flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={20} />
                            Verder winkelen
                        </Link>
                        <Link 
                            to="/" 
                            className="btn btn-outline btn-lg inline-flex items-center justify-center gap-2"
                        >
                            Naar homepage <ArrowRight size={20} />
                        </Link>
                    </div>
                </Card>
                
                {/* Support Info */}
                <div className="text-center mt-12">
                    <p className="text-gray-500 text-sm">
                        Vragen over uw bestelling?{' '}
                        <Link to="/contact" className="text-hett-primary font-bold hover:underline">
                            Neem contact met ons op
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
