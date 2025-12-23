
import React from 'react';
import { useCart } from '../context/CartContext';
import { useVerandaEdit } from '../context/VerandaEditContext';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Plus, Minus, ShoppingBag, Info, Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatMoney } from '../src/pricing/pricingHelpers';
import ConfigBreakdownPopup, { getCartItemPriceBreakdown, isConfigurableCategory, isVerandaCategory } from '../components/ui/ConfigBreakdownPopup';

const Cart: React.FC = () => {
    const { cart, removeFromCart, updateQuantity, total } = useCart();
    const { openEditConfigurator } = useVerandaEdit();

    const VAT_RATE = 0.21;
    const totalInclVat = total;
    const subtotalExVat = Math.round(totalInclVat / (1 + VAT_RATE));
    const vatAmount = Math.round(totalInclVat - subtotalExVat);

  if (cart.length === 0) {
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
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
                {cart.map((item, idx) => {
                    const unitPrice = item.quantity > 0 ? item.totalPrice / item.quantity : item.totalPrice;
                                        const popupKey = `cart-breakdown-${item.id || idx}`;
                                        const shouldShowInfo = isConfigurableCategory(item);
                                        const isVeranda = isVerandaCategory(item);
                                        const basePrice = item.price || 1250;
                                        // Cast to schema's VerandaConfig type for the edit context
                                        const initialConfig = item.config?.category === 'verandas' ? (item.config.data as any) : undefined;
                    return (
                    <Card key={item.id || String(idx)} padding="normal" className="hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                            {/* Image */}
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex items-start gap-2 min-w-0 pr-4">
                                                                            <h3 className="font-bold text-hett-dark text-base md:text-lg">{item.title}</h3>
                                                                            {/* Edit icon for verandas only */}
                                                                            {isVeranda && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => openEditConfigurator({
                                                                                        cartIndex: idx,
                                                                                        productTitle: item.title,
                                                                                        basePrice,
                                                                                        initialConfig,
                                                                                    })}
                                                                                    className="relative z-10 text-gray-400 hover:text-hett-primary pointer-events-auto min-w-[44px] min-h-[44px]"
                                                                                    title="Bewerken"
                                                                                    aria-label="Configuratie bewerken"
                                                                                >
                                                                                    <Pencil size={18} />
                                                                                </Button>
                                                                            )}
                                                                            {shouldShowInfo ? (
                                                                                <CartItemConfigInfo
                                                                                    key={popupKey}
                                                                                    title={item.title}
                                                                                    breakdown={item}
                                                                                    debugId={item.id || item.slug || item.title}
                                                                                />
                                                                            ) : null}
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeFromCart(idx)}
                                                                            className="text-gray-500 hover:text-red-500"
                                                                            title="Verwijderen"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </Button>
                                </div>
                                
                                {/* Configuration details */}
                                {item.details && item.details.length > 0 ? (
                                    <div className="text-xs text-gray-600 mt-2 space-y-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                                        {item.details.map((detail, i) => (
                                            <div key={i} className="flex justify-between gap-4">
                                                <span className="font-medium text-gray-500">{detail.label}:</span>
                                                <span className="font-semibold text-gray-700">{detail.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 space-y-0.5">
                                        {item.selectedSize && <p>Afmeting: {item.selectedSize}</p>}
                                        {item.selectedColor && <p>Kleur: {item.selectedColor}</p>}
                                        {item.selectedRoof && <p>Dak: {item.selectedRoof}</p>}
                                    </div>
                                )}

                                {/* Price and quantity */}
                                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Aantal</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => updateQuantity(idx, item.quantity - 1)}
                                              disabled={item.quantity <= 1}
                                              aria-label="Minder"
                                            >
                                              <Minus size={16} />
                                            </Button>
                                            <span className="min-w-[2.75rem] text-center font-black text-hett-dark">
                                              {item.quantity}
                                            </span>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => updateQuantity(idx, item.quantity + 1)}
                                              aria-label="Meer"
                                            >
                                              <Plus size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Per stuk</div>
                                        <div className="font-extrabold text-hett-dark">{formatMoney(unitPrice)}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-2">Regeltotaal</div>
                                        <div className="font-black text-xl text-hett-dark">{formatMoney(item.totalPrice)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
                })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-32">
                  <Card padding="wide">
                    <h3 className="text-xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100">Overzicht</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Subtotaal</span>
                            <span className="font-bold">{formatMoney(subtotalExVat)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">BTW (21%)</span>
                            <span className="font-bold">{formatMoney(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="font-medium">Verzending</span>
                            <span className="text-green-600 font-bold">Gratis</span>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-700">Totaal</span>
                            <span className="text-2xl font-black text-hett-dark">{formatMoney(totalInclVat)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Totaal (incl. BTW)</p>
                    </div>
                    
                    <div className="space-y-3">
                        <Link 
                            to="/afrekenen" 
                            className="btn btn-primary btn-lg w-full"
                        >
                            Verder naar afrekenen <ArrowRight size={20} />
                        </Link>
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
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="relative z-10 text-hett-dark hover:text-hett-primary pointer-events-auto"
                onClick={() => setOpen(true)}
                title="Bekijk configuratie & prijsopbouw"
                aria-label="Bekijk configuratie & prijsopbouw"
            >
                <Info size={18} />
            </Button>
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
