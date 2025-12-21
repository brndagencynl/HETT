import React, { useState, useEffect } from 'react';
import { Check, ShoppingCart, Info, Minus, Plus, ShieldCheck } from 'lucide-react';
import { DEFAULT_SANDWICH_CONFIG, SandwichPanelChoice, SandwichPanelOptionGroup } from './SandwichPanelConfig';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';

interface Props {
    product: Product;
    basePrice: number;
}

const SandwichPanelBuilder: React.FC<Props> = ({ product, basePrice }) => {
    const { addToCart } = useCart();
    const [selections, setSelections] = useState<Record<string, string | string[]>>({});
    const [quantity, setQuantity] = useState(1);
    const [touched, setTouched] = useState(false);

    // Initialize defaults (required fields that have a default, or warranty)
    useEffect(() => {
        const defaults: Record<string, string> = {};
        DEFAULT_SANDWICH_CONFIG.forEach(group => {
            if (group.type === 'included' && group.choices.length > 0) {
                defaults[group.id] = group.choices[0].id;
            }
            // Pre-select first option for required groups if strict UX allows, 
            // BUT user request implies "validation disable untill selected".
            // Reference screenshot usually implies explicit selection for dropdowns.
            // Let's NOT auto-select dropdowns to force user choice if desired, matches "missing helper text" req.
            // However, "Tiles" usually have a default. 
            // For now, only 'included' is auto-set.
        });
        setSelections(prev => ({ ...defaults, ...prev }));
    }, []);

    const handleSelect = (groupId: string, choiceId: string) => {
        setSelections(prev => {
            // Toggle logic for addons?
            // Schema says 'addons'. Usually multiple? 
            // For simple builder, let's assume 'addons' in schema is multi-select or single? 
            // The Prompt request structure implies "Opties (addons, optional) — list cards". 
            // Typically these are checkboxes (multi).
            // Let's assume multi-select for 'addons' type, single for others.
            // Wait, schema structure 'choices' implies one choice? 
            // If type is 'addons', let's treat it as toggle-able set if we map by ID.
            // But for simplicity of this object structure `Record<string, string>`, it implies one value per Group.
            // If addons are multiple, we need `Record<string, string[]>` or specific logic.
            // Let's look at config again. "Opties" group has choices.
            // I will allow MULTIPLE selections for 'addons' group by storing them differently?
            // Or I stick to the Type "SandwichPanelOptionGroup" which seems to function as "Pick one".
            // Re-reading: "Opties (addons, optional) — list cards". 
            // Usually you can pick multiple options (e.g. screws AND tape).
            // I'll make ADDONS special: `selections[groupId]` could be an array? 
            // To keep typescript happy with `Record<string, string>`, I might need to change state type or join strings. 
            // Let's change state to `Record<string, string | string[]>`.

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

    // State typing cast helper
    const getSelection = (groupId: string): string | string[] | undefined => selections[groupId];

    // Calculate Price
    const calculateTotal = () => {
        let optionsTotal = 0;

        DEFAULT_SANDWICH_CONFIG.forEach(group => {
            const selection = selections[group.id];
            if (!selection) return;

            if (Array.isArray(selection)) {
                // Multi-select addons
                selection.forEach(selId => {
                    const choice = group.choices.find(c => c.id === selId);
                    if (choice) optionsTotal += choice.priceDelta;
                });
            } else {
                // Single select
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

    const handleAddToCart = () => {
        setTouched(true);
        if (!isValid) return;

        // Build configuration payload
        const configPayload: any = { ...selections };
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

        addToCart(product, quantity, {
            price: total,
            configuration: configPayload,
            configurationLabel: configLabel, // For display in cart
            details: configLabel.map(l => {
                const [label, value] = l.split(': ');
                return { label, value };
            }),
            isConfigured: true // Signature for CartGuard
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header */}
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

                            {/* RENDER TYPES */}

                            {/* 1. SELECT */}
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
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                    </div>
                                </div>
                            )}

                            {/* 2. TILES */}
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

                            {/* 3. SWATCHES */}
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
                                                <span className="sr-only">{c.label}</span>
                                            </button>
                                        );
                                    })}
                                    <div className="flex-1 flex items-center">
                                        <span className="text-sm text-gray-600 font-medium">
                                            {currentVal ? group.choices.find(c => c.id === currentVal)?.label : 'Kies een kleur'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 4. ADDONS (Cards) */}
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
                                                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                                                    {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-hett-dark text-sm truncate">{c.label}</span>
                                                        {c.badge && <span className="text-[9px] bg-hett-secondary text-white px-1.5 py-0.5 rounded font-bold uppercase">{c.badge}</span>}
                                                    </div>
                                                    {c.subtitle && <div className="text-xs text-gray-500">{c.subtitle}</div>}
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

                            {/* 5. INCLUDED */}
                            {group.type === 'included' && (
                                <div className="space-y-2">
                                    {group.choices.map(c => (
                                        <div key={c.id} className="flex items-center p-4 rounded-lg bg-green-50 border border-green-100">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div className="flex-grow font-bold text-hett-dark text-sm">{c.label}</div>
                                            <div className="text-green-600 font-bold text-sm uppercase tracking-wide">{c.badge}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
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
                        onClick={handleAddToCart}
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
