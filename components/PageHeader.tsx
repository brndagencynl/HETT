
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  action?: {
    label: string;
    link: string;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, image, action }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Compact Header */}
      <div className="md:hidden mt-[140px] bg-white border-b border-gray-100 px-4 py-3">
         <div className="flex items-center gap-3 text-hett-primary">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-hett-dark transition-colors flex-shrink-0"
            >
               <ArrowLeft size={20} strokeWidth={1.5} />
               <span className="font-medium text-base">Terug</span>
            </button>
            <div className="w-px h-5 bg-gray-200 flex-shrink-0"></div>
            <h1 className="font-bold text-base text-hett-dark truncate leading-tight pt-0.5">{title}</h1>
         </div>
      </div>

      {/* Desktop Hero Header */}
      <div className="hidden md:flex relative w-full h-[450px] items-center mt-[185px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-white/70 text-xs md:text-sm font-bold mb-4 md:mb-6">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-white/40">→</span>
              <span className="text-white">{title}</span>
          </div>

          <div className="max-w-4xl">
              {subtitle && (
                  <span className="inline-block text-white font-bold uppercase tracking-widest text-xs md:text-sm mb-2 md:mb-4 bg-hett-brown px-3 py-1 rounded-md shadow-sm">
                      {subtitle}
                  </span>
              )}
              <h1 className="text-3xl md:text-6xl font-black text-white leading-tight mb-4 md:mb-6 drop-shadow-sm">
                  {title}
              </h1>
              
              {description && (
                  <p className="text-base md:text-xl text-gray-200 font-medium leading-relaxed max-w-2xl drop-shadow-sm line-clamp-3 md:line-clamp-none">
                      {description}
                  </p>
              )}

              {action && (
                  <div className="mt-6 md:mt-8">
                      <Link 
                          to={action.link}
                          className="inline-flex items-center bg-white text-hett-dark px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:bg-hett-brown hover:text-white transition-all shadow-lg text-sm md:text-base"
                      >
                          {action.label}
                      </Link>
                  </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PageHeader;