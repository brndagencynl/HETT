/**
 * MontagePartnerSection Component
 * ================================
 * 
 * CTA section for montage quotes via partner OutdoorVeranda.nl.
 * Clean, professional design with clear call-to-action.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Phone, Users, ShieldCheck } from 'lucide-react';

const MontagePartnerSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16">
      {/* Main Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Content Side */}
          <div className="lg:col-span-7 p-6 md:p-8 lg:p-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FF7300]/10 text-[#FF7300] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Users size={14} />
              PARTNERBEDRIJF
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-hett-dark mb-4">
              Montage laten uitvoeren door een partner?
            </h2>
            
            <p className="text-gray-600 leading-relaxed mb-6 text-base">
              Wilt u de veranda door een ervaren montageteam laten plaatsen? Ons partnerbedrijf{' '}
              <strong className="text-hett-dark">OutdoorVeranda.nl</strong> verzorgt montage op locatie en 
              maakt een offerte op maat op basis van uw situatie (ondergrond, bereikbaarheid, afmetingen 
              en extra opties).
            </p>

            {/* USPs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Ervaren monteurs</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Offerte op maat</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Landelijke dekking</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Volledige ontzorging</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://outdoorveranda.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#FF7300] hover:bg-[#e56800] text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#FF7300]/20"
              >
                Offerte aanvragen
                <ExternalLink size={18} />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-hett-dark text-hett-dark font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                <Phone size={18} />
                Neem contact op
              </Link>
            </div>
          </div>

          {/* Visual Side */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#003878]/5 to-[#003878]/10 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#003878] flex items-center justify-center">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-hett-dark text-lg">OutdoorVeranda.nl</h3>
                  <p className="text-sm text-gray-500">Officiële montagepartner</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  OutdoorVeranda.nl is gespecialiseerd in de montage van aluminium veranda's en 
                  overkappingen door heel Nederland.
                </p>
                <p>
                  Na uw aanvraag ontvangt u binnen 2 werkdagen een vrijblijvende offerte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-500 text-center md:text-left max-w-3xl">
        Montage wordt uitgevoerd door OutdoorVeranda.nl op basis van een aparte overeenkomst. 
        U ontvangt altijd vooraf een heldere prijsopgave.
      </p>
    </section>
  );
};

export default MontagePartnerSection;
