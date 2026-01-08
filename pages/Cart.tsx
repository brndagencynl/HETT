
import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useVerandaEdit } from '../context/VerandaEditContext';
import { useMaatwerkEdit } from '../context/MaatwerkEditContext';
import { useSandwichpanelenEdit } from '../context/SandwichpanelenEditContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, ArrowRight, Plus, Minus, ShoppingBag, Info, Pencil, Loader2, AlertCircle, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatMoney } from '../src/pricing/pricingHelpers';
import { fromCents } from '../src/utils/money';
import ConfigBreakdownPopup, { getCartItemPriceBreakdown, isConfigurableCategory, isVerandaCategory, isMaatwerkVerandaItem } from '../components/ui/ConfigBreakdownPopup';
import { CartItemPreview } from '../components/ui/ConfigPreviewImage';
import { ShippingSection } from '../src/components/cart/ShippingSection';
import { formatShippingPrice } from '../src/services/shippingQuote';
import { beginCheckout, isShopifyConfigured } from '../src/lib/shopify';

const Cart: React.FC = () => {
    const { 
      cart,
      cartProducts,
      shippingLineItem,
      ledLineItem,
      removeFromCart, 
      updateQuantity, 
      total,
      totalCents,
      subtotal,
      subtotalCents,
      clearCart,
      // Shipping - new line item based system
      shippingMode,
      shippingCountry,
      shippingAddress,
      shippingQuote,
      shippingCost,
      shippingCostCents,
      shippingIsValid,
      shippingIsCalculating,
      shippingError,
      isShippingLocked,
      unlockShipping,
      lockShipping,
      grandTotal,
      grandTotalCents,
    } = useCart();
    const { openEditConfigurator } = useVerandaEdit();
    const { openMaatwerkEdit } = useMaatwerkEdit();
    const { openSandwichpanelenEdit } = useSandwichpanelenEdit();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const shippingSectionRef = useRef<HTMLDivElement>(null);
    
    // Checkout state
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // Handle ?editShipping=1 query param
    useEffect(() => {
      if (searchParams.get('editShipping') === '1') {
        // Unlock shipping
        unlockShipping();
        // Remove query param
        searchParams.delete('editShipping');
        setSearchParams(searchParams, { replace: true });
        // Scroll to shipping section
        setTimeout(() => {
          shippingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }, [searchParams, setSearchParams, unlockShipping]);

    // Handle Shopify checkout
    const handleProceedToCheckout = async () => {
      // Check if shipping quote is required
      if (shippingMode === 'delivery' && (shippingCountry === 'BE' || shippingCountry === 'DE') && !shippingIsValid) {
        // Scroll to shipping section if quote is missing for BE/DE
        shippingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      
      // For NL delivery, shipping is free so we can proceed without quote
      // For pickup, always allow
      
      // Check if Shopify is configured
      if (!isShopifyConfigured()) {
        // Fallback to local checkout page
        lockShipping();
        navigate('/afrekenen');
        return;
      }
      
      // Start Shopify checkout
      setIsCheckingOut(true);
      setCheckoutError(null);
      
      try {
        // The cart now includes the shipping line item automatically
        const result = await beginCheckout({
          cartItems: cart, // Full cart including shipping line
          onStart: () => {
            console.log('[Checkout] Starting Shopify checkout...');
            console.log('[Checkout] Shipping line item:', shippingLineItem);
          },
          onCartCreated: (cartId, checkoutUrl) => {
            console.log('[Checkout] Cart created:', cartId);
            console.log('[Checkout] Redirecting to:', checkoutUrl);
          },
          onError: (error) => {
            console.error('[Checkout] Error:', error);
          },
        });
        
        if (result.success && result.checkoutUrl) {
          // Clear local cart before redirect (optional - can also do after return)
          // clearCart();
          // Redirect to Shopify checkout
          window.location.href = result.checkoutUrl;
        } else {
          setCheckoutError(result.error || 'Er is een fout opgetreden bij het afrekenen.');
          setIsCheckingOut(false);
        }
      } catch (error) {
        console.error('[Checkout] Unexpected error:', error);
        setCheckoutError('Er is een onverwachte fout opgetreden. Probeer het opnieuw.');
        setIsCheckingOut(false);
      }
    };

    // Can proceed to checkout?
    // - Pickup: always OK
    // - Delivery NL: always OK (free shipping)
    // - Delivery BE/DE: need valid quote
    const canCheckout = 
      !isCheckingOut && 
      (shippingMode === 'pickup' || 
       shippingCountry === 'NL' || 
       shippingIsValid);

    const VAT_RATE = 0.21;
    const totalInclVat = fromCents(grandTotalCents); // Now includes shipping
    // Items-only VAT calculations in cents (21% VAT => total = ex * 121/100)
    const subtotalExVatCents = Math.round((subtotalCents * 100) / 121);
    const vatAmountCents = subtotalCents - subtotalExVatCents;
    const subtotalExVat = fromCents(subtotalExVatCents);
    const vatAmount = fromCents(vatAmountCents);

  if (cartProducts.length === 0) {
    return (
            <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader title="Winkelwagen" description="Uw winkelwagen is nog leeg." image="https://picsum.photos/1200/400?random=99" />
                <div className="container py-20">
                    <Card className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-hett-dark mb-4">Je winkelwagen is leeg</h2>
            <p className="text-gray-500 mb-8">Voeg producten toe om te beginnen met winkelen.</p>
                        <Link to="/shop" className="btn btn-primary btn-lg">
                            Verder winkelen
                        </Link>
                    </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title="Winkelwagen" description="Controleer uw bestelling." image="https://picsum.photos/1200/400?random=99" />
      
      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Cart Items - only show products, not shipping line */}
            <div className="lg:col-span-2 space-y-4">
                {cartProducts.map((item, idx) => {
                  const unitPriceCents =
                    typeof item.unitPriceCents === 'number'
                      ? item.unitPriceCents
                      : item.quantity > 0
                        ? Math.round(((item.lineTotalCents || 0) / item.quantity))
                        : (item.lineTotalCents || 0);
                  const unitPrice = fromCents(unitPriceCents);
                                        const popupKey = `cart-breakdown-${item.id || idx}`;
                                        const shouldShowInfo = isConfigurableCategory(item);
                                        const isVeranda = isVerandaCategory(item);
                                        const isMaatwerk = isMaatwerkVerandaItem(item);
                                        const isSandwichpanelen = item.type === 'sandwichpanelen';
                                        const basePrice = item.price || 1250;
                                        // Cast to schema's VerandaConfig type for the edit context
                                        const initialConfig = item.config?.category === 'verandas' ? (item.config.data as any) : undefined;
                    return (
                    <Card key={item.id || String(idx)} padding="normal" className="hover:shadow-md transition-shadow">
                        <div className="flex gap-3 md:gap-4">
                            {/* Image - use ConfigPreviewImage for verandas (not maatwerk) */}
                            {isVeranda && !isMaatwerk ? (
                                <CartItemPreview
                                    render={item.render}
                                    config={initialConfig}
                                    fallbackImageUrl={item.imageUrl}
                                    size="lg"
                                    className="md:w-24 md:h-24"
                                />
                            ) : (
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Header row: Title + Actions */}
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div>
                                        <h3 className="font-bold text-hett-dark text-sm md:text-lg leading-tight flex-1 min-w-0">{item.title}</h3>
                                        {/* Maatwerk size display */}
                                        {isMaatwerk && item.maatwerkPayload?.size && (
                                            <div className="text-xs text-[#003878] font-semibold mt-1">
                                                {item.maatwerkPayload.size.width} × {item.maatwerkPayload.size.depth} cm
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action icons - always visible */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Edit icon for regular verandas only (not maatwerk) */}
                                        {isVeranda && !isMaatwerk && (
                                            <button
                                                type="button"
                                                onClick={() => openEditConfigurator({
                                                    cartIndex: idx,
                                                    productTitle: item.title,
                                                    basePrice,
                                                    initialConfig,
                                                })}
                                                className="p-2 text-gray-400 hover:text-hett-primary transition-colors rounded-lg hover:bg-gray-100"
                                                title="Bewerken"
                                                aria-label="Configuratie bewerken"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                        {/* Edit icon for maatwerk verandas */}
                                        {isMaatwerk && (
                                            <button
                                                type="button"
                                                onClick={() => openMaatwerkEdit({ cartIndex: idx, item })}
                                                className="p-2 text-gray-400 hover:text-hett-primary transition-colors rounded-lg hover:bg-gray-100"
                                                title="Bewerken"
                                                aria-label="Maatwerk configuratie bewerken"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}

                                        {/* Edit icon for sandwichpanelen */}
                                        {isSandwichpanelen && item.id && (
                                            <button
                                                type="button"
                                                onClick={() => openSandwichpanelenEdit({ lineId: item.id, item })}
                                                className="p-2 text-gray-400 hover:text-hett-primary transition-colors rounded-lg hover:bg-gray-100"
                                                title="Bewerken"
                                                aria-label="Bewerken"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                        {/* Info popup for configurable items (including maatwerk) */}
                                        {shouldShowInfo && (
                                            <CartItemConfigInfo
                                                key={popupKey}
                                                title={item.title}
                                                breakdown={item}
                                                debugId={item.id || item.slug || item.title}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(idx)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
                                            title="Verwijderen"
                                            aria-label="Verwijderen"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Configuration details */}
                                {item.details && item.details.length > 0 ? (
                                    <div className="text-[11px] md:text-xs text-gray-600 mt-2 space-y-0.5 bg-gray-50 p-2 md:p-3 rounded-md border border-gray-200">
                                        {item.details.map((detail, i) => (
                                            <div key={i} className="flex justify-between gap-2">
                                                <span className="font-medium text-gray-500 truncate">{detail.label}:</span>
                                                <span className="font-semibold text-gray-700 text-right flex-shrink-0">{detail.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                                        {item.selectedSize && <p>Afmeting: {item.selectedSize}</p>}
                                        {item.selectedColor && <p>Kleur: {item.selectedColor}</p>}
                                        {item.selectedRoof && <p>Dak: {item.selectedRoof}</p>}
                                    </div>
                                )}

                                {/* Price and quantity */}
                                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:inline">Aantal</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => updateQuantity(idx, item.quantity - 1)}
                                              disabled={item.quantity <= 1}
                                              aria-label="Minder"
                                              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <Minus size={14} />
                                            </button>
                                            <span className="min-w-[2rem] text-center font-black text-hett-dark text-sm">
                                              {item.quantity}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => updateQuantity(idx, item.quantity + 1)}
                                              aria-label="Meer"
                                              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100"
                                            >
                                              <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Per stuk</div>
                                        <div className="font-bold text-hett-dark text-sm">{formatMoney(unitPrice)}</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mt-1">Regeltotaal</div>
                                        <div className="font-black text-lg md:text-xl text-hett-dark">{formatMoney(item.totalPrice)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
                })}
                
                {/* LED Spots Line (auto-computed, readonly) */}
                {ledLineItem && (
                  <Card padding="normal" className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200/50">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 flex items-center justify-center bg-amber-100 rounded-lg flex-shrink-0">
                        <Zap className="w-8 h-8 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-hett-dark">{ledLineItem.title}</h3>
                        <p className="text-sm text-gray-500">Automatisch berekend op basis van veranda breedte</p>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <span className="text-amber-700 font-medium">{ledLineItem.quantity} spots</span>
                          <span className="text-gray-400">×</span>
                          <span className="text-gray-600">{formatMoney(fromCents(ledLineItem.unitPriceCents))}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Totaal</div>
                        <div className="font-black text-lg md:text-xl text-hett-dark">{formatMoney(fromCents(ledLineItem.lineTotalCents))}</div>
                      </div>
                    </div>
                  </Card>
                )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-4" ref={shippingSectionRef}>
                  {/* Shipping Section - new component */}
                  <ShippingSection />

                  {/* Order Summary Card */}
                  <Card padding="wide">
                    <h3 className="text-xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100">Overzicht</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Producten subtotaal</span>
                            <span className="font-bold">{formatMoney(subtotalExVat)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">BTW (21%)</span>
                            <span className="font-bold">{formatMoney(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Verzendkosten</span>
                            <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                              {shippingMode === 'pickup' 
                                ? 'Gratis' 
                                : shippingIsValid && shippingCost > 0
                                  ? formatShippingPrice(shippingCost)
                                  : shippingCountry === 'NL'
                                    ? 'Gratis'
                                    : '—'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-700">Totaal</span>
                            <span className="text-2xl font-black text-hett-dark">{formatMoney(totalInclVat)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Totaal (incl. BTW en verzending)</p>
                    </div>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={handleProceedToCheckout}
                            disabled={!canCheckout}
                            className={`btn btn-lg w-full flex items-center justify-center gap-2 ${
                              canCheckout 
                                ? 'btn-primary' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isCheckingOut ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                Bezig met afrekenen...
                              </>
                            ) : (
                              <>
                                Afrekenen <ArrowRight size={20} />
                              </>
                            )}
                        </button>
                        {checkoutError && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Afrekenen mislukt</p>
                              <p className="text-red-600">{checkoutError}</p>
                            </div>
                          </div>
                        )}
                        {!canCheckout && shippingMode === 'delivery' && (shippingCountry === 'BE' || shippingCountry === 'DE') && !isCheckingOut && (
                          <p className="text-xs text-red-500 text-center">
                            Bereken eerst je verzendkosten voor België of Duitsland.
                          </p>
                        )}
                        <Link 
                            to="/shop" 
                            className="btn btn-outline btn-md w-full"
                        >
                            Verder winkelen
                        </Link>
                    </div>
                  </Card>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

function CartItemConfigInfo({ title, breakdown, debugId }: { title: string; breakdown: unknown; debugId?: string }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="p-2 text-gray-400 hover:text-hett-primary transition-colors rounded-lg hover:bg-gray-100"
                title="Bekijk configuratie & prijsopbouw"
                aria-label="Bekijk configuratie & prijsopbouw"
            >
                <Info size={16} />
            </button>
            <ConfigBreakdownPopup
                open={open}
                onOpenChange={setOpen}
                productTitle={title}
                breakdown={breakdown}
                debugId={debugId}
            />
        </>
    );
}

export default Cart;
