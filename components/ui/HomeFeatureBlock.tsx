import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HomeFeatureBlockProps {
    title?: string;
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
    reverse?: boolean;
}

const HomeFeatureBlock: React.FC<HomeFeatureBlockProps> = ({
    title,
    imageSrc = "/assets/images/productafb.webp",
    imageAlt = "Isopar\u00ae Plus Lambris",
    reverse = false,
}) => {
    const { t } = useTranslation();
    const displayTitle = title || t('home.feature.title');

    return (
        <section className="py-12 md:py-20 bg-hett-light/30">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Text Content */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <span className="text-hett-secondary text-sm font-bold tracking-widest uppercase mb-2 block">
                                {t('home.feature.badge')}
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-hett-dark leading-tight">
                                {displayTitle}
                            </h2>
                        </div>

                        <div className="space-y-4 text-hett-muted text-lg leading-relaxed">
                            <p>{t('home.feature.description1')}</p>
                            <p>{t('home.feature.description2')}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/products/sandwichpaneel" className="btn-primary px-8 py-3.5 text-base shadow-sm hover:shadow-md transition-all group">
                                {t('home.feature.cta')}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="flex-1 w-full">
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl bg-gray-100 group">
                            <img
                                src={imageSrc}
                                alt={imageAlt}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeFeatureBlock;
