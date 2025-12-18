import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star } from 'lucide-react';
import { PROJECTS, PRODUCTS } from '../constants';

const NEW_USPS = [
    "Eenvoudig zelf te monteren",
    "Binnen 10 werkdagen geleverd",
    "Gratis thuisbezorgd",
    "Duitse Precisie & Vakmanschap"
];

const Home: React.FC = () => {
  const bestsellerProducts = PRODUCTS.filter(p => 
    ['veranda-306-250-opaal', 'veranda-306-250-helder'].includes(p.id)
  );

  return (
    <div className="pt-[185px] md:pt-[200px] pb-20 bg-hett-bg">
      
      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative rounded-xl overflow-hidden group min-h-[400px] md:min-h-[500px] card-retail p-0">
                <img 
                    src="https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop" 
                    alt="Terrasoverkapping" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-hett-dark/70 to-transparent"></div>
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
                    <span className="text-hett-secondary uppercase tracking-widest text-sm font-bold mb-3">HETT Premium</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                        Terrasoverkappingen <br/> vanaf €839
                    </h2>
                    <p className="text-white/90 text-lg md:text-xl font-medium mb-8">
                        De beste en voordeligste in de markt voor de doe-het-zelver!
                    </p>
                    <div>
                        <Link to="/categorie/overkappingen" className="btn-secondary px-10 py-4 text-lg">
                            Bekijk assortiment
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Link to="/contact" className="card-retail p-0 relative overflow-hidden group flex-1 block">
                    <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" alt="Service" />
                    <div className="absolute inset-0 bg-hett-dark/20"></div>
                    <div className="absolute bottom-6 left-6">
                        <span className="bg-hett-primary text-white text-[10px] font-bold px-3 py-1 rounded-md mb-2 inline-block uppercase">Service</span>
                        <h3 className="text-hett-dark font-black text-xl">Advies op maat?</h3>
                    </div>
                </Link>
                <Link to="/showroom" className="card-retail p-0 relative overflow-hidden group flex-1 block">
                    <img src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" alt="Showroom" />
                    <div className="absolute inset-0 bg-hett-dark/20"></div>
                    <div className="absolute bottom-6 left-6">
                        <span className="bg-hett-primary text-white text-[10px] font-bold px-3 py-1 rounded-md mb-2 inline-block uppercase">Bezoek ons</span>
                        <h3 className="text-hett-dark font-black text-xl">Bezoek de showroom</h3>
                    </div>
                </Link>
          </div>
        </div>
      </div>

      {/* USP Bar - Retail Layout */}
      <div className="bg-hett-light py-6 border-y border-gray-200 mb-20">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-8 overflow-x-auto no-scrollbar snap-x">
                {NEW_USPS.map((usp, i) => (
                    <div key={i} className="flex items-center gap-3 flex-shrink-0 snap-center">
                        <Check size={18} className="text-hett-secondary" strokeWidth={4} />
                        <span className="text-hett-dark font-bold text-sm whitespace-nowrap uppercase tracking-tight">{usp}</span>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Inspiratie Section - EXACT Retail Layout A */}
      <div className="mb-24 py-12">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-hett-dark">Inspiratie voor buitenleven</h2>
                <Link to="/projecten" className="btn-outline px-6 py-2.5 text-sm">
                    Bekijk alle projecten
                </Link>
            </div>
            
            {/* Horizontal Tiles with Label Underneath */}
            <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x pb-8 mask-fade-sides">
                {PROJECTS.map((project) => (
                    <Link key={project.id} to={`/projecten/${project.id}`} className="min-w-[240px] md:min-w-[300px] lg:flex-1 flex-shrink-0 snap-start group">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-200 mb-5 border border-gray-100 shadow-soft">
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-base font-bold text-hett-dark truncate pr-2 group-hover:text-hett-primary transition-colors">{project.title}</h3>
                            <div className="w-8 h-8 rounded-lg bg-hett-light flex items-center justify-center text-hett-primary group-hover:bg-hett-primary group-hover:text-white transition-all shadow-sm">
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Thin Divider under tiles */}
            <div className="w-full h-px bg-gray-200 mt-4"></div>
         </div>
      </div>

      {/* Popular Products - Grid layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mb-12 border-l-4 border-hett-secondary pl-6">
            <h2 className="text-3xl md:text-4xl font-black text-hett-dark leading-tight uppercase tracking-tighter">
                Populaire keuzes
            </h2>
            <p className="text-hett-muted font-medium mt-2">Geselecteerd door onze klanten.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
                <div key={product.id} className="card-retail p-0 flex flex-col group overflow-hidden bg-white">
                    <Link to={`/product/${product.id}`} className="relative block aspect-[1/1] bg-hett-light overflow-hidden">
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                        {product.isBestseller && (
                            <div className="absolute top-4 left-4 bg-hett-secondary text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest shadow-retail">
                                Bestseller
                            </div>
                        )}
                    </Link>
                    <div className="p-6 flex flex-col flex-grow">
                        <Link to={`/product/${product.id}`} className="block mb-3">
                            <h3 className="text-hett-dark text-base font-bold leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-hett-primary transition-colors">
                                {product.title}
                            </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-yellow-400 mb-4">
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs text-hett-muted font-bold ml-1">(42)</span>
                        </div>
                        <div className="text-hett-dark font-black text-2xl mb-6">€{product.price},-</div>
                        <Link to={`/product/${product.id}`} className="btn-primary w-full py-3.5 text-sm uppercase tracking-wider">
                            Configureer nu
                        </Link>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;