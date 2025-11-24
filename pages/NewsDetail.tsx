import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { NEWS_ITEMS } from '../constants';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const article = NEWS_ITEMS.find(n => n.id === id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-hett-dark mb-4">Artikel niet gevonden</h2>
          <Link to="/nieuws" className="text-hett-brown font-bold underline">Terug naar overzicht</Link>
        </div>
      </div>
    );
  }

  // Filter out current article for "Read More" section
  const relatedNews = NEWS_ITEMS.filter(n => n.id !== id).slice(0, 2);

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
      
      {/* Scroll Progress (Optional Visual Flair) */}
      <div className="fixed top-0 left-0 h-1 bg-hett-brown z-50 w-full origin-left scale-x-0 animate-scroll"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8 pt-8">
          <Link to="/nieuws" className="inline-flex items-center text-gray-500 hover:text-hett-dark font-medium transition-colors mb-6">
            <ArrowLeft size={18} className="mr-2" /> Terug naar overzicht
          </Link>
          <span className="block text-hett-brown font-bold uppercase tracking-widest text-xs mb-3">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-hett-dark leading-tight mb-6">
            {article.title}
          </h1>
          
          {/* Meta Data */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-hett-dark">
                <User size={16} />
              </div>
              <span className="font-medium text-gray-900">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-[32px] overflow-hidden shadow-sm mb-12">
          <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover" />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-1 hidden lg:block">
              {/* Sticky Share Buttons */}
              <div className="sticky top-32 flex flex-col gap-4">
                 <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"><Facebook size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-sky-50 hover:text-sky-500 flex items-center justify-center transition-colors"><Twitter size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center transition-colors"><Linkedin size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition-colors"><Share2 size={18} /></button>
              </div>
           </div>

           <div className="lg:col-span-11">
              <div 
                className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-hett-dark prose-a:text-hett-brown hover:prose-a:text-hett-dark prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              
              {/* Author Box */}
              <div className="bg-[#f6f8fa] rounded-2xl p-8 mt-16 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-hett-brown shadow-sm text-xl font-bold">
                      {article.author.charAt(0)}
                  </div>
                  <div>
                      <h4 className="font-bold text-hett-dark text-lg">Over de auteur</h4>
                      <p className="text-gray-600 text-sm">
                          {article.author} is onderdeel van het HETT communicatieteam en schrijft over productinnovaties en marktontwikkelingen.
                      </p>
                  </div>
              </div>
           </div>
        </div>

      </div>

      {/* Related News */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-12 border-t border-gray-100">
        <h3 className="text-2xl font-bold text-hett-dark mb-8">Meer lezen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {relatedNews.map(item => (
               <Link key={item.id} to={`/nieuws/${item.id}`} className="flex gap-6 group bg-white p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                   <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                       <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   </div>
                   <div className="flex flex-col justify-center">
                       <span className="text-xs font-bold text-gray-400 mb-1 uppercase">{item.category}</span>
                       <h4 className="font-bold text-hett-dark text-lg leading-tight group-hover:text-hett-brown transition-colors mb-2">{item.title}</h4>
                       <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={14}/> {item.date}</span>
                   </div>
               </Link>
           ))}
        </div>
      </div>

    </div>
  );
};

export default NewsDetail;