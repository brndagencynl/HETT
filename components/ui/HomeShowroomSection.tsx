import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const HomeShowroomSection: React.FC = () => {
    return (
        <section className="py-12 md:py-20 bg-hett-light/30">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-16 items-center">
                    {/* Text Content */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <span className="text-hett-secondary text-sm font-bold tracking-widest uppercase mb-2 block">
                                SHOWROOM
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-hett-dark leading-tight">
                                Bekijk onze veranda's en panelen in het echt.
                            </h2>
                        </div>

                        <div className="space-y-4 text-hett-muted text-lg leading-relaxed">
                            <p>
                                In onze showroom krijg je een goed beeld van onze veranda's, sandwichpanelen en afwerkingen.
                                Je ziet en voelt direct het verschil in materialen, kleuren en details — wel zo prettig bij het maken van de juiste keuze.
                            </p>
                            <p>
                                Onze specialisten staan voor je klaar om mee te denken over maatvoering, montage en toepassingen.
                                Of je nu komt oriënteren of al concrete plannen hebt: je bent van harte welkom.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/contact" className="btn-primary px-8 py-3.5 text-base shadow-sm hover:shadow-md transition-all group">
                                Bezoek de showroom
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/contact#route" className="px-8 py-3.5 text-base font-bold text-hett-dark border border-gray-300 rounded-lg hover:border-hett-dark hover:bg-white transition-all inline-flex items-center gap-2">
                                <MapPin size={18} />
                                Route & openingstijden
                            </Link>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="flex-1 w-full">
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl bg-gray-100 group">
                            <img
                                src="/assets/images/home_showroom.JPG"
                                alt="HETT Showroom"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Subtle overlay/shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeShowroomSection;
