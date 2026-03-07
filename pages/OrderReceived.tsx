
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const OrderReceived: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={t('orderReceived.title')}
        subtitle={t('orderReceived.subtitle')}
        description={t('orderReceived.description')}
        image="https://picsum.photos/1200/600?random=order"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Success Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden text-center p-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                <CheckCircle size={40} strokeWidth={3} />
            </div>
            
            <h2 className="text-3xl font-black text-hett-dark mb-4">{t('orderReceived.heading')}</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                {t('orderReceived.message', { orderNumber: '#12345', email: 'jan@example.com' })}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                <div className="bg-gray-50 p-6 rounded-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('orderReceived.orderNumber')}</span>
                    <span className="font-bold text-lg text-hett-dark">#12345</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('orderReceived.date')}</span>
                    <span className="font-bold text-lg text-hett-dark">26 Mei 2024</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('common.total')}</span>
                    <span className="font-bold text-lg text-hett-dark">€ 2.244,00</span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row gap-4 justify-center">
                <Link to="/my-account" className="ds-btn ds-btn--secondary ds-btn--lg">
                    <Package size={20} /> {t('orderReceived.viewOrder')}
                </Link>
                <Link to="/" className="ds-btn ds-btn--primary ds-btn--lg">
                    {t('common.continueShopping')} <ArrowRight size={20} />
                </Link>
            </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
            {t('orderReceived.questions')} <a href="tel:+31685406033" className="text-hett-dark font-bold hover:underline">+31 (0)6 85 40 60 33</a> of <a href="mailto:info@hett.nl" className="text-hett-dark font-bold hover:underline">info@hett.nl</a>
        </p>

      </div>
    </div>
  );
};

export default OrderReceived;
