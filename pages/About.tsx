
import React, { useState } from 'react';
import { Users, Globe, Award, Leaf, Ruler, ShieldCheck, HeartHandshake, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const About: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(2); // Start with Warranty active (index 2)

    const WHY_ITEMS = [
        {
            id: 'buitenleven',
            title: t('about.whyItems.outdoor.title'),
            text: t('about.whyItems.outdoor.description'),
            image: "/assets/images/waarom_1.JPG",
            icon: Leaf
        },
        {
            id: 'maatwerk',
            title: t('about.whyItems.custom.title'),
            text: t('about.whyItems.custom.description'),
            image: "/assets/images/waarom_2.JPG",
            icon: Ruler
        },
        {
            id: 'garantie',
            title: t('about.whyItems.warranty.title'),
            text: t('about.whyItems.warranty.description'),
            image: "/assets/images/waarom_3.JPG",
            icon: ShieldCheck
        },
        {
            id: 'service',
            title: t('about.whyItems.service.title'),
            text: t('about.whyItems.service.description'),
            image: "/assets/images/waarom_4.JPG",
            icon: HeartHandshake
        },
        {
            id: 'montage',
            title: t('about.whyItems.assembly.title'),
            text: t('about.whyItems.assembly.description'),
            image: "/assets/images/waarom_5.JPG",
            icon: Wrench
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* Hero / Header */}
            <PageHeader
                title={t('about.title')}
                subtitle={t('about.subtitle')}
                description={t('about.description')}
                image="/assets/images/hero_veranda.webp"
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* Intro Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-2 block">{t('about.storyBadge')}</span>
                        <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-6">{t('about.storyTitle')}</h2>
                        <div className="prose prose-lg text-gray-600 leading-relaxed">
                            <p>{t('about.storyParagraph1')}</p>
                            <p>{t('about.storyParagraph2')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src="/assets/images/overons_1.JPG" className="rounded-2xl w-full h-full object-cover shadow-lg transform translate-y-8" alt="Productie" />
                        <img src="/assets/images/overons_2.JPG" className="rounded-2xl w-full h-full object-cover shadow-lg" alt="Montage" />
                    </div>
                </div>

                {/* WAAROM HETT Section (Interactive Tabs) */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-black text-hett-dark text-center mb-12">{t('about.whyTitle')}</h2>
                    <div className="bg-white rounded-[32px] overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left: Tabs */}
                            <div className="lg:col-span-5 space-y-4">
                                {WHY_ITEMS.map((item, index) => {
                                    const isActive = activeTab === index;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => setActiveTab(index)}
                                            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${isActive
                                                ? 'bg-hett-dark text-white shadow-xl scale-[1.02] border-hett-dark'
                                                : 'bg-[#f4f2ee] text-hett-dark hover:bg-[#e9e6e0] border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-hett-brown text-white' : 'text-hett-brown bg-white'
                                                    }`}>
                                                    <item.icon size={20} strokeWidth={2.5} />
                                                </div>
                                                <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-hett-dark'}`}>
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${isActive ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'}`}>
                                                <div className="overflow-hidden">
                                                    <p className={`text-sm leading-relaxed ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right: Dynamic Image */}
                            <div className="lg:col-span-7 relative h-[500px] lg:h-auto rounded-[32px] overflow-hidden shadow-2xl group">
                                <AnimatePresence mode='wait'>
                                    <motion.img
                                        key={activeTab}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        src={WHY_ITEMS[activeTab].image}
                                        alt={WHY_ITEMS[activeTab].title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </AnimatePresence>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-2xl">
                                    <AnimatePresence mode='wait'>
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.4, delay: 0.2 }}
                                        >
                                            <h3 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
                                                {WHY_ITEMS[activeTab].title}
                                            </h3>
                                            <p className="text-white/90 text-base md:text-lg font-medium leading-relaxed">
                                                {WHY_ITEMS[activeTab].text}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>



            </div>
        </div>
    );
};

export default About;
