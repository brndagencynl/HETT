
import React from 'react';
import { Users, Globe, Award } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero / Header */}
      <PageHeader 
        title="De standaard in Verandabouw"
        subtitle="Over HETT"
        description="Wij leveren niet zomaar panelen; wij leveren de basis voor hoogwaardige buitenruimtes. Ontdek ons verhaal en onze missie."
        image="https://picsum.photos/1920/800?random=55"
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
                <span className="text-hett-brown font-bold uppercase tracking-widest text-sm mb-2 block">Ons Verhaal</span>
                <h2 className="text-3xl font-bold text-hett-dark mb-6">Gedreven door kwaliteit en esthetiek</h2>
                <div className="prose prose-lg text-gray-600">
                    <p>
                        HETT is ontstaan vanuit een duidelijke behoefte in de markt: verandabouwers en montagebedrijven zochten naar sandwichpanelen die niet alleen thermisch goed presteren, maar er ook esthetisch perfect uitzien voor residentiële toepassingen.
                    </p>
                    <p>
                        Waar traditionele industriebouwpanelen vaak grof zijn, focust HETT zich op verfijning. Strakkere profielen, betere coatings en kleuren die aansluiten bij de huidige woontrends.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <img src="https://picsum.photos/400/500?random=60" className="rounded-sm w-full h-full object-cover" alt="Productie" />
                <img src="https://picsum.photos/400/500?random=61" className="rounded-sm w-full h-full object-cover mt-8" alt="Montage" />
            </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 text-hett-brown rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={32} />
                </div>
                <h3 className="text-xl font-bold text-hett-dark mb-3">Partner voor de Prof</h3>
                <p className="text-gray-600">Wij werken niet met particulieren, maar exclusief met professionals die verstand van zaken hebben.</p>
            </div>
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 text-hett-brown rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe size={32} />
                </div>
                <h3 className="text-xl font-bold text-hett-dark mb-3">Benelux Dekking</h3>
                <p className="text-gray-600">Vanuit ons centrale magazijn leveren wij dagelijks door heel Nederland en België.</p>
            </div>
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 text-hett-brown rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award size={32} />
                </div>
                <h3 className="text-xl font-bold text-hett-dark mb-3">Gecertificeerde Kwaliteit</h3>
                <p className="text-gray-600">Al onze panelen voldoen aan de strengste Europese normen op het gebied van brandveiligheid en isolatie.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;
