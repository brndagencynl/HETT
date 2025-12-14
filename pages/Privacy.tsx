
import React from 'react';
import PageHeader from '../components/PageHeader';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Privacybeleid"
        subtitle="Juridisch"
        description="Wij hechten veel waarde aan de bescherming van uw persoonsgegevens. Hier leest u hoe wij daarmee omgaan."
        image="https://picsum.photos/1200/800?random=89"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-16 rounded-[32px] shadow-sm border border-gray-100 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-hett-dark prose-a:text-hett-brown">
          
          <p>
            HETT B.V., gevestigd aan Industrieweg 45, 5600 AA Eindhoven, is verantwoordelijk voor de verwerking van persoonsgegevens zoals weergegeven in deze privacyverklaring.
          </p>

          <h3>Persoonsgegevens die wij verwerken</h3>
          <p>
            HETT verwerkt uw persoonsgegevens doordat u gebruik maakt van onze diensten en/of omdat u deze zelf aan ons verstrekt. Hieronder vindt u een overzicht van de persoonsgegevens die wij verwerken:
          </p>
          <ul>
            <li>Voor- en achternaam</li>
            <li>Bedrijfsnaam</li>
            <li>Adresgegevens</li>
            <li>Telefoonnummer</li>
            <li>E-mailadres</li>
            <li>IP-adres</li>
            <li>Overige persoonsgegevens die u actief verstrekt bijvoorbeeld door een profiel op deze website aan te maken, in correspondentie en telefonisch</li>
          </ul>

          <h3>Met welk doel en op basis van welke grondslag wij persoonsgegevens verwerken</h3>
          <p>
            HETT verwerkt uw persoonsgegevens voor de volgende doelen:
          </p>
          <ul>
            <li>Het afhandelen van uw betaling</li>
            <li>Verzenden van onze nieuwsbrief en/of reclamefolder</li>
            <li>U te kunnen bellen of e-mailen indien dit nodig is om onze dienstverlening uit te kunnen voeren</li>
            <li>U te informeren over wijzigingen van onze diensten en producten</li>
            <li>Om goederen en diensten bij u af te leveren</li>
            <li>HETT verwerkt ook persoonsgegevens als wij hier wettelijk toe verplicht zijn, zoals gegevens die wij nodig hebben voor onze belastingaangifte.</li>
          </ul>

          <h3>Hoe lang we persoonsgegevens bewaren</h3>
          <p>
            HETT bewaart uw persoonsgegevens niet langer dan strikt nodig is om de doelen te realiseren waarvoor uw gegevens worden verzameld. Wij hanteren de wettelijke bewaartermijnen voor administratieve gegevens.
          </p>

          <h3>Delen van persoonsgegevens met derden</h3>
          <p>
            HETT verkoopt uw gegevens niet aan derden en verstrekt deze uitsluitend indien dit nodig is voor de uitvoering van onze overeenkomst met u of om te voldoen aan een wettelijke verplichting. Met bedrijven die uw gegevens verwerken in onze opdracht, sluiten wij een bewerkersovereenkomst om te zorgen voor eenzelfde niveau van beveiliging en vertrouwelijkheid van uw gegevens. HETT blijft verantwoordelijk voor deze verwerkingen.
          </p>

          <h3>Cookies, of vergelijkbare technieken, die wij gebruiken</h3>
          <p>
            HETT gebruikt functionele, analytische en tracking cookies. Een cookie is een klein tekstbestand dat bij het eerste bezoek aan deze website wordt opgeslagen in de browser van uw computer, tablet of smartphone. Zie ons <a href="/cookies">Cookiebeleid</a> voor meer informatie.
          </p>

          <h3>Gegevens inzien, aanpassen of verwijderen</h3>
          <p>
            U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen. Daarnaast heeft u het recht om uw eventuele toestemming voor de gegevensverwerking in te trekken of bezwaar te maken tegen de verwerking van uw persoonsgegevens door HETT en heeft u het recht op gegevensoverdraagbaarheid. Dat betekent dat u bij ons een verzoek kunt indienen om de persoonsgegevens die wij van u beschikken in een computerbestand naar u of een ander, door u genoemde organisatie, te sturen.
          </p>
          <p>
            U kunt een verzoek tot inzage, correctie, verwijdering, gegevensoverdraging van uw persoonsgegevens of verzoek tot intrekking van uw toestemming of bezwaar op de verwerking van uw persoonsgegevens sturen naar <a href="mailto:privacy@hett.nl">privacy@hett.nl</a>.
          </p>

          <h3>Hoe wij persoonsgegevens beveiligen</h3>
          <p>
            HETT neemt de bescherming van uw gegevens serieus en neemt passende maatregelen om misbruik, verlies, onbevoegde toegang, ongewenste openbaarmaking en ongeoorloofde wijziging tegen te gaan. Als u de indruk heeft dat uw gegevens niet goed beveiligd zijn of er aanwijzingen zijn van misbruik, neem dan contact op met onze klantenservice of via <a href="mailto:privacy@hett.nl">privacy@hett.nl</a>.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
