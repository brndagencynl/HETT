
import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useVerandaEdit } from '../context/VerandaEditContext';
import { extractWidthFromHandle, extractWidthFromSize } from '../src/services/addons/led';
import { useMaatwerkEdit } from '../context/MaatwerkEditContext';
import { useSandwichpanelenEdit } from '../context/SandwichpanelenEditContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Info, Pencil, AlertTriangle, ShoppingCart, ExternalLink, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';
import { Card } from '../components/ui/card';
import Input from '../components/ui/input';
import { formatMoney } from '../src/pricing/pricingHelpers';
import { fromCents } from '../src/utils/money';
import ConfigBreakdownPopup, { getCartItemPriceBreakdown, isConfigurableCategory, isVerandaCategory, isMaatwerkVerandaItem } from '../components/ui/ConfigBreakdownPopup';
import { CartItemPreview } from '../components/ui/ConfigPreviewImage';
import { formatShippingCost, getAddressSummary, COUNTRY_LABELS } from '../src/services/addressValidation';
import { beginCheckout, isShopifyConfigured } from '../src/lib/shopify';

type CheckoutForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    postalCode: string;
    city: string;
    notes: string;
};

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { 
    cart, 
    total, 
    totalCents,
    clearCart, 
    shippingMode, 
    shippingAddress,
    shippingCountry,
    shippingCost, 
    shippingIsValid,
    grandTotal, 
    grandTotalCents,
    lockShipping 
  } = useCart();
  const { openEditConfigurator } = useVerandaEdit();
    const { openMaatwerkEdit } = useMaatwerkEdit();
        const { openSandwichpanelenEdit } = useSandwichpanelenEdit();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Lock shipping on checkout page mount
  useEffect(() => {
    if (cart.length > 0 && shippingIsValid) {
      lockShipping();
    }
  }, []);

  // Handle Shopify checkout redirect
  const handleShopifyCheckout = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    setCheckoutError(null);
    
    try {
      const result = await beginCheckout({
        cartItems: cart,
        onError: (error) => {
          console.error('[Checkout] Error:', error);
        },
      });
      
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setCheckoutError(result.error || t('checkout.error'));
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error('Failed to redirect to Shopify checkout:', error);
      setCheckoutError(t('checkout.unexpectedError'));
      setIsRedirecting(false);
    }
  };

  // Check if Shopify is configured
  const shopifyEnabled = isShopifyConfigured();

  // Guard: If shipping is not valid, show blocking notice
  if (cart.length > 0 && !shippingIsValid) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader title={t('checkout.title')} description={t('checkout.description')} image="https://picsum.photos/1200/400?random=98" />
        
        <div className="container py-12 md:py-20">
          <Card padding="wide" className="max-w-lg mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={32} className="text-amber-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-[#003878] mb-4">{t('checkout.addressRequired')}</h2>
            <p className="text-gray-600 mb-8">
              {t('checkout.addressRequiredDesc')}
            </p>
            <Link 
              to="/cart" 
              className="btn btn-primary btn-lg inline-flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              {t('checkout.goToCart')}
            </Link>
          </Card>
        </div>
      </div>
    );
  }

    const [form, setForm] = useState<CheckoutForm>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        postalCode: '',
        city: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const VAT_RATE = 0.21;
    const totalInclVat = fromCents(grandTotalCents); // Now includes shipping
    // Items-only VAT calculations in cents (21% VAT => total = ex * 121/100)
    const subtotalExVatCents = Math.round((totalCents * 100) / 121);
    const vatAmountCents = totalCents - subtotalExVatCents;
    const subtotalExVat = fromCents(subtotalExVatCents);
    const vatAmount = fromCents(vatAmountCents);

    const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validate = (): Partial<Record<keyof CheckoutForm, string>> => {
        const next: Partial<Record<keyof CheckoutForm, string>> = {};
        if (!form.firstName.trim()) next.firstName = t('checkout.validation.nameRequired');
        if (!form.lastName.trim()) next.lastName = t('checkout.validation.lastNameRequired');
        if (!form.email.trim() || !isEmailValid(form.email)) next.email = t('checkout.validation.emailInvalid');
        if (!form.phone.trim()) next.phone = t('checkout.validation.phoneRequired');
        if (!form.street.trim()) next.street = t('checkout.validation.streetRequired');
        if (!form.postalCode.trim()) next.postalCode = t('checkout.validation.postalCodeRequired');
        if (!form.city.trim()) next.city = t('checkout.validation.cityRequired');
        return next;
    };

    const handleFinishOrder = async () => {
        if (isSubmitting) return;
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        // Stub: simulate order processing
        setTimeout(() => {
            clearCart();
            navigate('/order-received');
        }, 650);
    };

    const orderItems = useMemo(() => {
        return cart.map((item) => {
        const unitPriceCents =
          typeof item.unitPriceCents === 'number'
            ? item.unitPriceCents
            : item.quantity > 0
              ? Math.round(((item.lineTotalCents || 0) / item.quantity))
              : (item.lineTotalCents || 0);
        const unitPrice = fromCents(unitPriceCents);
            return { item, unitPrice };
        });
    }, [cart]);

    if (cart.length === 0) {
        return <Navigate to="/cart" replace />;
    }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title={t('checkout.title')} description={t('checkout.description')} image="https://picsum.photos/1200/400?random=98" />
      
            <div className="container py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Customer Form */}
            <div className="lg:col-span-2">
                            <Card padding="wide">
                                <h2 className="text-2xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100">{t('checkout.customerDetails')}</h2>

                                <form
                                    className="space-y-5"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleFinishOrder();
                                    }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Input
                                                label={t('checkout.firstName')}
                                                value={form.firstName}
                                                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.firstName)}
                                            />
                                            {errors.firstName ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.firstName}</p> : null}
                                        </div>
                                        <div>
                                            <Input
                                                label={t('checkout.lastName')}
                                                value={form.lastName}
                                                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.lastName)}
                                            />
                                            {errors.lastName ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.lastName}</p> : null}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Input
                                                label={t('checkout.email')}
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.email)}
                                            />
                                            {errors.email ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.email}</p> : null}
                                        </div>
                                        <div>
                                            <Input
                                                label={t('checkout.phone')}
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.phone)}
                                            />
                                            {errors.phone ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.phone}</p> : null}
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            label={t('checkout.street')}
                                            value={form.street}
                                            onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                                            required
                                            aria-invalid={Boolean(errors.street)}
                                        />
                                        {errors.street ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.street}</p> : null}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Input
                                                label={t('checkout.postalCode')}
                                                value={form.postalCode}
                                                onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.postalCode)}
                                            />
                                            {errors.postalCode ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.postalCode}</p> : null}
                                        </div>
                                        <div>
                                            <Input
                                                label={t('checkout.city')}
                                                value={form.city}
                                                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.city)}
                                            />
                                            {errors.city ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.city}</p> : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="field-label">{t('checkout.notes')}</label>
                                        <textarea
                                            className="ui-textarea"
                                            rows={4}
                                            value={form.notes}
                                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                            placeholder={t('checkout.notesPlaceholder')}
                                        />
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        {/* Shopify Checkout Button - Primary when Shopify is configured */}
                                        {shopifyEnabled && (
                                          <Button
                                            type="button"
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                            disabled={isRedirecting}
                                            onClick={handleShopifyCheckout}
                                          >
                                            <span className="flex items-center justify-center gap-2">
                                              {isRedirecting ? (
                                                <>
                                                  <Loader2 size={18} className="animate-spin" />
                                                  {t('checkout.redirecting')}
                                                </>
                                              ) : (
                                                <>
                                                  {t('checkout.payButton')}
                                                  <ExternalLink size={18} />
                                                </>
                                              )}
                                            </span>
                                          </Button>
                                        )}
                                        
                                        {/* Local Checkout Button - Fallback when Shopify is not configured */}
                                        {!shopifyEnabled && (
                                          <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                            disabled={isSubmitting}
                                          >
                                            {isSubmitting ? t('checkout.submitting') : t('checkout.orderButton')}
                                          </Button>
                                        )}
                                        
                                        {checkoutError && (
                                          <p className="text-red-600 text-sm text-center">
                                            {checkoutError}
                                          </p>
                                        )}
                                    </div>
                                </form>
                            </Card>
            </div>

            {/* Order Overview */}
            <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-32">
                                <Card padding="wide">
                                    <h3 className="text-xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                                        <Package size={20} />
                                        {t('checkout.yourOrder')}
                                    </h3>

                                    <div className="space-y-4 mb-6 max-h-[420px] overflow-y-auto pr-2">
                                        {orderItems.map(({ item, unitPrice }, idx) => {
                                            const showInfo = isConfigurableCategory(item);
                                            const isVeranda = isVerandaCategory(item);
                                            const isMaatwerk = isMaatwerkVerandaItem(item);
                                            const isSandwichpanelen = item.type === 'sandwichpanelen';
                                            const basePrice = item.price || 1250;
                                            // Cast to schema's VerandaConfig type for the edit context
                                            const initialConfig = item.config?.category === 'verandas' ? (item.config.data as any) : undefined;
                                            return (
                                            <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                                {/* Image - use ConfigPreviewImage for verandas (not maatwerk) */}
                                                {isVeranda && !isMaatwerk ? (
                                                    <CartItemPreview
                                                        render={item.render}
                                                        config={initialConfig}
                                                        fallbackImageUrl={item.imageUrl}
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2">{item.title}</h4>
                                                            {/* Maatwerk size display */}
                                                            {isMaatwerk && item.maatwerkPayload?.size && (
                                                                <div className="text-xs text-[#003878] font-semibold">
                                                                    {item.maatwerkPayload.size.width} × {item.maatwerkPayload.size.depth} cm
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Edit icon for regular verandas only (not maatwerk) */}
                                                        {isVeranda && !isMaatwerk && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditConfigurator({
                                                                    cartIndex: idx,
                                                                    productTitle: item.title,
                                                                    basePrice,
                                                                    initialConfig,
                                                              widthCm:
                                                                extractWidthFromSize(item.selectedSize || '') ??
                                                                extractWidthFromHandle(item.handle || item.slug || item.id || '') ??
                                                                (initialConfig as any)?.widthCm ??
                                                                606,
                                                                })}
                                                                className="relative z-10 text-gray-400 hover:text-hett-primary pointer-events-auto min-w-[36px] min-h-[36px]"
                                                                title={t('common.edit')}
                                                                aria-label={t('cart.editConfig')}
                                                            >
                                                                <Pencil size={14} />
                                                            </Button>
                                                        )}
                                                        {/* Edit icon for maatwerk verandas */}
                                                        {isMaatwerk && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openMaatwerkEdit({ cartIndex: idx, item })}
                                                                className="relative z-10 text-gray-400 hover:text-hett-primary pointer-events-auto min-w-[36px] min-h-[36px]"
                                                                title={t('common.edit')}
                                                                aria-label={t('cart.editMaatwerkConfig')}
                                                            >
                                                                <Pencil size={14} />
                                                            </Button>
                                                        )}

                                                        {/* Edit icon for sandwichpanelen */}
                                                        {isSandwichpanelen && item.id && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openSandwichpanelenEdit({ lineId: item.id, item })}
                                                                className="relative z-10 text-gray-400 hover:text-hett-primary pointer-events-auto min-w-[36px] min-h-[36px]"
                                                                title={t('common.edit')}
                                                                aria-label={t('common.edit')}
                                                            >
                                                                <Pencil size={14} />
                                                            </Button>
                                                        )}
                                                        {showInfo ? (
                                                            <CheckoutConfigInfo
                                                                title={item.title}
                                                                breakdown={item}
                                                                debugId={item.id || item.slug || item.title}
                                                            />
                                                        ) : null}
                                                    </div>

                                                    {item.displayConfigSummary ? (
                                                        <div className="text-[10px] text-gray-500 font-medium bg-gray-50 border border-gray-100 rounded-md px-2 py-1 mb-2">
                                                            {item.displayConfigSummary}
                                                        </div>
                                                    ) : item.details && item.details.length > 0 ? (
                                                        <div className="text-xs text-gray-500 space-y-0.5">
                                                            {item.details.slice(0, 2).map((detail, i) => (
                                                                <div key={i}>
                                                                    {detail.label}: {detail.value}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-500">
                                                            {item.selectedSize ? <div>{t('common.dimension')}: {item.selectedSize}</div> : null}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mt-2">
                                                        <div className="text-xs text-gray-500">
                                                            <div>{t('common.quantity')}: <span className="font-bold">{item.quantity}</span></div>
                                                            <div>{t('common.perUnit')}: <span className="font-bold">{formatMoney(unitPrice)}</span></div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">{t('checkout.line')}</div>
                                                            <div className="font-black text-hett-dark">{formatMoney(item.totalPrice)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium">{t('common.subtotal')}</span>
                                            <span className="font-bold">{formatMoney(subtotalExVat)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium">{t('common.vat')}</span>
                                            <span className="font-bold">{formatMoney(vatAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium flex items-center gap-2">
                                              {shippingMode === 'pickup' 
                                                ? t('checkout.pickupEindhoven') 
                                                : shippingAddress.city 
                                                  ? `${t('checkout.deliverTo')} ${shippingAddress.city}`
                                                  : `${t('checkout.deliverTo')} ${COUNTRY_LABELS[shippingCountry] || shippingCountry}`
                                              }
                                              <Link 
                                                to="/cart?editShipping=1" 
                                                className="text-xs text-[#003878] hover:underline font-semibold"
                                              >
                                                {t('checkout.change')}
                                              </Link>
                                            </span>
                                            <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                              {formatShippingCost(shippingCost)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-700">{t('common.total')}</span>
                                            <span className="text-2xl font-black text-hett-dark">{formatMoney(totalInclVat)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">{t('checkout.totalNote')}</p>
                                    </div>
                                </Card>
                            </div>
            </div>

        </div>
      </div>
    </div>
  );
};

function CheckoutConfigInfo({ title, breakdown, debugId }: { title: string; breakdown: unknown; debugId?: string }) {
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
                <Info size={16} />
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

export default Checkout;
