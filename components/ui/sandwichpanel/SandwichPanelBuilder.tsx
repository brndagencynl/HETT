import React, { useState, useEffect } from 'react';
import { Check, ShoppingCart, Minus, Plus, ShieldCheck } from 'lucide-react';
import { DEFAULT_SANDWICHPANEL_CONFIG, type SandwichpanelenConfig } from './SandwichPanelConfig';
import { Product } from '../../../types';
import ProductUSPs from '../../../src/components/ui/ProductUSPs';
import {
    SANDWICH_COLOR_OPTIONS,
    SANDWICH_LENGTH_MM_OPTIONS,
    SANDWICH_WORKING_WIDTH_MM,
    calculateSandwichpanelenPricing,
} from '../../../src/pricing/sandwichpanelen';
import { formatEUR, toCents } from '../../../src/utils/money';
import { useTranslation } from 'react-i18next';

interface Props {
    product: Product;
    basePrice: number;
    onAddToCart?: (payload: any) => void;
}

const SandwichPanelBuilder: React.FC<Props> = ({ product, basePrice, onAddToCart }) => {
    const [config, setConfig] = useState<SandwichpanelenConfig>({ ...DEFAULT_SANDWICHPANEL_CONFIG });
    const [quantity, setQuantity] = useState(1);
    const [touched, setTouched] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setConfig({ ...DEFAULT_SANDWICHPANEL_CONFIG });
    }, [product?.id]);

    const pricing = calculateSandwichpanelenPricing({
        basePrice,
        config: config as any,
    });

    const isLengthValid = Boolean(config.lengthMm);
    const isColorValid = Boolean(config.color);
    const isValid = isLengthValid && isColorValid;

    const handleAddToCartClick = () => {
        setTouched(true);
        if (!isValid) return;

        const selectedColor = SANDWICH_COLOR_OPTIONS.find(c => c.id === config.color);
        const details = [
            { label: t('sandwichBuilder.width'), value: `${SANDWICH_WORKING_WIDTH_MM} mm` },
            { label: t('sandwichBuilder.length'), value: `${config.lengthMm} mm` },
            { label: t('sandwichBuilder.color'), value: selectedColor?.label || String(config.color) },
            ...(config.extras.uProfiles.enabled ? [{ label: t('sandwichBuilder.uProfiles'), value: `${config.extras.uProfiles.meters} m` }] : []),
        ];

        const displayConfigSummary = [
            `${t('sandwichBuilder.width')}: ${SANDWICH_WORKING_WIDTH_MM} mm`,
            `${t('sandwichBuilder.length')}: ${config.lengthMm} mm`,
            `${t('sandwichBuilder.color')}: ${selectedColor?.label || String(config.color)}`,
            ...(config.extras.uProfiles.enabled ? [`${t('sandwichBuilder.uProfiles')}: ${config.extras.uProfiles.meters} m`] : []),
        ].join(' • ');

        // Strict ProductConfig structure
        const productConfig = {
            category: 'sandwichpanelen',
            data: {
                workingWidthMm: SANDWICH_WORKING_WIDTH_MM,
                lengthMm: config.lengthMm,
                color: config.color,
                extras: {
                    uProfiles: {
                        enabled: config.extras.uProfiles.enabled,
                        meters: config.extras.uProfiles.meters,
                    },
                },
            }
        };

        const unitTotal = pricing.total;
        const breakdownItems = pricing.breakdown.map((row) => ({
            groupLabel: t('sandwichBuilder.extraOptions'),
            choiceLabel: row.label,
            price: row.amount,
        }));

        const priceBreakdown = {
            basePrice: pricing.basePrice,
            items: breakdownItems,
            optionsTotal: pricing.extrasTotal,
            grandTotal: unitTotal,
        };

        const payload = {
            type: 'sandwichpanelen',
            price: unitTotal,
            quantity: quantity,
            config: productConfig,
            details,
            displayConfigSummary,
            pricing: {
                basePrice: pricing.basePrice,
                extrasTotal: pricing.extrasTotal,
                total: unitTotal,
                breakdown: pricing.breakdown,
            },
            priceBreakdown,
            isConfigured: true
        };

        if (onAddToCart) {
            onAddToCart(payload);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-6">
                <h2 className="text-xl font-black text-hett-dark">{t('common.configure')}</h2>
                <p className="text-sm text-gray-500">{t('sandwichBuilder.chooseOptions')}</p>
            </div>

            <div className="p-6 space-y-8">
                {/* 1) Werkende breedte (locked) */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">{t('configuratorPage.workingWidth')}</label>
                    </div>
                    <div className="relative">
                        <select
                            disabled
                            className="w-full p-3 bg-white border rounded-lg appearance-none font-medium text-hett-dark border-gray-200 opacity-80 cursor-not-allowed"
                            value={String(SANDWICH_WORKING_WIDTH_MM)}
                            onChange={() => undefined}
                        >
                            <option value={String(SANDWICH_WORKING_WIDTH_MM)}>{SANDWICH_WORKING_WIDTH_MM} mm {t('sandwichBuilder.standard')}</option>
                        </select>
                    </div>
                </div>

                {/* 2) Lengte (required) */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">
                            {t('sandwichBuilder.lengthLabel')} <span className="text-red-500">*</span>
                        </label>
                        {touched && !isLengthValid && (
                            <span className="text-xs text-red-500 font-bold animate-pulse">{t('sandwichBuilder.requiredField')}</span>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            className={`w-full p-3 bg-white border rounded-lg appearance-none font-medium text-hett-dark focus:outline-none focus:ring-2 focus:ring-hett-primary/20 ${touched && !isLengthValid ? 'border-red-300' : 'border-gray-200'}`}
                            value={config.lengthMm ? String(config.lengthMm) : ''}
                            onChange={(e) => {
                                setConfig((p) => ({ ...p, lengthMm: Number(e.target.value) as any }));
                                setTouched(true);
                            }}
                        >
                            <option value="" disabled>{t('sandwichBuilder.selectPlaceholder')}</option>
                            {SANDWICH_LENGTH_MM_OPTIONS.map((mm) => (
                                <option key={mm} value={String(mm)}>{mm}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3) Kleur (required swatches) */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">
                            {t('common.color')} <span className="text-red-500">*</span>
                        </label>
                        {touched && !isColorValid && (
                            <span className="text-xs text-red-500 font-bold animate-pulse">{t('sandwichBuilder.requiredField')}</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {SANDWICH_COLOR_OPTIONS.map((c) => {
                            const isSelected = config.color === c.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setConfig((p) => ({ ...p, color: c.id as any }));
                                        setTouched(true);
                                    }}
                                    className={`group relative w-12 h-12 rounded-lg shadow-sm border-2 transition-all ${isSelected ? 'border-hett-primary scale-110 ring-2 ring-hett-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.label}
                                    aria-label={c.label}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center text-hett-primary drop-shadow-md">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4) Extra opties */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">{t('sandwichBuilder.extraOptions')}</label>
                    </div>

                    <div
                        onClick={() => {
                            setConfig((p) => ({
                                ...p,
                                extras: {
                                    ...p.extras,
                                    uProfiles: {
                                        ...p.extras.uProfiles,
                                        enabled: !p.extras.uProfiles.enabled,
                                        meters: p.extras.uProfiles.enabled ? p.extras.uProfiles.meters : (p.extras.uProfiles.meters || 1),
                                    },
                                },
                            }));
                            setTouched(true);
                        }}
                        className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer select-none ${config.extras.uProfiles.enabled ? 'border-hett-primary bg-hett-primary/5 ring-1 ring-hett-primary' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-hett-dark text-sm truncate">{t('sandwichBuilder.uProfiles')} per meter</span>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">{t('common.optional')}</div>
                        </div>
                        <div className="text-right pl-3">
                            <div className="text-sm font-bold text-hett-dark">
                                {config.extras.uProfiles.enabled ? `+ ${formatEUR(toCents(pricing.extrasTotal), 'cents')}` : '—'}
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ml-auto transition-colors ${config.extras.uProfiles.enabled ? 'bg-hett-primary border-hett-primary text-white' : 'border-gray-300'}`}>
                                {config.extras.uProfiles.enabled && <Check size={12} />}
                            </div>
                        </div>
                    </div>

                    {config.extras.uProfiles.enabled && (
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('sandwichBuilder.quantityMeters')}</div>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 w-32">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfig((p) => ({
                                            ...p,
                                            extras: {
                                                ...p.extras,
                                                uProfiles: {
                                                    ...p.extras.uProfiles,
                                                    meters: Math.max(1, p.extras.uProfiles.meters - 1),
                                                },
                                            },
                                        }));
                                    }}
                                    className="p-2 text-gray-400 hover:text-hett-dark"
                                    aria-label="Minder meters"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="flex-grow text-center font-bold text-hett-dark">{config.extras.uProfiles.meters}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfig((p) => ({
                                            ...p,
                                            extras: {
                                                ...p.extras,
                                                uProfiles: {
                                                    ...p.extras.uProfiles,
                                                    meters: p.extras.uProfiles.meters + 1,
                                                },
                                            },
                                        }));
                                    }}
                                    className="p-2 text-gray-400 hover:text-hett-dark"
                                    aria-label="Meer meters"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Included warranty (unchanged style) */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">{t('warranty.guarantee')}</label>
                    </div>
                    <div className="flex items-center p-4 rounded-lg bg-green-50 border border-green-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="flex-grow font-bold text-hett-dark text-sm">{t('warranty.fiveYear')}</div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>{t('sandwichBuilder.productTotal')}</span>
                        <span>{formatEUR(toCents(pricing.basePrice), 'cents')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>{t('sandwichBuilder.optionsTotal')}</span>
                        <span>{formatEUR(toCents(pricing.extrasTotal), 'cents')}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-hett-dark pt-2 border-t border-gray-200">
                        <span>{t('common.total')}</span>
                        <span>{formatEUR(toCents(pricing.total), 'cents')}</span>
                    </div>
                </div>

                <ProductUSPs items={product.usps ?? []} />

                <div className="flex gap-3">
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 w-24">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-400 hover:text-hett-dark"><Minus size={16} /></button>
                        <span className="flex-grow text-center font-bold text-hett-dark">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-400 hover:text-hett-dark"><Plus size={16} /></button>
                    </div>
                    <button
                        onClick={handleAddToCartClick}
                        disabled={!isValid}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all py-3 ${isValid ? 'bg-hett-primary text-white hover:bg-hett-dark shadow-lg shadow-hett-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <ShoppingCart size={18} />
                        {t('shop.addToCart')}
                    </button>
                </div>
                {!isValid && touched && (
                    <p className="text-center text-xs text-red-500 font-bold mt-2 animate-pulse">
                        {t('configurator.validation.fillRequiredFields')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SandwichPanelBuilder;
