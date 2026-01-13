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
import HomeHeroShowcase from '../components/ui/HomeHeroShowcase';
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

            {/* Hero Section - Full-width showcase with thumbnail strip */}
            <HomeHeroShowcase />

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
            //<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 mb-20">
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

            {/* Showroom Section */}
            <HomeShowroomSection />

            {/* FAQ Section */}
            <HomeFAQ items={faqItems} />
        </div>
    );
};

export default Home;