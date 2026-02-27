
import React from 'react';
import PageHeader from '../components/PageHeader';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={t('payment.title')}
        subtitle="Service"
        description={t('payment.description')}
        image="https://picsum.photos/1200/600?random=payment"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
            
            <p className="text-gray-600 text-lg mb-12 max-w-2xl">
                {t('payment.intro')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <PaymentCard 
                    title="iDEAL" 
                    desc={t('payment.idealDesc')}
                    badge={t('common.free')}
                />
                <PaymentCard 
                    title="Bancontact" 
                    desc={t('payment.bancontactDesc')}
                    badge={t('common.free')}
                />
                <PaymentCard 
                    title="Creditcard" 
                    desc={t('payment.creditCardDesc')}
                    badge={t('common.free')}
                />
                <PaymentCard 
                    title={t('payment.klarna')} 
                    desc={t('payment.klarnaDesc')}
                    badge="+ € 2,95"
                />
                <PaymentCard 
                    title={t('payment.bankTransfer')} 
                    desc={t('payment.bankTransferDesc')}
                    badge={t('common.free')}
                />
                <PaymentCard 
                    title={t('payment.onAccount')} 
                    desc={t('payment.onAccountDesc')}
                    badge={t('payment.onRequest')}
                />

            </div>

            <div className="mt-12 p-8 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm flex-shrink-0">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-green-800 text-lg mb-1">{t('payment.securePayment')}</h3>
                    <p className="text-green-700/80">
                        {t('payment.securePaymentDesc')}
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const PaymentCard = ({ title, desc, badge }: { title: string, desc: string, badge: string }) => (
    <div className="p-6 border border-gray-200 rounded-2xl hover:border-hett-brown transition-colors group">
        <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-hett-dark text-lg group-hover:text-hett-brown">{title}</h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{badge}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

export default PaymentMethods;
