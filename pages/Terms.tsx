
import React from 'react';
import PageHeader from '../components/PageHeader';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title="Algemene Voorwaarden"
        subtitle="Juridisch"
        description="De algemene voorwaarden van HETT Veranda voor al onze producten en diensten."
        image="https://picsum.photos/1200/800?random=88"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 md:p-16 rounded-[32px] shadow-sm border border-gray-100">

          <p className="text-center font-bold text-lg text-hett-dark mb-12">HETT Veranda</p>

          {/* Artikel 1 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 1 – Identiteit van de ondernemer</h3>
            <p className="text-gray-600 leading-relaxed">
              HETT Veranda<br/>
              Vestigingsadres: Hoppenkuil 17<br/>
              KvK-nummer: [KvK invullen]<br/>
              BTW-nummer: [BTW invullen]<br/>
              E-mailadres: <a href="mailto:info@hettveranda.nl" className="text-hett-brown hover:underline">info@hettveranda.nl</a><br/>
              Telefoonnummer:
            </p>
          </div>

          {/* Artikel 2 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 2 – Definities</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              In deze algemene voorwaarden wordt verstaan onder:
            </p>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">Ondernemer:</strong> HETT Veranda.</p>
              <p><strong className="text-gray-800">Klant:</strong> de natuurlijke persoon of rechtspersoon die een overeenkomst aangaat met HETT Veranda.</p>
              <p><strong className="text-gray-800">Overeenkomst:</strong> iedere koop- of montageovereenkomst tussen ondernemer en klant.</p>
              <p><strong className="text-gray-800">Producten:</strong> veranda's, glazen schuifwanden, sandwichpanelen, glasdaken en aanverwante artikelen.</p>
              <p><strong className="text-gray-800">Maatwerkproducten:</strong> producten die speciaal volgens specificaties van de klant worden vervaardigd.</p>
              <p><strong className="text-gray-800">Montagepartner:</strong> externe, erkende partij die in opdracht van ondernemer montagewerkzaamheden uitvoert.</p>
            </div>
          </div>

          {/* Artikel 3 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 3 – Toepasselijkheid</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Deze algemene voorwaarden zijn van toepassing op alle offertes, aanbiedingen, overeenkomsten en leveringen van HETT Veranda.</p>
              <p>Afwijkingen zijn slechts geldig indien schriftelijk bevestigd.</p>
              <p>Eventuele algemene voorwaarden van de klant worden uitdrukkelijk van de hand gewezen.</p>
            </div>
          </div>

          {/* Artikel 4 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 4 – Offertes en aanbiedingen</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Alle offertes en aanbiedingen zijn vrijblijvend tenzij anders vermeld.</p>
              <p>Offertes hebben een geldigheidsduur van 14 dagen tenzij anders aangegeven.</p>
              <p>Kennelijke fouten of vergissingen in offertes of op de website binden de ondernemer niet.</p>
              <p>Afbeeldingen, renders en visualisaties op de website zijn indicatief en kunnen afwijken van het werkelijke product.</p>
            </div>
          </div>

          {/* Artikel 5 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 5 – Totstandkoming van de overeenkomst</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>De overeenkomst komt tot stand zodra de bestelling schriftelijk of digitaal is bevestigd.</p>
              <p>Na bestelling neemt HETT Veranda contact op met de klant om levering en/of montage af te stemmen.</p>
              <p>De ondernemer behoudt zich het recht voor een bestelling te weigeren of aanvullende informatie te verlangen.</p>
            </div>
          </div>

          {/* Artikel 6 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 6 – Prijzen</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Alle prijzen zijn inclusief btw, tenzij anders vermeld.</p>
              <p>Montageprijzen zijn maatwerk en afhankelijk van locatie, bereikbaarheid en situatie ter plaatse.</p>
              <p>Indien montage gewenst is, ontvangt de klant een persoonlijke prijsopgave.</p>
              <p>Eventuele prijsverhogingen door externe factoren (grondstoffen, transport, overmacht) vóór definitieve bevestiging mogen worden doorberekend.</p>
            </div>
          </div>

          {/* Artikel 7 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 7 – Betaling</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Betaling dient te geschieden volgens de overeengekomen betaalvoorwaarden.</p>
              <p>Bij niet-tijdige betaling is de klant van rechtswege in verzuim.</p>
              <p>Eventuele incassokosten en wettelijke rente komen voor rekening van de klant.</p>
              <p>De ondernemer mag levering opschorten bij openstaande betalingen.</p>
            </div>
          </div>

          {/* Artikel 8 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 8 – Levering</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Levertermijnen zijn indicatief en geen fatale termijnen.</p>
              <p>Levering vindt plaats op het door de klant opgegeven adres.</p>
              <p>De klant dient zorg te dragen voor een goed bereikbare locatie.</p>
              <p>Extra kosten door slechte bereikbaarheid of wachttijden zijn voor rekening van de klant.</p>
              <p>Het risico van beschadiging gaat over op het moment van levering.</p>
            </div>
          </div>

          {/* Artikel 9 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 9 – Montage</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>HETT Veranda beschikt niet over een interne montageservice.</p>
              <p>Montage wordt uitgevoerd door erkende externe montagepartners.</p>
              <p>De montagepartner werkt zelfstandig en is verantwoordelijk voor correcte uitvoering.</p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4 mb-2">De klant dient te zorgen voor:</p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 ml-2">
              <li>Een stabiele en geschikte ondergrond</li>
              <li>Voldoende werkruimte</li>
              <li>Vrije toegang tot de montageplaats</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">Eventuele extra werkzaamheden buiten de standaard montage worden apart gefactureerd.</p>
          </div>

          {/* Artikel 10 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 10 – Maatwerk en herroepingsrecht</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Veranda's worden geproduceerd op maat volgens de wensen van de klant.</p>
              <p>Conform artikel 6:230p BW is het herroepingsrecht uitgesloten voor maatwerkproducten.</p>
              <p>Annulering is niet mogelijk nadat productie is gestart.</p>
              <p>Eventuele wijzigingen na opdracht kunnen meerkosten met zich meebrengen.</p>
            </div>
          </div>

          {/* Artikel 11 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 11 – Klachten en gebreken</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>De klant dient producten direct bij levering te controleren.</p>
              <p>Zichtbare gebreken dienen binnen 48 uur schriftelijk gemeld te worden.</p>
              <p>Verborgen gebreken dienen binnen redelijke termijn na ontdekking gemeld te worden.</p>
              <p>Onjuiste montage door derden zonder toestemming doet garantie vervallen.</p>
            </div>
          </div>

          {/* Artikel 12 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 12 – Garantie</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Op de aluminium constructie geldt een garantie van 10 jaar (tenzij anders vermeld).</p>
              <p>Glas, polycarbonaat, LED-verlichting en bewegende delen vallen onder fabrieksgarantie.</p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4 mb-2">Garantie vervalt bij:</p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 ml-2">
              <li>Onjuiste montage</li>
              <li>Onjuist gebruik</li>
              <li>Eigen aanpassingen</li>
              <li>Schade door extreme weersomstandigheden</li>
            </ul>
          </div>

          {/* Artikel 13 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 13 – Aansprakelijkheid</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>De ondernemer is niet aansprakelijk voor indirecte schade of gevolgschade.</p>
              <p>Aansprakelijkheid is beperkt tot het factuurbedrag van het betreffende product.</p>
              <p>De ondernemer is niet aansprakelijk voor het ontbreken van benodigde vergunningen.</p>
              <p>De klant is zelf verantwoordelijk voor het controleren van lokale bouwvoorschriften.</p>
            </div>
          </div>

          {/* Artikel 14 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 14 – Overmacht</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>In geval van overmacht kan levering worden uitgesteld.</p>
              <p>Onder overmacht wordt verstaan: stakingen, materiaaltekorten, transportproblemen, weersomstandigheden, pandemieën of andere onvoorziene omstandigheden.</p>
              <p>In geval van overmacht is geen schadevergoeding verschuldigd.</p>
            </div>
          </div>

          {/* Artikel 15 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 15 – Eigendomsvoorbehoud</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Alle geleverde producten blijven eigendom van HETT Veranda totdat volledige betaling heeft plaatsgevonden.</p>
              <p>De klant mag de producten niet doorverkopen voordat volledige betaling is voldaan.</p>
            </div>
          </div>

          {/* Artikel 16 */}
          <div className="mb-10">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 16 – Privacy</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Persoonsgegevens worden uitsluitend gebruikt voor orderverwerking en communicatie.</p>
              <p>Gegevens worden niet verstrekt aan derden, behalve indien noodzakelijk voor uitvoering van de overeenkomst.</p>
            </div>
          </div>

          {/* Artikel 17 */}
          <div className="mb-6">
            <h3 className="text-xl font-black text-hett-dark mb-4 pb-2 border-b border-gray-100">Artikel 17 – Toepasselijk recht en geschillen</h3>
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p>Op alle overeenkomsten is Nederlands recht van toepassing.</p>
              <p>Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
            <p>HETT Veranda – Algemene Voorwaarden</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;
