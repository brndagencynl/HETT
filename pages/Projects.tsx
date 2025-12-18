
import React, { useState } from 'react';
import { PROJECTS } from '../constants';
import { ArrowRight, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<string>('Alle');
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract unique categories for filters
  // We prioritize the order shown in the design: Alle, Tuinkamer, Veranda, Zakelijk, Carport
  const categories = ['Alle', 'Tuinkamer', 'Veranda', 'Zakelijk', 'Carport'];

  const filteredProjects = filter === 'Alle' 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  const openProject = (project: typeof PROJECTS[0]) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeProject = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProject?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images!.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProject?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedProject.images!.length) % selectedProject.images!.length);
  };

  return (
    <div className="bg-[#f6f8fa] min-h-screen font-sans">
      
      <PageHeader 
        title="Projecten" 
        subtitle="Portfolio"
        description="Bekijk een selectie van onze gerealiseerde projecten. Van luxe tuinkamers tot grootschalige bedrijfshallen."
        image="https://picsum.photos/1200/800?random=15"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Filters */}
        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                filter === cat 
                  ? 'bg-hett-dark text-white border-hett-dark' 
                  : 'bg-white text-hett-dark border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <motion.div
              layoutId={`card-${project.id}`}
              key={project.id}
              onClick={() => openProject(project)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 flex flex-col h-full"
            >
              {/* Image Container */}
              <div className="relative h-[280px] overflow-hidden bg-gray-100">
                 <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 {/* Tag */}
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-bold text-hett-dark shadow-sm">
                    {project.category}
                 </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                 <h3 className="text-2xl font-bold text-hett-dark mb-2 leading-tight">{project.title}</h3>
                 
                 {project.location && (
                    <div className="flex items-center text-gray-400 text-xs font-medium mb-4">
                        <MapPin size={14} className="mr-1.5" />
                        {project.location}
                    </div>
                 )}

                 <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                 </p>

                 <div className="mt-auto flex items-center text-sm font-bold text-hett-dark group-hover:underline decoration-2 underline-offset-4">
                    Meer info <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal / Gallery */}
      <AnimatePresence>
        {selectedProject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={closeProject}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    layoutId={`card-${selectedProject.id}`}
                    className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col lg:flex-row"
                >
                    <button 
                        onClick={closeProject} 
                        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-black/10 rounded-full transition-colors"
                    >
                        <X size={24} className="text-hett-dark" />
                    </button>

                    {/* Left: Image Gallery */}
                    <div className="lg:w-3/5 bg-gray-100 relative h-[40vh] lg:h-auto">
                        {/* Main Image */}
                        <img 
                            src={selectedProject.images ? selectedProject.images[currentImageIndex] : selectedProject.imageUrl} 
                            alt={selectedProject.title}
                            className="w-full h-full object-cover"
                        />
                        
                        {/* Navigation Controls */}
                        {selectedProject.images && selectedProject.images.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                
                                {/* Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {selectedProject.images.map((_, idx) => (
                                        <div 
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Content */}
                    <div className="lg:w-2/5 p-8 lg:p-10 overflow-y-auto bg-white flex flex-col">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">
                                {selectedProject.category}
                            </span>
                            <h2 className="text-3xl font-black text-hett-dark mb-2 leading-tight">
                                {selectedProject.title}
                            </h2>
                             {selectedProject.location && (
                                <div className="flex items-center text-gray-500 text-sm font-medium">
                                    <MapPin size={16} className="mr-2" />
                                    {selectedProject.location}
                                </div>
                             )}
                        </div>

                        <div className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed mb-8 flex-grow">
                            <p>{selectedProject.description}</p>
                            <p>
                                Dit project is een perfect voorbeeld van hoe onze sandwichpanelen 
                                esthetiek en functionaliteit combineren. Gerealiseerd met oog voor detail 
                                en afwerking.
                            </p>
                            <h4 className="font-bold text-hett-dark mt-4 mb-2">Gebruikte materialen:</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>HETT Dakpaneel Eco+ (Antraciet)</li>
                                <li>Aluminium profielsysteem</li>
                                <li>Geïntegreerde LED-verlichting</li>
                            </ul>
                        </div>

                        <div className="pt-6 border-t border-gray-100 mt-auto">
                            <button className="w-full bg-hett-dark text-white font-bold py-4 rounded-lg hover:bg-hett-brown transition-colors">
                                Vraag offerte aan voor dit type
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
