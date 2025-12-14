
import React from 'react';
import PageHeader from '../components/PageHeader';

const Cookies: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Cookiebeleid"
        subtitle="Juridisch"
        description="Informatie over het gebruik van cookies op onze website en hoe u deze kunt beheren."
        image="https://picsum.photos/1200/800?random=90"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-16 rounded-[32px] shadow-sm border border-gray-100 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-hett-dark prose-a:text-hett-brown">
          
          <h3>Wat zijn cookies?</h3>
          <p>
            Cookies zijn kleine tekstbestanden die door een website op uw apparaat (computer, tablet of mobiele telefoon) worden geplaatst wanneer u de website bezoekt. Deze bestanden slaan informatie op over uw websitebezoek, zoals uw voorkeursinstellingen, en zorgen ervoor dat bepaalde functies goed werken.
          </p>

          <h3>Welke cookies gebruiken wij?</h3>
          <p>Wij maken gebruik van de volgende soorten cookies:</p>
          
          <h4>1. Functionele cookies (Noodzakelijk)</h4>
          <p>
            Deze cookies zijn noodzakelijk voor het correct functioneren van de website. Zonder deze cookies kunnen bepaalde onderdelen (zoals de configurator of het contactformulier) niet goed werken. Ze onthouden bijvoorbeeld uw keuzes tijdens het configureren van een product.
          </p>

          <h4>2. Analytische cookies</h4>
          <p>
            Met analytische cookies verzamelen wij statistieken over het gebruik van onze website. Wij gebruiken hiervoor Google Analytics. De gegevens worden geanonimiseerd (het laatste octet van uw IP-adres wordt gemaskeerd) en wij hebben 'gegevens delen' met Google uitgezet. Wij gebruiken deze data om de website te optimaliseren en gebruiksvriendelijker te maken.
          </p>

          <h4>3. Marketing cookies</h4>
          <p>
            Marketing cookies worden gebruikt om bezoekers te volgen over verschillende websites heen. Het doel is om advertenties weer te geven die relevant en aantrekkelijk zijn voor de individuele gebruiker. Wij gebruiken deze cookies alleen indien u hier expliciet toestemming voor heeft gegeven.
          </p>

          <h3>Cookies beheren of verwijderen</h3>
          <p>
            U kunt zich afmelden voor cookies door uw internetbrowser zo in te stellen dat deze geen cookies meer opslaat. Daarnaast kunt u ook alle informatie die eerder is opgeslagen via de instellingen van uw browser verwijderen.
          </p>
          <p>
            Let op: als u cookies uitschakelt of verwijdert, kan het zijn dat bepaalde delen van onze website niet meer optimaal functioneren.
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647?hl=nl" target="_blank" rel="noopener noreferrer">Instellingen voor Google Chrome</a></li>
            <li><a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Instellingen voor Safari</a></li>
            <li><a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen" target="_blank" rel="noopener noreferrer">Instellingen voor Firefox</a></li>
            <li><a href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Instellingen voor Microsoft Edge</a></li>
          </ul>

          <h3>Wijzigingen in dit cookiebeleid</h3>
          <p>
            Wij kunnen dit cookiebeleid van tijd tot tijd wijzigen, bijvoorbeeld wanneer onze website verandert of de regels rondom cookies wijzigen. Wij raden u aan om deze pagina regelmatig te raadplegen voor de laatste versie.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Cookies;
