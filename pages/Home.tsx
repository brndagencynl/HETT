import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star, Wrench, Truck, Package, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Post } from '../types';
import { content } from '../services/content';
import {
    getHomepageHero,
    getHomepageUsps,
    getHomepageFaq,
    HomepageHero,
    HomepageUsp,
    FaqItem,
    FALLBACK_HERO,
    FALLBACK_USPS,
    FALLBACK_FAQ,
} from '../services/shopify';
import { getLatestProjectCards, ProjectCard } from '../src/services/shopify';
import InspirationStrip from '../components/ui/InspirationStrip';
import BlogCarousel from '../components/ui/BlogCarousel';
import HomeFeatureBlock from '../components/ui/HomeFeatureBlock';
import HomeShowroomSection from '../components/ui/HomeShowroomSection';
import HomeFAQ from '../components/ui/HomeFAQ';
import VerandaPresetCard from '../components/ui/VerandaPresetCard';
import { POPULAIRE_VERANDA_KAARTEN } from '../config/homepageContent';

// Icon mapping for USPs
const iconMap: Record<string, LucideIcon> = {
    Wrench,
    Truck,
    Package,
    Award,
    Check,
};

const Home: React.FC = () => {
    // Shopify content state
    const [hero, setHero] = useState<HomepageHero>(FALLBACK_HERO);
    const [usps, setUsps] = useState<HomepageUsp[]>(FALLBACK_USPS);
    const [faqItems, setFaqItems] = useState<FaqItem[]>(FALLBACK_FAQ);
    const [projectCards, setProjectCards] = useState<ProjectCard[]>([]);

    // Blog posts
    const [blogPosts, setBlogPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fetch all Shopify content
    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch all content in parallel
                const [heroData, uspsData, faqData, projectCardsData, postsData] = await Promise.all([
                    getHomepageHero(),
                    getHomepageUsps(),
                    getHomepageFaq(),
                    getLatestProjectCards(6),
                    content.getPosts(6),
                ]);

                // Update state with fetched data or keep fallbacks
                if (heroData) setHero(heroData);
                if (uspsData.length > 0) setUsps(uspsData);
                if (faqData.length > 0) setFaqItems(faqData);
                if (projectCardsData.length > 0) setProjectCards(projectCardsData);

                setBlogPosts(postsData);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch homepage content:', err);
                setError(true);
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return (
        <div className="pt-4 pb-20 bg-hett-bg">


            {/* Hero Section - 50/50 Two Column Layout */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Standaard Veranda Block */}
                    <Link 
                        to="/categorie/verandas" 
                        className="relative rounded-xl overflow-hidden group min-h-[350px] md:min-h-[450px] lg:min-h-[500px] card-retail p-0 block"
                    >
                        <img
                            src="/assets/images/homepagina_2.jpg"
                            alt="Standaard veranda's"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-hett-dark/80 via-hett-dark/40 to-transparent"></div>
                        <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col justify-end">
                            <span className="bg-hett-secondary text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-3 inline-block uppercase w-fit">
                                STANDAARD
                            </span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                                Standaard veranda's
                            </h2>
                            <p className="text-white/90 text-sm md:text-base lg:text-lg font-medium mb-6 max-w-md">
                                Kies een standaard maat en stel uw veranda samen in de configurator.
                            </p>
                            <span className="btn-secondary px-6 md:px-8 py-3 md:py-4 text-sm md:text-base w-fit inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                                Stel standaard samen
                                <ArrowRight size={18} />
                            </span>
                        </div>
                    </Link>

                    {/* Maatwerk Veranda Block */}
                    <Link 
                        to="/maatwerk-configurator" 
                        className="relative rounded-xl overflow-hidden group min-h-[350px] md:min-h-[450px] lg:min-h-[500px] card-retail p-0 block"
                    >
                        <img
                            src="/assets/images/homepagina_1.jpg"
                            alt="Maatwerk veranda's"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-hett-dark/80 via-hett-dark/40 to-transparent"></div>
                        <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col justify-end">
                            <span className="bg-hett-primary text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-md mb-3 inline-block uppercase w-fit">
                                MAATWERK
                            </span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                                Maatwerk veranda's
                            </h2>
                            <p className="text-white/90 text-sm md:text-base lg:text-lg font-medium mb-6 max-w-md">
                                Bepaal zelf breedte en diepte en kies alle opties op maat.
                            </p>
                            <span className="btn-secondary px-6 md:px-8 py-3 md:py-4 text-sm md:text-base w-fit inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                                Stel maatwerk samen
                                <ArrowRight size={18} />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            {/* USP Bar - Dynamic from Shopify */}
            <div className="bg-hett-light py-6 border-y border-gray-200 mb-0">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-8 overflow-x-auto no-scrollbar snap-x">
                        {usps.map((usp, i) => {
                            const IconComponent = iconMap[usp.iconName] || Check;
                            return (
                                <div key={i} className="flex items-center gap-3 flex-shrink-0 snap-center">
                                    <IconComponent size={18} className="text-hett-secondary" strokeWidth={4} />
                                    <span className="text-hett-dark font-bold text-sm whitespace-nowrap uppercase tracking-tight">
                                        {usp.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Populaire keuzes - Hardcoded Veranda Cards */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 mb-20">
                {/* Header - same style as Inspiratie section */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-hett-dark">Populaire keuzes</h2>
                    <Link
                        to="/categorie/verandas"
                        className="px-4 py-2 border border-gray-300 rounded-full text-sm font-bold text-hett-dark hover:bg-gray-50 transition-colors"
                    >
                        Bekijk alle veranda's
                    </Link>
                </div>

                {/* 3-column grid: 1 col mobile, 2 col tablet, 3 col desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {POPULAIRE_VERANDA_KAARTEN.map((card) => (
                        <VerandaPresetCard key={card.key} card={card} />
                    ))}
                </div>
            </div>

            {/* Feature Block - Sandwichpanelen */}
            <HomeFeatureBlock imageSrc="/assets/images/isopar_home.jpeg" />

            {/* Showroom Section */}
            <HomeShowroomSection />

            {/* FAQ Section */}
            <HomeFAQ items={faqItems} />
        </div>
    );
};

export default Home;