import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Calendar, Clock } from 'lucide-react'; // Added icons for blog meta
import { NEWS_ITEMS } from '../../constants';
import { Post } from '../../types';

interface BlogCarouselProps {
    items?: Post[];
}

const BlogCarousel: React.FC<BlogCarouselProps> = ({ items = [] }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollNext = () => {
        if (scrollContainerRef.current) {
            const cardWidth = 320; // Slightly wider for blog cards
            const gap = 32; // gap-8
            scrollContainerRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-12 md:py-16 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-hett-dark">Nieuws & inspiratie</h2>
                    <Link
                        to="/nieuws"
                        className="px-4 py-2 border border-gray-300 rounded-full text-sm font-bold text-hett-dark hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        Bekijk alle artikelen
                    </Link>
                </div>

                {/* Stripe Container */}
                <div className="relative group">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
                        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                    >
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                to={`/nieuws/${item.id}`} // Using existing NewsDetail route
                                className="flex-none w-[300px] md:w-[350px] snap-start group/card flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                            >
                                {/* Image Container */}
                                <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                    />
                                    {item.category && (
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-hett-dark shadow-sm uppercase tracking-wider">
                                            {item.category}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-hett-secondary" /> {item.date}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-hett-secondary" /> {item.readingTime}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-hett-dark mb-3 leading-tight line-clamp-2 min-h-[3rem] group-hover/card:text-hett-primary transition-colors">
                                        {item.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-hett-muted text-sm leading-relaxed mb-6 line-clamp-2">
                                        {item.excerpt}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-auto flex items-center text-sm font-bold text-hett-dark">
                                        Lees meer
                                        <ArrowRight
                                            size={16}
                                            className="ml-2 text-hett-secondary group-hover/card:translate-x-1 transition-transform duration-300"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-12 h-12 rounded-full bg-hett-dark text-white shadow-xl flex items-center justify-center hover:bg-hett-primary transition-colors hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Volgende"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BlogCarousel;
