
import React from 'react';
import PageHeader from '../components/PageHeader';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Algemene Voorwaarden"
        subtitle="Juridisch"
        description="Onze leverings- en betalingsvoorwaarden voor zakelijke relaties."
        image="https://picsum.photos/1200/800?random=88"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-16 rounded-[32px] shadow-sm border border-gray-100 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-hett-dark prose-a:text-hett-brown">
          
          <h3>Artikel 1. Definities</h3>
          <p>
            1.1. In deze algemene voorwaarden wordt verstaan onder:<br/>
            <strong>HETT:</strong> HETT B.V., gevestigd te Eindhoven, gebruiker van deze algemene voorwaarden.<br/>
            <strong>Wederpartij:</strong> iedere (rechts)persoon die met HETT een overeenkomst heeft gesloten of wenst te sluiten.<br/>
            <strong>Overeenkomst:</strong> iedere overeenkomst die tussen HETT en de Wederpartij tot stand komt, elke wijziging of aanvulling daarop, alsmede alle (rechts)handelingen ter voorbereiding en ter uitvoering van die overeenkomst.
          </p>

          <h3>Artikel 2. Toepasselijkheid</h3>
          <p>
            2.1. Deze voorwaarden zijn van toepassing op alle aanbiedingen, offertes en overeenkomsten tussen HETT en een Wederpartij.<br/>
            2.2. Afwijkingen van deze voorwaarden zijn slechts bindend indien en voor zover zij schriftelijk zijn bevestigd door HETT.<br/>
            2.3. Eventuele inkoop- of andere voorwaarden van de Wederpartij zijn niet van toepassing, tenzij deze door HETT uitdrukkelijk en schriftelijk zijn aanvaard.
          </p>

          <h3>Artikel 3. Offertes en Aanbiedingen</h3>
          <p>
            3.1. Alle offertes en aanbiedingen van HETT zijn vrijblijvend, tenzij in de offerte een termijn voor aanvaarding is gesteld.<br/>
            3.2. HETT kan niet aan zijn offertes of aanbiedingen worden gehouden indien de Wederpartij redelijkerwijs kan begrijpen dat de offertes of aanbiedingen, dan wel een onderdeel daarvan, een kennelijke vergissing of verschrijving bevatten.<br/>
            3.3. De in een offerte of aanbieding vermelde prijzen zijn exclusief BTW en andere heffingen van overheidswege, eventuele in het kader van de overeenkomst te maken kosten, daaronder begrepen reis- en verblijf-, verzend- en administratiekosten, tenzij anders aangegeven.
          </p>

          <h3>Artikel 4. Levering en Uitvoering</h3>
          <p>
            4.1. Is voor de uitvoering van bepaalde werkzaamheden of voor de levering van bepaalde zaken een termijn overeengekomen of opgegeven, dan is dit nimmer een fatale termijn. Bij overschrijding van een termijn dient de Wederpartij HETT derhalve schriftelijk in gebreke te stellen.<br/>
            4.2. HETT heeft het recht bepaalde werkzaamheden te laten verrichten door derden. De toepasselijkheid van artikel 7:404, 7:407 lid 2 en 7:409 BW wordt uitdrukkelijk uitgesloten.<br/>
            4.3. Levering geschiedt 'aan de stoeprand' of op een goed bereikbare plaats op de bouwlocatie, ter beoordeling van de chauffeur.
          </p>

          <h3>Artikel 5. Betaling en Incassokosten</h3>
          <p>
            5.1. Betaling dient steeds te geschieden binnen 14 dagen na factuurdatum, op een door HETT aan te geven wijze in de valuta waarin is gefactureerd, tenzij schriftelijk anders door HETT is aangegeven.<br/>
            5.2. Indien de Wederpartij in gebreke blijft in de tijdige betaling van een factuur, dan is de Wederpartij van rechtswege in verzuim. De Wederpartij is alsdan een rente verschuldigd van 1% per maand, tenzij de wettelijke handelsrente hoger is, in welk geval de wettelijke handelsrente verschuldigd is.<br/>
            5.3. Indien de Wederpartij in gebreke of in verzuim is in de (tijdige) nakoming van zijn verplichtingen, dan komen alle redelijke kosten ter verkrijging van voldoening buiten rechte voor rekening van de Wederpartij.
          </p>

          <h3>Artikel 6. Eigendomsvoorbehoud</h3>
          <p>
            6.1. Alle door HETT in het kader van de overeenkomst geleverde zaken blijven eigendom van HETT totdat de Wederpartij alle verplichtingen uit de met HETT gesloten overeenkomst(en) deugdelijk is nagekomen.<br/>
            6.2. Door HETT geleverde zaken, die ingevolge lid 1. onder het eigendomsvoorbehoud vallen, mogen niet worden doorverkocht en mogen nimmer als betaalmiddel worden gebruikt.
          </p>

          <h3>Artikel 7. Garantie en Reclame</h3>
          <p>
            7.1. De door HETT te leveren zaken voldoen aan de gebruikelijke eisen en normen die daaraan op het moment van levering redelijkerwijs gesteld kunnen worden en waarvoor zij bij normaal gebruik in Nederland zijn bestemd.<br/>
            7.2. De Wederpartij is gehouden het geleverde te (doen) onderzoeken, onmiddellijk op het moment dat de zaken hem ter beschikking worden gesteld. Daarbij behoort de Wederpartij te onderzoeken of kwaliteit en/of kwantiteit van het geleverde overeenstemt met hetgeen is overeengekomen.<br/>
            7.3. Eventuele zichtbare gebreken dienen binnen 48 uur na levering schriftelijk aan HETT te worden gemeld.
          </p>

          <h3>Artikel 8. Aansprakelijkheid</h3>
          <p>
            8.1. Indien HETT aansprakelijk mocht zijn, dan is deze aansprakelijkheid beperkt tot hetgeen in deze bepaling is geregeld.<br/>
            8.2. HETT is niet aansprakelijk voor schade, van welke aard ook, ontstaan doordat HETT is uitgegaan van door of namens de Wederpartij verstrekte onjuiste en/of onvolledige gegevens.<br/>
            8.3. De aansprakelijkheid van HETT is in ieder geval steeds beperkt tot het bedrag der uitkering van zijn verzekeraar in voorkomend geval.
          </p>

          <h3>Artikel 9. Toepasselijk recht en geschillen</h3>
          <p>
            9.1. Op alle rechtsbetrekkingen waarbij HETT partij is, is uitsluitend het Nederlands recht van toepassing, ook indien aan een verbintenis geheel of gedeeltelijk in het buitenland uitvoering wordt gegeven of indien de bij de rechtsbetrekking betrokken partij aldaar woonplaats heeft.<br/>
            9.2. De rechter in de vestigingsplaats van HETT is bij uitsluiting bevoegd van geschillen kennis te nemen, tenzij de wet dwingend anders voorschrijft.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500">
            <p>Versie: 1.2 - Laatst gewijzigd op 10 april 2024</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
