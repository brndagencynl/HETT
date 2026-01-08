import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { FaqItem, FALLBACK_FAQ } from '../../services/shopify';

interface HomeFAQProps {
    items?: FaqItem[];
}

const HomeFAQ: React.FC<HomeFAQProps> = ({ items }) => {
    // Use provided items or fallback
    const faqs = items && items.length > 0 ? items : FALLBACK_FAQ;
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-[#eff6ff]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Content */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hett-secondary/10 text-hett-secondary text-xs font-bold uppercase tracking-wider mb-4 border border-hett-secondary/20">
                                <MessageCircle size={14} />
                                <span>Ondersteuning</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-6 leading-tight">
                                Veelgestelde <br className="hidden md:block" /> vragen
                            </h2>
                            <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                                Heeft u een vraag over onze producten of service? Hieronder vindt u de meestgestelde vragen van onze klanten.
                            </p>
                            <Link
                                to="/veelgestelde-vragen"
                                className="btn-primary px-8 py-3.5 text-sm uppercase tracking-wider"
                            >
                                Bekijk alle vragen
                            </Link>
                        </div>
                    </div>

                    {/* Right: FAQ List */}
                    <div className="lg:col-span-8">
                        <div className="space-y-4">
                            {faqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={`bg-white rounded-xl overflow-hidden transition-all duration-300 border ${isOpen ? 'border-hett-secondary shadow-md' : 'border-gray-200 shadow-sm'}`}
                                    >
                                        <button
                                            onClick={() => toggle(index)}
                                            className="w-full flex justify-between items-center p-6 text-left"
                                        >
                                            <span className="font-bold text-hett-dark md:text-lg">{faq.question}</span>
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-hett-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>

                                        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                            <div className="overflow-hidden">
                                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 mt-1">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HomeFAQ;

