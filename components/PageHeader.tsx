
import React from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  action?: {
    label: string;
    link: string;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, image, action }) => {
  return (
    <div className="bg-[#f6f8fa] pt-[180px] md:pt-[140px] pb-8 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[340px]">
          
          {/* Left Card: Content */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 flex flex-col justify-center items-start shadow-sm h-full">
             {subtitle && (
                <span className="text-hett-brown font-bold uppercase tracking-widest text-xs mb-3 block">
                    {subtitle}
                </span>
             )}
             <h1 className="text-2xl md:text-4xl font-black text-hett-dark mb-4 tracking-tight leading-tight">
                {title}
             </h1>
             
             <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                {description}
             </p>

             {action && (
                <Link 
                    to={action.link}
                    className="inline-flex items-center bg-hett-dark text-white px-6 py-3 rounded-[16px] font-bold hover:bg-hett-brown transition-colors shadow-sm text-sm"
                >
                    {action.label}
                </Link>
             )}
          </div>

          {/* Right Card: Image */}
          <div className="rounded-[32px] overflow-hidden h-[220px] lg:h-full relative shadow-sm">
             <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PageHeader;
