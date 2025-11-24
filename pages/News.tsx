
import React from 'react';
import { Link } from 'react-router-dom';
import { NEWS_ITEMS } from '../constants';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const News: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      
      {/* Header */}
      <PageHeader 
        title="Laatste Nieuws"
        subtitle="Blog & Updates"
        description="Blijf op de hoogte van productinnovaties, projecten en ontwikkelingen in de markt van veranda's en buitenverblijven."
        image="https://picsum.photos/1200/800?random=7"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NEWS_ITEMS.map((item) => (
            <Link 
              to={`/nieuws/${item.id}`} 
              key={item.id}
              className="group flex flex-col bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-hett-dark shadow-sm">
                  {item.category}
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {item.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {item.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-hett-dark mb-3 leading-tight group-hover:text-hett-brown transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {item.excerpt}
                </p>

                <div className="flex items-center text-hett-dark font-bold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  Lees artikel <ArrowRight size={16} className="ml-2 text-hett-brown" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
