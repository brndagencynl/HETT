
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Droplets, TrendingUp, Star, CheckCircle2, Quote, ArrowUpRight, Calendar } from 'lucide-react';
import { USP_LIST, NEWS_ITEMS } from '../constants';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    company: "Veranda Totaal BV",
    quote: "Sinds we met HETT werken is onze montagetijd met 20% verkort dankzij de nauwkeurige zaagservice.",
    author: "Jan van der Berg",
    role: "Eigenaar",
    avatar: "https://picsum.photos/100/100?random=201"
  },
  {
    company: "Jansen Buitenleven",
    quote: "De kwaliteit van de Eco+ panelen is ongeëvenaard. Klanten merken direct het verschil in isolatie.",
    author: "Peter Jansen",
    role: "Directeur",
    avatar: "https://picsum.photos/100/100?random=202"
  },
  {
    company: "Bouwbedrijf De Vries",
    quote: "Betrouwbare leveringen en een klantenservice die écht meedenkt bij complexe projecten.",
    author: "Mark de Vries",
    role: "Projectleider",
    avatar: "https://picsum.photos/100/100?random=203"
  }
];

const SLIDER_ITEMS = [
    { title: "Tuinkamer Modern", image: "https://picsum.photos/600/400?random=401" },
    { title: "Veranda Klassiek", image: "https://picsum.photos/600/400?random=402" },
    { title: "Glazen Schuifwand", image: "https://picsum.photos/600/400?random=403" },
    { title: "Carport Aluminium", image: "https://picsum.photos/600/400?random=404" },
    { title: "Horeca Overkapping", image: "https://picsum.photos/600/400?random=405" },
    { title: "Lichtstraat Detail", image: "https://picsum.photos/600/400?random=406" },
    { title: "Zwart Zweeds Rabat", image: "https://picsum.photos/600/400?random=407" },
    { title: "Industriële Look", image: "https://picsum.photos/600/400?random=408" },
];

const Home: React.FC = () => {
  const [uspsVisible, setUspsVisible] = useState(false);
  const uspRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setUspsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (uspRef.current) {
      observer.observe(uspRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const iconMap: Record<string, React.ElementType> = {
    'ShieldCheck': ShieldCheck,
    'Droplets': Droplets,
    'Truck': Truck,
    'TrendingUp': TrendingUp
  };

  return (
    <div className="pt-[210px] md:pt-[120px] font-sans pb-20">
      
      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-h-[auto] lg:h-[600px] xl:h-[600px]">
            
            {/* Left Card: Brand/Action */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-gradient-to-br from-[#6d4026] to-[#4a2c1a] rounded-[24px] md:rounded-[32px] p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-center text-white shadow-sm relative overflow-hidden h-[450px] sm:h-[500px] lg:h-auto"
            >
                <div className="relative z-10 flex flex-col h-full justify-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] mb-4 sm:mb-6 tracking-tighter"
                    >
                        Slim gebouwd<br/>
                        <span className="text-white/90">Sterk in panelen</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-base sm:text-lg text-white/80 mb-8 sm:mb-10 max-w-md font-medium leading-relaxed"
                    >
                        Onze sandwichpanelen zijn ontworpen voor professionals. Direct uit voorraad, op maat gezaagd en geleverd in de Benelux.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="mt-auto sm:mt-0"
                    >
                        <Link to="/producten">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex w-full sm:w-auto justify-center items-center bg-white text-hett-dark px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
                            >
                                Bekijk aanbod <ArrowRight size={20} className="ml-2" />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
                {/* Abstract decorative shapes */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
            </motion.div>

            {/* Right Card: Visual */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="relative rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm group h-[300px] sm:h-[400px] lg:h-auto"
            >
                <img 
                    src="https://picsum.photos/1200/800?random=101" 
                    alt="Veranda met HETT panelen" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Slimglass style sticker */}
                <motion.div 
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 12 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.8 }}
                    className="absolute top-4 right-4 sm:top-8 sm:right-8 md:top-12 md:right-12 bg-orange-500 text-white rounded-full w-20 h-20 sm:w-28 h-28 flex flex-col items-center justify-center shadow-lg z-20"
                >
                    <span className="font-black text-xl sm:text-3xl leading-none">9.2</span>
                    <div className="flex text-white/90">
                        <Star size={10} fill="currentColor" strokeWidth={0} />
                        <Star size={10} fill="currentColor" strokeWidth={0} />
                        <Star size={10} fill="currentColor" strokeWidth={0} />
                        <Star size={10} fill="currentColor" strokeWidth={0} />
                        <Star size={10} fill="currentColor" strokeWidth={0} />
                    </div>
                </motion.div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-white">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2 inline-block">Project uitgelicht</span>
                    <h3 className="text-xl sm:text-2xl font-bold">Luxe Tuinkamer Utrecht</h3>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Scrolling USP Bar */}
      <div ref={uspRef} className="w-full bg-white border-y border-gray-100 overflow-hidden py-8 mb-20">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">Onze voordelen</h2>
            
            {/* Unified Responsive Grid/Carousel */}
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0 no-scrollbar">
                {USP_LIST.map((usp, i) => {
                    const Icon = iconMap[usp.icon] || ShieldCheck;
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={uspsVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 flex flex-col items-start"
                        >
                            <div className="w-14 h-14 bg-[#f0fdf4] text-green-600 rounded-2xl flex items-center justify-center mb-4">
                                <Icon size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-hett-dark text-lg mb-2">{usp.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{usp.description}</p>
                        </motion.div>
                    )
                })}
            </div>
         </div>
      </div>

      {/* Categorieën Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <h2 className="text-4xl font-black text-hett-dark tracking-tight mb-8">Categorieën</h2>

        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0 no-scrollbar">
            
            {/* Card 1: Dakpanelen */}
            <Link to="/producten" className="snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink group relative h-[500px] rounded-[32px] overflow-hidden block">
                <img src="https://picsum.photos/800/1000?random=20" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Dakpanelen" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <p className="text-white text-xl font-medium leading-snug max-w-[80%] drop-shadow-sm translate-y-0 transition-transform duration-500">
                        Maximale isolatie voor uw veranda met Eco+ panelen.
                    </p>
                    
                    <div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-6 transition-all duration-300 group-hover:bg-white group-hover:text-hett-dark group-hover:scale-110">
                            <ArrowRight size={28} strokeWidth={2} />
                        </div>
                        <h3 className="text-white text-4xl font-bold leading-tight drop-shadow-sm">
                            Dakpanelen
                        </h3>
                    </div>
                </div>
            </Link>

            {/* Card 2: Wandpanelen */}
            <Link to="/producten" className="snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink group relative h-[500px] rounded-[32px] overflow-hidden block">
                <img src="https://picsum.photos/800/1000?random=21" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Wandpanelen" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <p className="text-white text-xl font-medium leading-snug max-w-[80%] drop-shadow-sm">
                        Creëer een strakke, moderne gevel met blinde bevestiging.
                    </p>
                    
                    <div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-6 transition-all duration-300 group-hover:bg-white group-hover:text-hett-dark group-hover:scale-110">
                            <ArrowRight size={28} strokeWidth={2} />
                        </div>
                        <h3 className="text-white text-4xl font-bold leading-tight drop-shadow-sm">
                            Wandpanelen
                        </h3>
                    </div>
                </div>
            </Link>

            {/* Card 3: Profielen/Zetwerk */}
            <Link to="/producten" className="snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink group relative h-[500px] rounded-[32px] overflow-hidden block">
                <img src="https://picsum.photos/800/1000?random=22" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Profielen" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <p className="text-white text-xl font-medium leading-snug max-w-[80%] drop-shadow-sm">
                        Maak het project compleet met bijpassend zetwerk.
                    </p>
                    
                    <div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-6 transition-all duration-300 group-hover:bg-white group-hover:text-hett-dark group-hover:scale-110">
                            <ArrowRight size={28} strokeWidth={2} />
                        </div>
                        <h3 className="text-white text-4xl font-bold leading-tight drop-shadow-sm">
                            Profielen<br/>& Accessoires
                        </h3>
                    </div>
                </div>
            </Link>

        </div>
      </div>

      {/* Infinite Inspiration Slider */}
      <div className="w-full bg-white py-16 border-y border-gray-100 overflow-hidden mb-24">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
            <div>
                <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-2 block">Showcase</span>
                <h2 className="text-3xl md:text-4xl font-black text-hett-dark">Inspiratie & Projecten</h2>
            </div>
            <Link to="/projecten" className="hidden md:flex items-center text-hett-dark font-bold hover:text-hett-brown transition-colors">
                Bekijk alle projecten <ArrowUpRight className="ml-1" size={20} />
            </Link>
         </div>

         <div className="relative w-full overflow-hidden group">
            <div className="flex animate-infinite-scroll w-max">
                {/* Render list twice for seamless loop */}
                {[...SLIDER_ITEMS, ...SLIDER_ITEMS].map((item, idx) => (
                    <Link 
                        to="/projecten"
                        key={idx} 
                        className="relative w-[280px] md:w-[380px] h-[280px] flex-shrink-0 mx-4 rounded-3xl overflow-hidden block group/item"
                    >
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                        <div className="absolute bottom-6 left-6">
                            <h4 className="text-white font-bold text-xl mb-1">{item.title}</h4>
                            <div className="h-1 w-0 bg-white group-hover/item:w-12 transition-all duration-300"></div>
                        </div>
                    </Link>
                ))}
            </div>
         </div>
      </div>

      {/* Installation / Service Banner */}
      <div className="bg-hett-dark text-white py-20 mb-20 overflow-hidden relative">
         <div className="absolute inset-0 opacity-20">
             <img src="https://picsum.photos/1920/600?random=99" className="w-full h-full object-cover grayscale" alt="Background" />
         </div>
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                     <h2 className="text-3xl md:text-4xl font-black mb-6">Niet zeker over de montage?</h2>
                     <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                         Onze panelen zijn ontworpen voor eenvoudige installatie. Met onze uitgebreide handleidingen en instructievideo's kunt u direct aan de slag. 
                         Toch liever uitbesteden? Wij brengen u in contact met een erkende HETT-dealer in uw regio.
                     </p>
                     <div className="flex flex-wrap gap-4">
                         <Link to="/downloads" className="bg-white text-hett-dark px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors">
                             Bekijk handleidingen
                         </Link>
                         <Link to="/contact" className="border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors">
                             Vind een monteur
                         </Link>
                     </div>
                 </div>
                 <div className="hidden lg:block relative">
                     {/* Abstract Graphic */}
                     <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                         <div className="flex items-start gap-4 mb-6">
                             <div className="bg-green-500 rounded-full p-1 mt-1"><CheckCircle2 size={16} className="text-white" /></div>
                             <div>
                                 <h4 className="font-bold text-lg">Stap 1: Voorbereiding</h4>
                                 <p className="text-sm text-gray-400">Zorg voor een rechte onderconstructie met de juiste afschot (min. 5 graden).</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-4 mb-6">
                             <div className="bg-green-500 rounded-full p-1 mt-1"><CheckCircle2 size={16} className="text-white" /></div>
                             <div>
                                 <h4 className="font-bold text-lg">Stap 2: Plaatsing</h4>
                                 <p className="text-sm text-gray-400">Leg het eerste paneel haaks en schroef deze vast in de hoge golf.</p>
                             </div>
                         </div>
                         <div className="flex items-start gap-4">
                             <div className="bg-white/20 rounded-full p-1 mt-1"><CheckCircle2 size={16} className="text-white" /></div>
                             <div>
                                 <h4 className="font-bold text-lg">Stap 3: Afwerking</h4>
                                 <p className="text-sm text-gray-400">Monteer de zetwerk profielen voor een waterdichte afsluiting.</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* Dealer Testimonials Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
              <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-2 block">Ervaringen</span>
              <h2 className="text-3xl md:text-4xl font-black text-hett-dark tracking-tight">Partners aan het woord</h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-6 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0 no-scrollbar">
              {TESTIMONIALS.map((item, i) => (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.5 }}
                      className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 relative group hover:shadow-lg transition-shadow snap-center min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink"
                  >
                      <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Quote size={48} className="text-hett-brown fill-current" />
                      </div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                          <img src={item.avatar} alt={item.author} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm bg-gray-100" />
                          <div>
                              <h4 className="font-bold text-hett-dark text-sm">{item.company}</h4>
                              <div className="text-xs text-gray-500 font-medium">{item.author}, {item.role}</div>
                          </div>
                      </div>
                      <p className="text-gray-600 italic relative z-10 leading-relaxed text-sm">
                          "{item.quote}"
                      </p>
                  </motion.div>
              ))}
          </div>
      </div>

      {/* Latest News */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
              <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-2 block">Kennisbank</span>
              <h2 className="text-3xl md:text-4xl font-black text-hett-dark tracking-tight">Nieuws & Updates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {NEWS_ITEMS.slice(0, 3).map((item, i) => (
                  <Link to={`/nieuws/${item.id}`} key={i} className="group block">
                      <div className="rounded-2xl overflow-hidden mb-4 relative h-60">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded text-xs font-bold text-hett-dark shadow-md">
                              {item.category}
                          </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                          <Calendar size={14} /> {item.date}
                      </div>
                      <h3 className="font-bold text-xl text-hett-dark mb-2 group-hover:text-hett-brown transition-colors leading-tight">
                          {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                          {item.excerpt}
                      </p>
                  </Link>
              ))}
          </div>
      </div>

    </div>
  );
};

export default Home;
