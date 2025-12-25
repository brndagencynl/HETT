
import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useVerandaEdit } from '../context/VerandaEditContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Package, Info, Pencil } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/button';
import { Card } from '../components/ui/card';
import Input from '../components/ui/input';
import { formatMoney } from '../src/pricing/pricingHelpers';
import ConfigBreakdownPopup, { getCartItemPriceBreakdown, isConfigurableCategory, isVerandaCategory } from '../components/ui/ConfigBreakdownPopup';
import { CartItemPreview } from '../components/ui/ConfigPreviewImage';
import { getShippingLabel, formatShippingFee } from '../src/pricing/shipping';

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
  const { cart, total, clearCart, shippingMethod, shippingCountry, shippingFee, grandTotal } = useCart();
  const { openEditConfigurator } = useVerandaEdit();
  const navigate = useNavigate();

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
    const totalInclVat = grandTotal; // Now includes shipping
    const subtotalExVat = Math.round(total / (1 + VAT_RATE)); // Items only
    const vatAmount = Math.round(total - subtotalExVat);

    const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validate = (): Partial<Record<keyof CheckoutForm, string>> => {
        const next: Partial<Record<keyof CheckoutForm, string>> = {};
        if (!form.firstName.trim()) next.firstName = 'Vul je naam in.';
        if (!form.lastName.trim()) next.lastName = 'Vul je achternaam in.';
        if (!form.email.trim() || !isEmailValid(form.email)) next.email = 'Vul een geldig e-mailadres in.';
        if (!form.phone.trim()) next.phone = 'Vul je telefoonnummer in.';
        if (!form.street.trim()) next.street = 'Vul je straat in.';
        if (!form.postalCode.trim()) next.postalCode = 'Vul je postcode in.';
        if (!form.city.trim()) next.city = 'Vul je plaats in.';
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
            const unitPrice = item.quantity > 0 ? item.totalPrice / item.quantity : item.totalPrice;
            return { item, unitPrice };
        });
    }, [cart]);

    if (cart.length === 0) {
        return <Navigate to="/cart" replace />;
    }

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader title="Afrekenen" description="Rond uw bestelling veilig af." image="https://picsum.photos/1200/400?random=98" />
      
            <div className="container py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Customer Form */}
            <div className="lg:col-span-2">
                            <Card padding="wide">
                                <h2 className="text-2xl font-black text-hett-dark mb-6 pb-4 border-b border-gray-100">Klantgegevens</h2>

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
                                                label="Naam"
                                                value={form.firstName}
                                                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.firstName)}
                                            />
                                            {errors.firstName ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.firstName}</p> : null}
                                        </div>
                                        <div>
                                            <Input
                                                label="Achternaam"
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
                                                label="E-mail"
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
                                                label="Telefoon"
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
                                            label="Straat"
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
                                                label="Postcode"
                                                value={form.postalCode}
                                                onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.postalCode)}
                                            />
                                            {errors.postalCode ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.postalCode}</p> : null}
                                        </div>
                                        <div>
                                            <Input
                                                label="Plaats"
                                                value={form.city}
                                                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                                                required
                                                aria-invalid={Boolean(errors.city)}
                                            />
                                            {errors.city ? <p className="text-xs text-red-600 mt-2 font-bold">{errors.city}</p> : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="field-label">Opmerkingen</label>
                                        <textarea
                                            className="ui-textarea"
                                            rows={4}
                                            value={form.notes}
                                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                            placeholder="Optioneel"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            className="w-full"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Bezig…' : 'Bestellen'}
                                        </Button>
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
                                        Uw bestelling
                                    </h3>

                                    <div className="space-y-4 mb-6 max-h-[420px] overflow-y-auto pr-2">
                                        {orderItems.map(({ item, unitPrice }, idx) => {
                                            const showInfo = isConfigurableCategory(item);
                                            const isVeranda = isVerandaCategory(item);
                                            const basePrice = item.price || 1250;
                                            // Cast to schema's VerandaConfig type for the edit context
                                            const initialConfig = item.config?.category === 'verandas' ? (item.config.data as any) : undefined;
                                            return (
                                            <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                                {/* Image - use ConfigPreviewImage for verandas */}
                                                {isVeranda ? (
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
                                                        <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2 flex-1">{item.title}</h4>
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
                                                                className="relative z-10 text-gray-400 hover:text-hett-primary pointer-events-auto min-w-[36px] min-h-[36px]"
                                                                title="Bewerken"
                                                                aria-label="Configuratie bewerken"
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
                                                            {item.selectedSize ? <div>Afmeting: {item.selectedSize}</div> : null}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mt-2">
                                                        <div className="text-xs text-gray-500">
                                                            <div>Aantal: <span className="font-bold">{item.quantity}</span></div>
                                                            <div>Per stuk: <span className="font-bold">{formatMoney(unitPrice)}</span></div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Regel</div>
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
                                            <span className="font-medium">Subtotaal</span>
                                            <span className="font-bold">{formatMoney(subtotalExVat)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium">BTW (21%)</span>
                                            <span className="font-bold">{formatMoney(vatAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium">
                                              {getShippingLabel(shippingMethod, shippingCountry)}
                                            </span>
                                            <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                                              {formatShippingFee(shippingFee)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-700">Totaal</span>
                                            <span className="text-2xl font-black text-hett-dark">{formatMoney(totalInclVat)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Totaal (incl. BTW en verzending)</p>
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
