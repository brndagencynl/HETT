
import React from 'react';
import { FileText, Download, FileCheck, ShieldCheck, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

const Documents: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      {/* Header */}
      <PageHeader 
        title="Downloads & Documentatie"
        subtitle="Service"
        description="Technische specificaties, montagehandleidingen en certificeringen voor al onze producten direct te downloaden."
        image="https://picsum.photos/1200/800?random=5"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Category: Datasheets */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                    <FileText size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-hett-dark">Datasheets</h2>
                    <p className="text-sm text-gray-500">Technische specificaties</p>
                </div>
            </div>
            <ul className="space-y-3 flex-grow">
                <DocumentRow title="HETT Dakpaneel Eco+" size="2.4 MB" />
                <DocumentRow title="HETT Wand Prof-Rib" size="1.8 MB" />
                <DocumentRow title="Lichtstraat Systemen" size="3.1 MB" />
                <DocumentRow title="Zetwerk Profielen" size="1.2 MB" />
            </ul>
          </div>

          {/* Category: Montage */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100">
                    <FileCheck size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-hett-dark">Montage</h2>
                    <p className="text-sm text-gray-500">Stap-voor-stap handleidingen</p>
                </div>
            </div>
            <ul className="space-y-3 flex-grow">
                <DocumentRow title="Montagehandleiding Dak" size="5.1 MB" />
                <DocumentRow title="Montagehandleiding Wand" size="4.2 MB" />
                <DocumentRow title="Afwerkprofielen Detailtekeningen" size="8.5 MB" />
                <DocumentRow title="Onderhoudsinstructies" size="0.5 MB" />
            </ul>
          </div>

          {/* Category: Certificaten */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center border border-green-100">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-hett-dark">Certificeringen</h2>
                    <p className="text-sm text-gray-500">Kwaliteit & Garantie</p>
                </div>
            </div>
            <ul className="space-y-3 flex-grow">
                <DocumentRow title="Brandklasse Certificaat B-s2,d0" size="1.1 MB" />
                <DocumentRow title="ISO 9001 Certificaat" size="0.8 MB" />
                <DocumentRow title="Garantievoorwaarden 2024" size="0.4 MB" />
                <DocumentRow title="Prestatieverklaring (DoP)" size="1.5 MB" />
            </ul>
          </div>

        </div>

        {/* Extra CTA Section */}
        <div className="mt-12 bg-hett-dark rounded-[32px] p-10 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl overflow-hidden relative">
             {/* Abstract bg element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

             <div className="relative z-10">
                 <h3 className="text-2xl font-bold text-white mb-2">Mist u een document?</h3>
                 <p className="text-gray-400 max-w-lg">Neem contact op met onze technische dienst voor specifieke vragen, CAD-tekeningen of berekeningen.</p>
             </div>
             <Link to="/contact" className="relative z-10 bg-white text-hett-dark px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md">
                 Contact opnemen
             </Link>
        </div>
      </div>
    </div>
  );
};

const DocumentRow = ({ title, size }: { title: string, size: string }) => (
    <li>
        <button className="w-full flex items-center justify-between group p-4 rounded-2xl bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all text-left">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-hett-brown shadow-sm border border-gray-100 transition-colors">
                    <Download size={18} strokeWidth={2} />
                </div>
                <div>
                    <span className="block text-sm font-bold text-gray-800 group-hover:text-hett-brown transition-colors">{title}</span>
                    <span className="block text-xs text-gray-400 font-medium">{size} • PDF</span>
                </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-hett-brown opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </button>
    </li>
);

export default Documents;
