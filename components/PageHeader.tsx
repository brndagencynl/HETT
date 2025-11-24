
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
    <div className="bg-sky-50 pt-[210px] md:pt-[150px] pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[450px]">
          
          {/* Left Card: Content */}
          <div className="bg-white rounded-[32px] p-8 md:p-12 flex flex-col justify-center items-start shadow-sm h-full">
             {subtitle && (
                <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-4 block">
                    {subtitle}
                </span>
             )}
             <h1 className="text-3xl md:text-5xl font-black text-hett-dark mb-6 tracking-tight leading-tight">
                {title}
             </h1>
             
             <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
                {description}
             </p>

             {action && (
                <Link 
                    to={action.link}
                    className="inline-flex items-center bg-hett-dark text-white px-8 py-3.5 rounded-[16px] font-bold hover:bg-hett-brown transition-colors shadow-sm"
                >
                    {action.label}
                </Link>
             )}
          </div>

          {/* Right Card: Image */}
          <div className="rounded-[32px] overflow-hidden h-[300px] lg:h-full relative shadow-sm">
             <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PageHeader;
