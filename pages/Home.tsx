
// ... keep imports ...
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, PenTool, CheckCircle2, Star, ArrowUpRight, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check, Calendar, Clock, HelpCircle } from 'lucide-react';
import { USP_LIST, PROJECTS, NEWS_ITEMS, PRODUCTS } from '../constants';
import { motion } from 'framer-motion';

// ... constants ...
const HOME_FAQS = [
  {
    question: "Wat kan ik bij HETT vinden?",
    answer: "Bij HETT vindt u een compleet assortiment voor uw veranda of overkapping. Van hoogwaardige aluminium profielen en sandwichpanelen tot glazen schuifwanden en complete bouwpakketten."
  },
  {
    question: "Kan ik online bestellen bij HETT?",
    answer: "Ja, onze webshop is 24/7 geopend. U kunt eenvoudig producten configureren en direct bestellen. Wij leveren door de hele Benelux."
  },
  {
    question: "Biedt HETT op maat gemaakte veranda's aan?",
    answer: "Zeker. Al onze veranda's worden op maat geproduceerd. In onze configurator kunt u de gewenste afmetingen invoeren, of neem contact op voor specifieke wensen."
  },
  {
    question: "Hoe kan ik betalen bij HETT?",
    answer: "U kunt veilig betalen via iDEAL, Bancontact, Creditcard of per bankoverschrijving. Voor zakelijke partners is betalen op rekening mogelijk na goedkeuring."
  },
  {
    question: "Heeft HETT een showroom?",
    answer: "Ja, wij hebben een uitgebreide showroom in Eindhoven waar u onze materialen en showmodellen kunt bekijken en voelen."
  },
  {
    question: "Hoe kan ik contact opnemen met HETT?",
    answer: "Wij zijn bereikbaar via telefoon, e-mail en WhatsApp. Zie onze contactpagina voor alle actuele gegevens en openingstijden."
  },
  {
    question: "Hoe kan ik een afspraak maken voor de showroom?",
    answer: "U kunt telefonisch of via het formulier op de website een afspraak inplannen, zodat een van onze adviseurs tijd voor u heeft."
  },
  {
    question: "Hoe lang duurt de installatie van een veranda?",
    answer: "Dit hangt af van de grootte en complexiteit. Een standaard veranda kan door ervaren monteurs vaak in 1 dag geplaatst worden."
  },
  {
    question: "Biedt HETT installatieservices aan?",
    answer: "Wij focussen op de levering van materialen. Voor montage werken wij samen met een netwerk van gespecialiseerde dealers en ZZP'ers die wij kunnen aanbevelen voor uw project."
  },
  {
    question: "Hoe zit het met onderhoud van een aluminium overkapping?",
    answer: "Aluminium is zeer onderhoudsvriendelijk. Jaarlijks schoonmaken met water en een zachte spons is voldoende om de coating mooi te houden."
  },
  {
    question: "Wat is de levertijd van HETT producten?",
    answer: "Standaard producten leveren wij binnen 1-2 weken. Voor maatwerk profielen of specifieke kleuren kan de levertijd iets langer zijn."
  },
  {
    question: "Is het mogelijk om glazen wanden toe te voegen aan de overkapping?",
    answer: "Ja, onze glazen schuifwanden zijn universeel en kunnen in vrijwel elke bestaande of nieuwe overkapping worden geplaatst."
  },
  {
    question: "Heeft HETT een garantie op producten?",
    answer: "Wij bieden standaard 5 jaar fabrieksgarantie op de constructie en 10 jaar op de kleurvastheid van de poedercoating."
  },
  {
    question: "Kan ik mijn tuinkamer zelf samenstellen?",
    answer: "Absoluut! Onze systemen zijn modulair. U kunt beginnen met een dak en later wanden, verlichting of verwarming toevoegen."
  }
];

const NEW_USPS = [
    "Eenvoudig zelf te monteren",
    "Binnen 10 werkdagen geleverd",
    "Gratis thuisbezorgd",
    "Duitse Precisie & Vakmanschap"
];

const Home: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Drag to scroll state
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Triple projects to ensure we have enough content for the wide slider effect
  const sliderProjects = [...PROJECTS, ...PROJECTS, ...PROJECTS];

  // Filter specific bestseller products
  const bestsellerProducts = PRODUCTS.filter(p => 
    p.id === 'veranda-306-250-opaal' || 
    p.id === 'veranda-306-250-helder' || 
    p.id === 'veranda-606-350-opaal' || 
    p.id === 'veranda-606-350-glas'
  );

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const totalScroll = scrollWidth - clientWidth;
        if (totalScroll > 0) {
             const progress = (scrollLeft / totalScroll) * 100;
             setScrollProgress(Math.min(100, Math.max(0, progress)));
        }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const { clientWidth } = scrollRef.current;
          const scrollAmount = clientWidth * 0.4; // Scroll a bit less than full width
          scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if(!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="pt-[185px] md:pt-[200px] font-sans pb-20">
      
      {/* New Hero Section Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
            
            {/* Left Main Hero */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden group min-h-[400px]">
                <img 
                    src="https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop" 
                    alt="Terrasoverkapping" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                <div className="absolute top-0 bottom-0 left-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
                    <span className="text-white/80 uppercase tracking-widest text-sm font-medium mb-3">HETT Premium</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 leading-tight">
                        Terrasoverkappingen <br/> vanaf €839
                    </h2>
                    <p className="text-white/90 text-lg md:text-xl font-light mb-8">
                        De beste en voordeligste in de markt voor de doe-het-zelver!
                    </p>
                    <div>
                        <Link 
                            to="/categorie/overkappingen" 
                            className="inline-block bg-hett-brown text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-hett-brownLight transition-colors"
                        >
                            Bekijk ons assortiment
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4 md:gap-6 h-full">
                
                {/* Top Right: Customer Service */}
                <Link to="/contact" className="relative rounded-[32px] overflow-hidden group aspect-square md:aspect-auto lg:flex-1 block">
                    <img 
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" 
                        alt="Klantenservice" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 p-4 md:p-8">
                        <span className="text-hett-brown font-bold uppercase text-[10px] md:text-xs mb-1 md:mb-2 block bg-white/90 px-2 py-1 rounded w-fit">Service</span>
                        <h3 className="text-white text-base md:text-xl lg:text-2xl font-bold leading-tight">
                            Hulp nodig?
                        </h3>
                    </div>
                </Link>

                {/* Bottom Right: Inspiration */}
                <Link to="/projecten" className="relative rounded-[32px] overflow-hidden group aspect-square md:aspect-auto lg:flex-1 block">
                    <img 
                        src="https://images.unsplash.com/photo-1599619351208-3e6c839d6828?q=80&w=2072&auto=format&fit=crop" 
                        alt="Inspiratie" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 p-4 md:p-8">
                        <span className="text-hett-brown font-bold uppercase text-[10px] md:text-xs mb-1 md:mb-2 block bg-white/90 px-2 py-1 rounded w-fit">Inspiratie</span>
                        <h3 className="text-white text-base md:text-xl lg:text-2xl font-bold leading-tight">
                            Onze projecten
                        </h3>
                    </div>
                </Link>
          </div>
        </div>
      </div>

      {/* New USP Bar - Carousel on mobile */}
      <div className="bg-[#f2f2f0] py-6 md:py-8 mb-12 md:mb-24">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex md:flex-wrap md:justify-between items-center gap-4 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0">
                {NEW_USPS.map((usp, i) => (
                    <div key={i} className="flex items-center gap-3 flex-shrink-0 snap-center bg-white md:bg-transparent px-5 py-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none min-w-[85vw] md:min-w-0 md:w-auto">
                        <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-hett-brown flex items-center justify-center flex-shrink-0 text-white">
                            <Check size={16} className="md:w-3.5 md:h-3.5" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700 font-bold md:font-medium text-base md:text-base">{usp}</span>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Single Products Grid (Replaces Categories) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="mb-10">
            <span className="text-gray-500 font-medium text-lg block mb-1">Populair</span>
            <h2 className="text-4xl md:text-5xl font-normal text-hett-dark leading-tight">
                Meest verkochte <br/> terrasoverkappingen
            </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {bestsellerProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-[20px] overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border border-transparent hover:border-gray-200">
                    <Link to={`/product/${product.id}`} className="relative block h-36 md:h-64 overflow-hidden bg-gray-100">
                        <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-[#a05a2c] text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider shadow-sm">
                            Populair
                        </div>
                    </Link>
                    <div className="p-3 md:p-6 flex flex-col flex-grow">
                        <Link to={`/product/${product.id}`} className="block mb-2">
                            <h3 className="text-[#1a1a1a] text-xs md:text-base font-normal leading-snug hover:underline line-clamp-2 min-h-[2.5em]">
                                {product.title}
                            </h3>
                        </Link>
                        
                        <div className="text-[#1a1a1a] font-bold text-xs md:text-lg mb-2 md:mb-3">
                            {product.options?.sizes?.[0] ? product.options.sizes[0].replace(/x/g, ' cm x ').replace('cm', ' cm') : '306 cm x 250 cm'}
                        </div>

                        <div className="flex items-center gap-1.5 md:gap-2 text-[#5d734e] text-[10px] md:text-sm font-medium mb-3 md:mb-6">
                            <Check size={12} strokeWidth={3} className="md:w-4 md:h-4" /> Op voorraad
                        </div>

                        <div className="mt-auto flex flex-col gap-3">
                            <div className="flex flex-col">
                                <span className="text-[#1a1a1a] font-bold text-lg md:text-xl leading-none">{product.price}</span>
                                <span className="text-gray-500 text-[10px] md:text-xs mt-1">incl. BTW</span>
                            </div>
                            <Link 
                                to={`/product/${product.id}`}
                                className="block w-full bg-[#293133] text-white text-center font-bold text-xs md:text-sm py-3 md:py-4 rounded-full hover:bg-[#1a1a1a] transition-colors"
                            >
                                Configureer nu
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Waarom HETT Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative rounded-[32px] overflow-hidden min-h-[600px] flex items-center bg-gray-900">
            <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
                alt="HETT Showroom" 
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            
            <div className="relative z-10 md:ml-12 lg:ml-24 bg-white p-8 md:p-12 rounded-[24px] shadow-2xl max-w-xl mx-4 my-8 md:my-0">
                <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-8">Waarom HETT?</h2>
                <ul className="space-y-6">
                    {[
                      {
                        title: "Eigen producent",
                        text: "Je koopt direct bij de producent, zonder tussenpartijen."
                      },
                      {
                        title: "5 jaar garantie",
                        text: "Gegarandeerde topkwaliteit met hoogwaardige materialen en afwerking."
                      },
                      {
                        title: "Topservice",
                        text: "Altijd persoonlijk advies in onze showroom of via de klantenservice. Honderden klanten beoordelen ons gemiddeld met een 9,3."
                      },
                      {
                        title: "Helder & zorgeloos geregeld",
                        text: "Gratis snelle levering, eenvoudige zelfmontage of kies voor onze professionele montageservice."
                      }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-1">
                           <Check size={14} className="text-sky-500" strokeWidth={3} /> 
                        </div>
                        <div>
                            <strong className="block text-[#1a1a1a] text-lg mb-1">{item.title}:</strong>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{item.text}</p>
                        </div>
                      </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {/* Inspiration Slider - Updated Style to Image Cards */}
      <div className="mb-24 overflow-hidden">
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-between items-end">
            <h2 className="text-3xl md:text-4xl font-black text-hett-dark">Inspiratie voor buitenleven</h2>
            <Link to="/projecten" className="text-hett-dark font-bold text-sm hidden md:flex items-center gap-2 hover:underline">
                Bekijk alle projecten <ArrowRight size={16} />
            </Link>
         </div>
         
         <div className="relative group w-full">
                {/* Navigation Buttons */}
                <button 
                    onClick={() => scroll('left')} 
                    className="absolute left-4 md:left-8 top-[40%] -translate-y-1/2 z-20 w-12 h-12 bg-white text-hett-dark rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-gray-100 opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    aria-label="Vorige"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => scroll('right')} 
                    className="absolute right-4 md:right-8 top-[40%] -translate-y-1/2 z-20 w-12 h-12 bg-white text-hett-dark rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border border-gray-100 opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    aria-label="Volgende"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Slider Container */}
                <div className="relative w-full">
                    <div 
                        ref={scrollRef}
                        onScroll={handleScroll}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="flex gap-6 overflow-x-auto no-scrollbar pb-8 px-4 md:px-8 cursor-grab active:cursor-grabbing snap-x"
                    >
                        {sliderProjects.map((project, idx) => (
                            <Link 
                                to="/projecten"
                                key={idx} 
                                className="min-w-[280px] md:min-w-[400px] flex-shrink-0 group select-none snap-center"
                            >
                                {/* Image Container */}
                                <div className="h-[350px] md:h-[500px] rounded-[24px] overflow-hidden relative bg-gray-100 mb-6">
                                    <img 
                                        src={project.imageUrl} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none" 
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-hett-dark shadow-sm uppercase tracking-wide pointer-events-none">
                                        {project.category}
                                    </div>
                                </div>

                                {/* Content Below */}
                                <div className="flex items-center justify-between border-b-2 border-transparent group-hover:border-hett-dark pb-2 transition-all duration-300">
                                    <h3 className="text-xl md:text-2xl font-bold text-hett-dark">{project.title}</h3>
                                    <ArrowRight size={24} className="text-hett-dark transform group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Progress Bar (Centered) */}
                <div className="mt-4 h-[3px] bg-gray-200 rounded-full overflow-hidden max-w-[200px] mx-auto">
                    <div 
                        className="h-full bg-hett-dark transition-all duration-100 ease-out"
                        style={{ width: `${Math.max(10, scrollProgress)}%` }} 
                    ></div>
                </div>
         </div>
         
         <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:hidden">
            <Link to="/projecten" className="flex items-center justify-between text-hett-dark font-bold text-sm border-b border-gray-200 pb-2">
                Bekijk alle projecten <ArrowRight size={16} />
            </Link>
         </div>
      </div>

      {/* Business Solutions Section (NEW) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
            <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-6 leading-tight">
                Oplossingen van HETT voor uw bedrijfslocatie
            </h2>
            <p className="text-gray-600 mb-6 text-lg font-medium">
                Bij HETT werken we uitsluitend met topmerken die staan voor kwaliteit en duurzaamheid:
            </p>
            <ul className="space-y-4 mb-8 text-gray-600 text-sm md:text-base leading-relaxed">
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-hett-brown mt-2.5 flex-shrink-0"></span>
                    <span><strong>Aluxe:</strong> Duits kwaliteitsmerk uit Kevelaer, bekend om zijn hoogwaardig aluminium, certificeringen en brede toepasbaarheid in zakelijke projecten.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-hett-brown mt-2.5 flex-shrink-0"></span>
                    <span><strong>Palmiye:</strong> terrasoverkappingen, glaswanden en zonweringsproducten voor uw horecaonderneming of andere zakelijke projecten</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-hett-brown mt-2.5 flex-shrink-0"></span>
                    <span><strong>Deponti:</strong> gespecialiseerd in stijlvolle vouwdak en lameldaksystemen, perfect voor horecaterrassen en bedrijfstuinen waar comfort en uitstraling belangrijk zijn.</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-hett-brown mt-2.5 flex-shrink-0"></span>
                    <span><strong>Redsun:</strong> Premium kwaliteit keramiek of betonbestrating voor horeca terrassen of andere toepassingen</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-hett-brown mt-2.5 flex-shrink-0"></span>
                    <span><strong>Varisol:</strong> Zonweringsdoeken en systemen van Duits fabrikaat bekend over de hele wereld.</span>
                </li>
            </ul>
            <p className="text-gray-600 mb-4">
                Bent u als zakelijke klant op zoek naar inspiratie of wilt u materialen in het echt zien? Bezoek dan onze showroom in Eindhoven. Daar vindt u diverse voorbeelden van aluminium veranda’s en overkappingen voor zakelijke toepassingen.
            </p>
            <p className="text-gray-600 mb-8">
                U kunt in alle rust rondkijken, uitvoeringen vergelijken en uw plannen met onze adviseur bespreken. De koffie staat klaar, en parkeren kan direct voor de deur. Wij nemen graag de tijd om samen te kijken welke oplossing het beste past bij uw bedrijf.
            </p>
            <Link to="/showroom" className="inline-block bg-hett-brown text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-hett-brownLight transition-colors uppercase tracking-wide text-sm">
                Plan uw showroombezoek
            </Link>
            </div>

            {/* Image */}
            <div className="relative h-full min-h-[500px] rounded-[32px] overflow-hidden shadow-lg group">
                <img 
                    src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
                    alt="Zakelijke oplossingen HETT" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-[#fcfbf7] py-24 mb-24">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                  <h2 className="text-4xl font-black text-hett-dark mb-2">Veelgestelde vragen</h2>
                  <p className="text-hett-brown font-medium text-lg">Zoek een antwoord op uw vraag</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {HOME_FAQS.map((faq, index) => (
                      <div key={index} className="bg-white rounded-[16px] shadow-sm overflow-hidden border border-transparent hover:border-gray-100 transition-all">
                          <button 
                              onClick={() => toggleFaq(index)}
                              className="w-full flex justify-between items-center p-5 text-left font-bold text-hett-dark hover:bg-gray-50 transition-colors text-sm md:text-base"
                          >
                              <span>{faq.question}</span>
                              {openFaqIndex === index ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                          </button>
                          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${openFaqIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                              <div className="overflow-hidden">
                                  <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed">
                                      {faq.answer}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Brochure Request Section (Replaces Service Banner) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-[#f9f9f9] rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-sm">
            {/* Left Image */}
            <div className="md:w-1/2 relative min-h-[400px] md:min-h-0">
                <img 
                    src="https://images.unsplash.com/photo-1544207240-8b1025eb7aeb?q=80&w=1000&auto=format&fit=crop" 
                    alt="HETT Brochure" 
                    className="absolute inset-0 w-full h-full object-cover" 
                />
            </div>
            
            {/* Right Form */}
            <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-[#f9f9f9]">
                <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-6">Brochure aanvragen</h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    Inspiratie opdoen? Vraag onze gratis brochure aan boordevol informatie, prijzen en nog veel meer.
                </p>
                
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Naam*</label>
                        <input type="text" className="w-full px-4 py-3 rounded border border-gray-300 focus:border-hett-brown outline-none transition-colors bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">E-mailadres*</label>
                        <input type="email" className="w-full px-4 py-3 rounded border border-gray-300 focus:border-hett-brown outline-none transition-colors bg-white" />
                    </div>
                    
                    <button type="submit" className="w-full bg-hett-brown text-white font-bold py-4 rounded hover:bg-hett-brownLight transition-colors mt-4 text-base">
                        Vraag brochure aan
                    </button>
                    
                    <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                        Gebruik dit formulier nooit om gevoelige gegevens door te sturen (zoals creditcardnummers, ID-codes of wachtwoorden).
                    </p>
                </form>
            </div>
        </div>
      </div>

      {/* Blog Section - Updated Style to Image Cards */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-black text-hett-dark mb-4">Laatste Nieuws & Tips</h2>
                <p className="text-gray-600 text-lg">Blijf op de hoogte van de laatste trends en montagetips.</p>
            </div>
            <Link to="/blogs" className="hidden md:flex items-center gap-2 text-hett-brown font-bold hover:underline">
                Bekijk alle artikelen <ArrowRight size={20} />
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {NEWS_ITEMS.slice(0, 3).map((item, idx) => (
                <Link 
                    key={idx} 
                    to={`/nieuws/${item.id}`}
                    className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-[400px] relative"
                >
                    {/* Background Image */}
                    <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Top Label */}
                    <div className="absolute top-6 left-0 bg-[#d10a10] text-white text-xs font-bold px-3 py-1.5 shadow-sm uppercase tracking-wide">
                        {item.category}
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-12 p-6">
                        <div className="flex items-center gap-4 text-xs text-white/80 mb-2">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-2">
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-xs font-medium mt-2">
                            <HelpCircle size={14} />
                            <span>Lees artikel</span>
                        </div>
                    </div>

                    {/* Arrow Button */}
                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-black flex items-center justify-center text-white transition-colors hover:bg-gray-800">
                        <ChevronRight size={24} />
                    </div>
                </Link>
            ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-hett-brown font-bold hover:underline">
                Bekijk alle artikelen <ArrowRight size={20} />
            </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;
