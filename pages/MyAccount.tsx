
import React from 'react';
import PageHeader from '../components/PageHeader';
import { User, ExternalLink, ShieldCheck } from 'lucide-react';
import { getShopifyLoginUrl, getShopifyAccountUrl, getShopifyRegisterUrl } from '../src/services/shopify';

const MyAccount: React.FC = () => {
  const loginUrl = getShopifyLoginUrl();
  const accountUrl = getShopifyAccountUrl();
  const registerUrl = getShopifyRegisterUrl();

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Mijn Account" 
        subtitle="Account" 
        description="Beheer uw bestellingen en accountgegevens." 
        image="https://picsum.photos/1200/400?random=account"
      />
      
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 text-center">
          
          <div className="w-20 h-20 bg-hett-dark/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-hett-dark" />
          </div>
          
          <h2 className="text-2xl font-black text-hett-dark mb-4">
            Welkom bij Hett
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
            Bekijk uw bestellingen, beheer uw adressen en pas uw accountgegevens aan via uw persoonlijke account.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a 
              href={loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-hett-dark text-white font-bold py-4 px-8 rounded-2xl hover:bg-hett-brown transition-colors"
            >
              Inloggen
              <ExternalLink size={18} />
            </a>
            
            <a 
              href={accountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-hett-dark text-hett-dark font-bold py-4 px-8 rounded-2xl hover:bg-hett-dark hover:text-white transition-colors"
            >
              Account openen
              <ExternalLink size={18} />
            </a>
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">
              Nog geen account?
            </p>
            <a 
              href={registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hett-brown font-bold hover:underline inline-flex items-center gap-1"
            >
              Account aanmaken
              <ExternalLink size={14} />
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheck size={16} className="text-green-600" />
            <span>Je account wordt veilig beheerd via Shopify.</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
