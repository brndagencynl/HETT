import React from 'react';
import { ShieldCheck, TrainTrack as Rail, Truck, Wrench as Tools, Check } from 'lucide-react';

export type ProductDetailContentProps = {
    uspItems: { icon: "shield" | "rail" | "truck" | "tools"; title: string; subtitle?: string }[];
    delivery: {
        title: string;            // "Levering & montage"
        text: string;             // korte uitleg
        leadTimeLabel?: string;   // bijv. "Gemiddelde levertijd"
        leadTimeValue?: string;   // bijv. "10 werkdagen"
    };
    description: {
        title: string;            // bijv. productnaam of “Beschrijving”
        intro?: string;
        paragraphs?: string[];
        sections?: { heading: string; body: string }[];        /** Extra description HTML from Shopify metafield (rendered with dangerouslySetInnerHTML) */
        extraDescriptionHtml?: string;    };
    specs: { label: string; value: string }[];
};

const IconMap = {
    shield: ShieldCheck,
    rail: Rail,
    truck: Truck,
    tools: Tools
};

const ProductDetailContent: React.FC<ProductDetailContentProps> = ({ uspItems, delivery, description, specs }) => {
    return (
        <div className="space-y-8 w-full">

            {/* 1. USP Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {uspItems.map((item, index) => {
                    const Icon = IconMap[item.icon];
                    return (
                        <div key={index} className="bg-[#eff6ff] rounded-2xl p-4 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg text-[#003878] shadow-sm flex-shrink-0">
                                <Icon size={20} className="stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-[#003878] text-sm truncate" title={item.title}>{item.title}</div>
                                {item.subtitle && <div className="text-xs text-gray-500 truncate" title={item.subtitle}>{item.subtitle}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2. Delivery & Montage Block */}
            <div className="bg-[#eff6ff] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="space-y-2 max-w-2xl">
                    <h3 className="text-xl font-bold text-[#003878] flex items-center gap-2">
                        <Truck size={24} className="text-[#003878]" />
                        {delivery.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                        {delivery.text}
                    </p>
                </div>

                {delivery.leadTimeValue && (
                    <div className="bg-white p-4 rounded-xl shadow-sm min-w-[200px] flex-shrink-0">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {delivery.leadTimeLabel || "Levertijd"}
                        </div>
                        <div className="text-[#FF7300] font-black text-lg flex items-center gap-2">
                            <Check size={20} strokeWidth={3} />
                            {delivery.leadTimeValue}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                {/* Left: Description */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-[#003878] mb-4">{description.title}</h2>
                        {description.intro && (
                            <p className="text-base lg:text-lg font-medium text-gray-700 leading-relaxed mb-6">
                                {description.intro}
                            </p>
                        )}

                        <div className="space-y-4 text-gray-600 leading-7">
                            {description.paragraphs?.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>

                        {/* Extra description from Shopify metafield (may contain HTML) */}
                        {description.extraDescriptionHtml && (
                            <div 
                                className="mt-6 prose prose-sm max-w-none text-gray-600 leading-7"
                                dangerouslySetInnerHTML={{ __html: description.extraDescriptionHtml }}
                            />
                        )}
                    </div>

                    {description.sections?.map((section, i) => (
                        <div key={i} className="pt-4">
                            <h3 className="text-lg font-bold text-[#003878] mb-2">{section.heading}</h3>
                            <p className="text-gray-600 leading-7">{section.body}</p>
                        </div>
                    ))}
                </div>

                {/* Right: Specs */}
                <div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:p-8 shadow-sm h-full">
                        <h3 className="text-xl font-bold text-[#003878] mb-6 flex items-center gap-2">
                            Specificaties
                        </h3>
                        {specs.length > 0 ? (
                            <div className="space-y-0 divide-y divide-gray-100">
                                {specs.map((spec, index) => (
                                    <div key={index} className="flex justify-between py-4 group hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg">
                                        <span className="font-medium text-gray-500 text-sm">{spec.label}</span>
                                        <span className="font-bold text-[#003878] text-sm text-right">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Specificaties volgen binnenkort.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetailContent;
