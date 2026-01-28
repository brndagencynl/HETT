/**
 * MontagePartnerSection Component
 * ================================
 * 
 * CTA section for montage by HETT Veranda (eigen team).
 * Clean, professional design with fixed price and clear call-to-action.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, CheckCircle2, Calendar, Sparkles } from 'lucide-react';

const MontagePartnerSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16">
      {/* Main Card */}
      <div className="bg-white rounded-2xl border-2 border-[#003878]/20 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Content Side */}
          <div className="lg:col-span-7 p-6 md:p-8 lg:p-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#003878]/10 text-[#003878] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Wrench size={14} />
              EIGEN MONTAGETEAM
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-hett-dark mb-4">
              Montage door HETT Veranda
            </h2>
            
            <p className="text-gray-600 leading-relaxed mb-6 text-base">
              Wij verzorgen de montage van uw veranda volledig in eigen beheer. Van planning tot 
              oplevering: u heeft één aanspreekpunt en weet vooraf precies waar u aan toe bent.
            </p>

            {/* Price Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#003878] to-[#002050] text-white px-5 py-3 rounded-xl mb-6 shadow-lg">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-lg font-bold">Vaste montageprijs: € 1.200,-</span>
            </div>

            {/* USPs */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Montage door ons eigen team</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Inplannen in overleg (na bestelling)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-sm font-medium text-hett-dark">Netjes geplaatst en opgeleverd</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#003878] hover:bg-[#002050] text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#003878]/20"
              >
                <Calendar size={18} />
                Montage aanvragen
              </Link>
              <a
                href="https://wa.me/31622367130?text=Hallo%2C%20ik%20heb%20interesse%20in%20montage%20van%20mijn%20veranda."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-[#25D366] hover:text-[#25D366] text-hett-dark font-bold px-6 py-3.5 rounded-xl transition-colors"
              >
                <Phone size={18} />
                WhatsApp ons
              </a>
            </div>
          </div>

          {/* Visual Side */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#003878]/5 to-[#003878]/10 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#003878] flex items-center justify-center">
                  <Wrench size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-hett-dark text-lg">HETT Veranda</h3>
                  <p className="text-sm text-gray-500">Eigen montagedienst</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Ons ervaren team plaatst uw veranda vakkundig en efficiënt. U hoeft zich nergens 
                  zorgen over te maken.
                </p>
                <p>
                  Na uw bestelling nemen wij contact op om een geschikte montagedatum in te plannen.
                </p>
              </div>

              {/* Price Highlight Mobile */}
              <div className="mt-4 pt-4 border-t border-gray-100 lg:hidden">
                <div className="text-center">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Vaste prijs</span>
                  <p className="text-2xl font-black text-[#003878]">€ 1.200,-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info note */}
      <p className="mt-4 text-xs text-gray-500 text-center md:text-left max-w-3xl">
        Montage is beschikbaar in heel Nederland. De vaste prijs geldt voor standaard plaatsing. 
        Bij bijzondere omstandigheden (moeilijke bereikbaarheid, speciale ondergrond) nemen wij vooraf contact op.
      </p>
    </section>
  );
};

export default MontagePartnerSection;
