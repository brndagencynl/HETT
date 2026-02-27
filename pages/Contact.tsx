
import React from 'react';
import { Mail, Phone, MessageCircle, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Hoppenkuil+17,+5626+DD+Eindhoven';
  const whatsappUrl = 'https://wa.me/31622367130';

  const openMaps = () => {
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const openWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      {/* Page Header - Simple */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <h1 className="text-4xl md:text-5xl font-black text-hett-dark mb-4">{t('contact.title')}</h1>
        <p className="text-gray-600 text-lg max-w-3xl leading-relaxed">
          {t('contact.description')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Contact Methods Grid + Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left: 4 Contact Method Cards (2x2 grid) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* E-mail Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-hett-dark/10 text-hett-dark flex items-center justify-center rounded-lg mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-bold text-hett-dark mb-2">{t('contact.email')}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {t('contact.emailDesc')}
              </p>
              <a 
                href="mailto:info@hettveranda.nl" 
                className="text-hett-primary font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('contact.emailCta')} <ArrowRight size={16} />
              </a>
            </div>

            {/* Telefoon Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-hett-dark/10 text-hett-dark flex items-center justify-center rounded-lg mb-4">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-bold text-hett-dark mb-2">{t('contact.phone')}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {t('contact.phoneDesc')}
              </p>
              <a 
                href="tel:+31401234567" 
                className="text-hett-primary font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('contact.phoneCta')} <ArrowRight size={16} />
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] flex items-center justify-center rounded-lg mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-hett-dark mb-2">{t('contact.whatsapp')}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {t('contact.whatsappDesc')}
              </p>
              <button 
                onClick={openWhatsApp}
                className="text-hett-primary font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t('contact.whatsappCta')} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: Company Info */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm h-full">
              <h3 className="text-2xl font-black text-hett-dark mb-6">{t('contact.companyDetails')}</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-bold text-hett-dark mb-1">{t('contact.address')}</p>
                  <p className="text-gray-600">HETT Veranda's</p>
                  <p className="text-gray-600">Hoppenkuil 17</p>
                  <p className="text-gray-600">5626 DD Eindhoven</p>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Two CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Terugbelverzoek - Dark */}
          <div className="bg-hett-dark p-8 md:p-10 rounded-2xl text-white">
            <h3 className="text-2xl md:text-3xl font-black mb-4">{t('contact.callback')}</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              {t('contact.callbackDesc')}
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all"
            >
              {t('contact.callbackCta')}
            </Link>
          </div>

          {/* Showroom bezoeken - Light */}
          <div className="bg-gray-100 p-8 md:p-10 rounded-2xl border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-black text-hett-dark mb-4">{t('contact.showroom')}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('contact.showroomDesc')}
            </p>
            <Link 
              to="/showroom" 
              className="inline-flex items-center gap-2 bg-hett-dark/10 border border-hett-dark/20 text-hett-dark font-bold px-6 py-3 rounded-full hover:bg-hett-dark/20 transition-all"
            >
              {t('contact.showroomCta')}
            </Link>
          </div>
        </div>



        {/* Embedded Google Maps - Full Width */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <iframe
            title={t('contact.mapAlt')}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.5!2d5.4789!3d51.4399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c6d91234567890%3A0x1234567890abcdef!2sHoppenkuil%2017%2C%205626%20DD%20Eindhoven!5e0!3m2!1snl!2snl!4v1704556800000!5m2!1snl!2snl"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
