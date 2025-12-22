import React, { useState, useEffect } from 'react';
import { Check, ShoppingCart, Minus, Plus, ShieldCheck } from 'lucide-react';
import { DEFAULT_SANDWICH_CONFIG } from './SandwichPanelConfig';
import { Product } from '../../../types';

interface Props {
    product: Product;
    basePrice: number;
    onAddToCart?: (payload: any) => void;
}

const SandwichPanelBuilder: React.FC<Props> = ({ product, basePrice, onAddToCart }) => {
    const [selections, setSelections] = useState<Record<string, string | string[]>>({});
    const [quantity, setQuantity] = useState(1);
    const [touched, setTouched] = useState(false);

    // Initialize with defaults only (no persistence)
    useEffect(() => {
        const defaults: Record<string, string> = {};
        DEFAULT_SANDWICH_CONFIG.forEach(group => {
            if (group.type === 'included' && group.choices.length > 0) {
                defaults[group.id] = group.choices[0].id;
            }
        });
        setSelections(defaults);
    }, []);

    const handleSelect = (groupId: string, choiceId: string) => {
        setSelections(prev => {
            const group = DEFAULT_SANDWICH_CONFIG.find(g => g.id === groupId);
            if (group?.type === 'addons') {
                const current = (prev[groupId] as string[]) || [];
                if (current.includes(choiceId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== choiceId) };
                } else {
                    return { ...prev, [groupId]: [...current, choiceId] };
                }
            }
            return { ...prev, [groupId]: choiceId };
        });
        setTouched(true);
    };

    // Helper
    const getSelection = (groupId: string): string | string[] | undefined => selections[groupId];

    // Calculate Price
    const calculateTotal = () => {
        let optionsTotal = 0;
        DEFAULT_SANDWICH_CONFIG.forEach(group => {
            const selection = selections[group.id];
            if (!selection) return;

            if (Array.isArray(selection)) {
                selection.forEach(selId => {
                    const choice = group.choices.find(c => c.id === selId);
                    if (choice) optionsTotal += choice.priceDelta;
                });
            } else {
                const choice = group.choices.find(c => c.id === selection);
                if (choice) optionsTotal += choice.priceDelta;
            }
        });

        return {
            base: basePrice,
            options: optionsTotal,
            total: basePrice + optionsTotal
        };
    };

    const { base, options, total } = calculateTotal();

    // Validation
    const getMissingRequired = () => {
        return DEFAULT_SANDWICH_CONFIG.filter(g => g.required && !selections[g.id]);
    };
    const missing = getMissingRequired();
    const isValid = missing.length === 0;

    const handleAddToCartClick = () => {
        setTouched(true);
        if (!isValid) return;

        const configPayload = { ...selections };
        const configLabel: string[] = [];

        DEFAULT_SANDWICH_CONFIG.forEach(group => {
            const val = selections[group.id];
            if (val) {
                if (Array.isArray(val)) {
                    val.forEach(v => {
                        const c = group.choices.find(ch => ch.id === v);
                        if (c) configLabel.push(`${group.label}: ${c.label}`);
                    });
                } else {
                    const c = group.choices.find(ch => ch.id === val);
                    if (c) configLabel.push(`${group.label}: ${c.label}`);
                }
            }
        });

        // Strict ProductConfig structure
        const productConfig = {
            category: 'sandwichpanelen',
            data: configPayload
        };

        const payload = {
            price: total,
            quantity: quantity,
            config: productConfig,
            configuration: configPayload,
            configurationLabel: configLabel,
            details: configLabel.map(l => {
                const [label, value] = l.split(': ');
                return { label, value };
            }),
            isConfigured: true
        };

        if (onAddToCart) {
            onAddToCart(payload);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-6">
                <h2 className="text-xl font-black text-hett-dark">Stel samen</h2>
                <p className="text-sm text-gray-500">Kies uw opties en afmetingen.</p>
            </div>

            <div className="p-6 space-y-8">
                {DEFAULT_SANDWICH_CONFIG.map(group => {
                    const currentVal = getSelection(group.id);
                    return (
                        <div key={group.id} className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">
                                    {group.label} {group.required && <span className="text-red-500">*</span>}
                                </label>
                                {touched && group.required && !currentVal && (
                                    <span className="text-xs text-red-500 font-bold animate-pulse">Verplicht veld</span>
                                )}
                            </div>

                            {group.type === 'select' && (
                                <div className="relative">
                                    <select
                                        className={`w-full p-3 bg-white border rounded-lg appearance-none font-medium text-hett-dark focus:outline-none focus:ring-2 focus:ring-hett-primary/20 ${touched && group.required && !currentVal ? 'border-red-300' : 'border-gray-200'}`}
                                        value={currentVal as string || ''}
                                        onChange={(e) => handleSelect(group.id, e.target.value)}
                                    >
                                        <option value="" disabled>Maak een keuze...</option>
                                        {group.choices.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.label} {c.priceDelta > 0 && `(+€${c.priceDelta})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {group.type === 'tiles' && (
                                <div className="grid grid-cols-2 gap-3">
                                    {group.choices.map(c => {
                                        const isSelected = currentVal === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => handleSelect(group.id, c.id)}
                                                className={`relative p-4 rounded-lg border-2 text-left transition-all group ${isSelected ? 'border-hett-secondary bg-orange-50/10' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 bg-hett-secondary text-white rounded-full p-1 shadow-sm">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                )}
                                                <div className="font-bold text-hett-dark mb-1">{c.label}</div>
                                                {c.badge && <div className="text-[10px] uppercase font-bold text-green-600 mb-1">{c.badge}</div>}
                                                {c.priceDelta > 0 && <div className="text-xs text-gray-500 font-medium">+ €{c.priceDelta}</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {group.type === 'swatches' && (
                                <div className="flex gap-3">
                                    {group.choices.map(c => {
                                        const isSelected = currentVal === c.id;
                                        // Simple mapping for demo colors
                                        const bgMap: any = { ral9002: '#E9E9E9', ral9010: '#FFFFFF', ral7016: '#293133' };
                                        const bg = bgMap[c.id] || '#ccc';

                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => handleSelect(group.id, c.id)}
                                                className={`group relative w-12 h-12 rounded-lg shadow-sm border-2 transition-all ${isSelected ? 'border-hett-primary scale-110 ring-2 ring-hett-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
                                                style={{ backgroundColor: bg }}
                                                title={c.label}
                                            >
                                                {isSelected && <div className="absolute inset-0 flex items-center justify-center text-hett-primary drop-shadow-md"><Check size={20} /></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {group.type === 'addons' && (
                                <div className="space-y-2">
                                    {group.choices.map(c => {
                                        const isSelected = Array.isArray(currentVal) && currentVal.includes(c.id);
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => handleSelect(group.id, c.id)}
                                                className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer select-none ${isSelected ? 'border-hett-primary bg-hett-primary/5 ring-1 ring-hett-primary' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                            >
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-hett-dark text-sm truncate">{c.label}</span>
                                                        {c.badge && <span className="text-[9px] bg-hett-secondary text-white px-1.5 py-0.5 rounded font-bold uppercase">{c.badge}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right pl-3">
                                                    <div className="text-sm font-bold text-hett-dark">+€{c.priceDelta.toFixed(2)}</div>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ml-auto transition-colors ${isSelected ? 'bg-hett-primary border-hett-primary text-white' : 'border-gray-300'}`}>
                                                        {isSelected && <Check size={12} />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {group.type === 'included' && (
                                <div className="space-y-2">
                                    {group.choices.map(c => (
                                        <div key={c.id} className="flex items-center p-4 rounded-lg bg-green-50 border border-green-100">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div className="flex-grow font-bold text-hett-dark text-sm">{c.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>Product totaal</span>
                        <span>€ {base.toLocaleString()},-</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Opties totaal</span>
                        <span>€ {options.toLocaleString()},-</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-hett-dark pt-2 border-t border-gray-200">
                        <span>Totaal</span>
                        <span>€ {total.toLocaleString()},-</span>
                    </div>
                </div>

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
                        In winkelwagen
                    </button>
                </div>
                {!isValid && touched && (
                    <p className="text-center text-xs text-red-500 font-bold mt-2 animate-pulse">
                        Selecteer a.u.b. alle verplichte opties
                    </p>
                )}
            </div>
        </div>
    );
};

export default SandwichPanelBuilder;
