
import React from 'react';
import PageHeader from '../components/PageHeader';

const DeliveryTerms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Leveringsvoorwaarden"
        subtitle="Juridisch"
        description="Aanvullende voorwaarden met betrekking tot het transport en de levering van onze goederen."
        image="https://picsum.photos/1200/600?random=terms"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-16 rounded-[32px] shadow-sm border border-gray-100 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-hett-dark">
            
            <h3>1. Leverplaats</h3>
            <p>
                De levering van de materialen vindt plaats op het door de klant opgegeven adres. De chauffeur levert de goederen af op een plaats die voor de vrachtwagen (tot 18 meter lang) goed en veilig bereikbaar is. Dit is ter beoordeling van de chauffeur. Indien de losplaats niet bereikbaar is, worden de goederen zo dichtbij mogelijk gelost.
            </p>

            <h3>2. Lossen van goederen</h3>
            <p>
                Het lossen geschiedt naast de vrachtwagen ('aan de stoeprand'). De chauffeur is niet verplicht de materialen naar de tuin, garage of achter het huis te verplaatsen. De klant dient er rekening mee te houden dat de pakketten zwaar en groot kunnen zijn.
            </p>

            <h3>3. Aanwezigheid</h3>
            <p>
                De klant of een gemachtigde dient aanwezig te zijn tijdens de levering om de goederen in ontvangst te nemen en voor ontvangst te tekenen. Indien er niemand aanwezig is, kunnen de goederen niet worden afgeleverd en worden er extra transportkosten in rekening gebracht voor een tweede levering.
            </p>

            <h3>4. Transportrisico</h3>
            <p>
                Het risico van verlies of beschadiging van de producten gaat over op de klant op het moment dat deze aan de klant juridisch en/of feitelijk worden geleverd en daarmee in de macht van de klant of van een door de klant aan te wijzen derden worden gebracht.
            </p>

            <h3>5. Transportschade & Mankementen</h3>
            <p>
                De klant dient de goederen bij ontvangst direct te controleren op zichtbare gebreken, beschadigingen en compleetheid.
                <ul>
                    <li>Zichtbare schade aan de verpakking of producten moet <strong>direct</strong> op de vrachtbrief/pakbon worden aangetekend.</li>
                    <li>Indien er geen melding wordt gemaakt op de vrachtbrief, wordt de levering geacht in goede staat te zijn ontvangen.</li>
                    <li>Verborgen gebreken dienen binnen 48 uur na levering schriftelijk (met foto's) gemeld te worden aan HETT.</li>
                </ul>
            </p>

            <h3>6. Vertraging</h3>
            <p>
                Opgegeven levertijden zijn indicatief en gelden nimmer als fatale termijn, tenzij uitdrukkelijk schriftelijk anders is overeengekomen. HETT is niet aansprakelijk voor gevolgschade (zoals kosten voor ingehuurde monteurs of vrije dagen) als gevolg van een vertraagde levering. Wij adviseren om monteurs pas in te plannen nadat de goederen daadwerkelijk zijn ontvangen en gecontroleerd.
            </p>

        </div>
      </div>
    </div>
  );
};

export default DeliveryTerms;
