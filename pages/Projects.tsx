
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../constants';
import { ArrowRight, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<string>('Alle');
  const categories = ['Alle', ...Array.from(new Set(PROJECTS.map(p => p.category)))];

  const filteredProjects = filter === 'Alle' 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Header */}
      <PageHeader 
        title="Projecten & Inspiratie"
        subtitle="Portfolio"
        description="Bekijk hoe onze sandwichpanelen worden toegepast in veranda's, tuinkamers en zakelijke projecten door de hele Benelux."
        image="https://picsum.photos/1200/800?random=3"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Filter */}
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === cat 
                  ? 'bg-hett-dark text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link 
              to={`/projecten/${project.id}`} 
              key={project.id}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white border border-white px-6 py-2 rounded-sm font-medium">
                    Bekijk Project
                  </span>
                </div>
                <div className="absolute top-4 left-4 bg-white/90 text-hett-dark px-3 py-1 text-xs font-bold rounded shadow-sm">
                  {project.category}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-hett-dark mb-2 group-hover:text-hett-accent transition-colors">
                  {project.title}
                </h3>
                {project.location && (
                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <MapPin size={12} className="mr-1" /> {project.location}
                  </div>
                )}
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {project.description}
                </p>
                <div className="flex items-center text-hett-dark text-sm font-semibold">
                  Meer info <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
