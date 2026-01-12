import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { InspirationCard, FALLBACK_INSPIRATION } from '../../services/shopify';
import type { ProjectCard } from '../../src/services/shopify';

const PLACEHOLDER_IMAGE = '/assets/images/project-placeholder.webp';

interface InspirationItem {
    id: string;
    title: string;
    image: string;
    path: string;
}

// Static fallback for when Shopify is not configured
const staticItems: InspirationItem[] = [
    {
        id: '1',
        title: 'Overkappingen',
        image: '/assets/images/hero_veranda.webp',
        path: '/categorie/overkappingen'
    },
    {
        id: '2',
        title: 'Tuinkamers',
        image: '/assets/images/inspiration_tuinkamer.webp',
        path: '/projecten'
    },
    {
        id: '3',
        title: 'Carports',
        image: '/assets/images/inspiration_carport.webp',
        path: '/projecten'
    },
    {
        id: '4',
        title: 'Bedrijfshallen',
        image: '/assets/images/sandwich_panels_roof.webp',
        path: '/categorie/sandwichpanelen'
    },
    {
        id: '5',
        title: 'Schuifwanden',
        image: '/assets/images/glass_sliding_walls.webp',
        path: '/categorie/accessoires'
    },
    {
        id: '6',
        title: 'Dakrenovatie',
        image: 'https://images.unsplash.com/photo-1508333706533-1ec43ec476c7?q=80&w=800&auto=format&fit=crop',
        path: '/projecten'
    }
];

interface InspirationStripProps {
    items?: InspirationCard[];
    projectCards?: ProjectCard[];
}

const InspirationStrip: React.FC<InspirationStripProps> = ({ items, projectCards }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Priority: projectCards > items > static fallback
    const inspirationItems: InspirationItem[] = projectCards && projectCards.length > 0
        ? projectCards.map((card) => ({
            id: card.id,
            title: card.title,
            image: card.imageUrl,
            path: `/projecten/${card.handle}`,
        }))
        : items && items.length > 0
        ? items.map((item, index) => ({
            id: String(index + 1),
            title: item.title,
            image: item.image?.url || PLACEHOLDER_IMAGE,
            path: item.url || '/projecten', // Fallback to projecten if URL is empty
        }))
        : staticItems;

    const scrollNext = () => {
        if (scrollContainerRef.current) {
            const cardWidth = 260; // Desktop width
            const gap = 16; // gap-4
            scrollContainerRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
    };


    return (
        <section className="py-12 md:py-16 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-hett-dark">Inspiratie voor iedere ruimte</h2>
                    <Link
                        to="/projecten"
                        className="px-4 py-2 border border-gray-300 rounded-full text-sm font-bold text-hett-dark hover:bg-gray-50 transition-colors"
                    >
                        Bekijk alle ruimtes
                    </Link>
                </div>

                {/* Stripe Container */}
                <div className="relative group">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    >
                        {inspirationItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className="flex-none w-[180px] md:w-[260px] snap-start group/card"
                            >
                                {/* Image Container */}
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 mb-4 border border-gray-100">
                                    <img
                                        src={item.image || PLACEHOLDER_IMAGE}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                                    />
                                </div>
                                {/* Info */}
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-sm md:text-base font-bold text-hett-dark">{item.title}</span>
                                    <ArrowRight size={16} className="text-hett-dark" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-hett-dark text-white shadow-xl flex items-center justify-center hover:bg-hett-primary transition-colors hidden md:flex"
                        aria-label="Volgende"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 mt-8"></div>
            </div>
        </section>
    );
};

export default InspirationStrip;
