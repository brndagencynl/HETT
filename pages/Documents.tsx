
import React from 'react';
import { FileText, Download, FileCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const Documents: React.FC = () => {
  return (
    <div className="min-h-screen bg-hett-light">
      {/* Header */}
      <PageHeader 
        title="Downloads & Documentatie"
        subtitle="Service"
        description="Technische specificaties, montagehandleidingen en certificeringen voor al onze producten direct te downloaden."
        image="https://picsum.photos/1200/800?random=5"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Category: Datasheets */}
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <FileText className="text-hett-brown" size={28} />
                <h2 className="text-xl font-bold text-hett-dark">Datasheets</h2>
            </div>
            <ul className="space-y-4">
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">HETT Dakpaneel Eco+</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">HETT Wand Prof-Rib</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">Lichtstraat Systemen</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
            </ul>
          </div>

          {/* Category: Montage */}
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <FileCheck className="text-hett-brown" size={28} />
                <h2 className="text-xl font-bold text-hett-dark">Montage</h2>
            </div>
            <ul className="space-y-4">
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">Montagehandleiding Dak</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">Montagehandleiding Wand</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">Afwerkprofielen Detailtekeningen</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
            </ul>
          </div>

          {/* Category: Certificaten */}
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <FileText className="text-hett-brown" size={28} />
                <h2 className="text-xl font-bold text-hett-dark">Certificeringen</h2>
            </div>
            <ul className="space-y-4">
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">Brandklasse Certificaat B-s2,d0</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">ISO 9001 Certificaat</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
                <li className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 text-sm group-hover:text-hett-brown">Garantievoorwaarden 2024</span>
                    <Download size={16} className="text-gray-400 group-hover:text-hett-brown" />
                </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Documents;
