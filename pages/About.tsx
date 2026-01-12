
import React, { useState } from 'react';
import { Users, Globe, Award, Leaf, Ruler, ShieldCheck, HeartHandshake, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const WHY_ITEMS = [
    {
        id: 'buitenleven',
        title: "Altijd binnen, het hele jaar buiten!",
        text: "Met een HETT veranda geniet u vier seizoenen lang van uw tuin. Beschut tegen regen en wind, maar met het volledige buitengevoel creëert u een verlengstuk van uw woonkamer.",
        image: "/assets/images/waarom_1.JPG",
        icon: Leaf
    },
    {
        id: 'maatwerk',
        title: "Maatwerk voor elke tuin",
        text: "Geen tuin is hetzelfde. Daarom leveren wij al onze systemen op de millimeter nauwkeurig. Of het nu gaat om een schuine gevel, een specifieke diepte of een bijzondere kleur; wij realiseren het.",
        image: "/assets/images/waarom_2.JPG",
        icon: Ruler
    },
    {
        id: 'garantie',
        title: "10 jaar garantie op alle veranda's",
        text: "Wij geven op al onze veranda's 10 jaar garantie op het materiaal, de constructie en de coating. Hiermee koopt u een echt kwaliteitsproduct met jarenlang zorgeloos plezier. Tevens voldoen wij aan de strengste normen.",
        image: "/assets/images/waarom_3.JPG",
        icon: ShieldCheck
    },
    {
        id: 'service',
        title: "Klantgerichte service en transparantie",
        text: "Van eerlijk advies in de showroom tot heldere communicatie over de levering. Wij houden van korte lijnen en afspraak is afspraak. Geen verrassingen achteraf.",
        image: "/assets/images/waarom_4.JPG",
        icon: HeartHandshake
    },
    {
        id: 'montage',
        title: "Eenvoudige montage",
        text: "Onze systemen zijn ontworpen als slimme bouwpakketten voor de handige doe-het-zelver of professional. Met onze uitgebreide handleidingen en video's kunt u direct aan de slag.",
        image: "/assets/images/waarom_5.JPG",
        icon: Wrench
    }
];

const About: React.FC = () => {
    const [activeTab, setActiveTab] = useState(2); // Start with Warranty active (index 2)

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* Hero / Header */}
            <PageHeader
                title="De standaard in Verandabouw"
                subtitle="Over HETT"
                description="Wij leveren niet zomaar veranda's; wij leveren de basis voor hoogwaardige buitenruimtes. Ontdek ons verhaal en onze missie."
                image="/assets/images/hero_veranda.webp"
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* Intro Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-2 block">ONS VERHAAL</span>
                        <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-6">Gedreven door kwaliteit en maatwerk</h2>
                        <div className="prose prose-lg text-gray-600 leading-relaxed">
                            <p>
                                Bij HETT Veranda draait alles om één ding: een veranda die klopt. In uitstraling, in afwerking en in gebruiksgemak. We combineren strakke aluminium profielen met slimme oplossingen voor dak, goot en wanden—zodat je buitenruimte aanvoelt als een volwaardige uitbreiding van je woning.
                            </p>
                            <p>
                                Of je nu kiest voor een standaard veranda of een maatwerk samenstelling: je ziet direct wat je krijgt en wat het kost. Transparant, overzichtelijk en gemaakt om jarenlang van te genieten.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src="/assets/images/overons_1.JPG" className="rounded-2xl w-full h-full object-cover shadow-lg transform translate-y-8" alt="Productie" />
                        <img src="/assets/images/overons_2.JPG" className="rounded-2xl w-full h-full object-cover shadow-lg" alt="Montage" />
                    </div>
                </div>

                {/* WAAROM HETT Section (Interactive Tabs) */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-black text-hett-dark text-center mb-12">Waarom HETT?</h2>
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
