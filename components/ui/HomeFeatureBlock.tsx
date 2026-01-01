import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface HomeFeatureBlockProps {
    title?: string;
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
    reverse?: boolean;
}

const HomeFeatureBlock: React.FC<HomeFeatureBlockProps> = ({
    title = "Isopar® Plus Lambris: strak geïsoleerde wanden.",
    imageSrc = "/assets/images/productafb.jpg",
    imageAlt = "Isopar® Plus Lambris",
    reverse = false,
}) => {
    return (
        <section className="py-12 md:py-20 bg-hett-light/30">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Text Content */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <span className="text-hett-secondary text-sm font-bold tracking-widest uppercase mb-2 block">
                                SANDWICHPANELEN
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-hett-dark leading-tight">
                                {title}
                            </h2>
                        </div>

                        <div className="space-y-4 text-hett-muted text-lg leading-relaxed">
                            <p>
                                Isopar® Plus Lambris is een geïsoleerd sandwichpaneel met een strakke lambris-afwerking. Het helpt warmteverlies en tocht te beperken en geeft je wand direct een nette, rustige uitstraling.
                            </p>
                            <p>
                                Dankzij het slimme profiel monteer je snel en nauwkeurig — prettig voor doe-het-zelvers en efficiënt voor professionals. Geschikt voor wanden van veranda’s en overkappingen, met snelle levering en flexibiliteit in maat en uitvoering.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/products/sandwichpaneel" className="btn-primary px-8 py-3.5 text-base shadow-sm hover:shadow-md transition-all group">
                                Lees meer
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/contact" className="px-8 py-3.5 text-base font-bold text-hett-dark border border-gray-300 rounded-lg hover:border-hett-dark hover:bg-white transition-all">
                                Offerte aanvragen
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
                            {/* Subtle overlay/shine effect optional */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeFeatureBlock;
