
import React from 'react';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, PackageX, PackageCheck, AlertTriangle, Undo2, Ban, Mail, Camera, Clock, CheckCircle, XCircle } from 'lucide-react';

const Returns: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader 
        title={t('returns.title')}
        subtitle={t('returns.subtitle')}
        description={t('returns.description')}
        image="https://picsum.photos/1200/600?random=return"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">

        {/* 1. Algemeen */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-2xl font-black text-hett-dark">1. Algemeen</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-3">
            Dit retourbeleid is van toepassing op alle aankopen bij HETT Veranda en vormt een aanvulling op onze <Link to="/algemene-voorwaarden" className="text-hett-brown font-semibold hover:underline">algemene voorwaarden</Link>.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Wij leveren voornamelijk maatwerkproducten. Hierdoor gelden afwijkende retourvoorwaarden ten opzichte van standaard webwinkelproducten.
          </p>
        </div>

        {/* 2. Maatwerkproducten */}
        <div className="bg-red-50 p-8 md:p-12 rounded-[32px] shadow-sm border border-red-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <PackageX size={28} />
            </div>
            <h2 className="text-2xl font-black text-hett-dark">2. Maatwerkproducten</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Onze veranda's, glazen schuifwanden, glasdaken en maatwerkconstructies worden speciaal geproduceerd volgens de specificaties van de klant.
          </p>
          <div className="bg-white p-5 rounded-2xl border border-red-200 mb-4">
            <p className="font-bold text-red-700 mb-1">⚠️ Geen herroepingsrecht</p>
            <p className="text-sm text-red-600">
              Conform artikel 6:230p BW geldt voor maatwerkproducten geen wettelijk herroepingsrecht.
            </p>
          </div>
          <p className="text-gray-700 font-semibold mb-2">Dit betekent:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              Bestellingen kunnen niet worden geretourneerd nadat productie is gestart.
            </li>
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              Annulering is niet mogelijk bij maatwerk.
            </li>
            <li className="flex items-start gap-3 text-gray-700 text-sm">
              <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              Reeds geproduceerde maatwerkproducten kunnen niet worden teruggenomen.
            </li>
          </ul>
        </div>

        {/* 3. Standaardproducten */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <PackageCheck size={28} />
            </div>
            <h2 className="text-2xl font-black text-hett-dark">3. Standaardproducten</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Voor standaardproducten (bijvoorbeeld losse accessoires die niet op maat zijn gemaakt) geldt:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-gray-600 text-sm">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              De klant heeft het recht om binnen <strong>14 dagen</strong> na ontvangst de aankoop te herroepen.
            </li>
            <li className="flex items-start gap-3 text-gray-600 text-sm">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              Het product dient ongebruikt, onbeschadigd en in originele verpakking te worden geretourneerd.
            </li>
            <li className="flex items-start gap-3 text-gray-600 text-sm">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              De kosten voor retourzending zijn voor rekening van de klant.
            </li>
            <li className="flex items-start gap-3 text-gray-600 text-sm">
              <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              Retouren worden uitsluitend geaccepteerd na voorafgaande schriftelijke melding via e-mail.
            </li>
          </ul>
        </div>

        {/* 4. Voorwaarden & 7. Uitsluitingen — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 4. Voorwaarden */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={22} />
              </div>
              <h3 className="text-lg font-black text-hett-dark">4. Voorwaarden voor retour</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Een retour wordt alleen geaccepteerd indien:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Het product ongebruikt is.
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Het product niet gemonteerd is geweest.
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                Het product compleet en onbeschadigd is.
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                De originele verpakking aanwezig is.
              </li>
            </ul>
            <p className="text-sm text-gray-500 mt-4 italic">Beschadigde of gebruikte producten worden niet teruggenomen.</p>
          </div>

          {/* 7. Uitsluitingen */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <Ban size={22} />
              </div>
              <h3 className="text-lg font-black text-hett-dark">7. Uitsluitingen van retour</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Retour is uitgesloten voor:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                Maatwerkproducten
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                Speciaal bestelde onderdelen
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                Geopende of gebruikte producten
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                Producten die gemonteerd zijn geweest
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                Producten beschadigd door onjuist gebruik
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Schade bij levering */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-2xl font-black text-hett-dark">5. Schade bij levering</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Wij verzoeken klanten om de levering direct bij ontvangst te controleren.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 text-center">
              <Clock size={24} className="text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800 mb-1">Binnen 48 uur</p>
              <p className="text-xs text-gray-500">Zichtbare transportschade schriftelijk melden.</p>
            </div>
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 text-center">
              <Camera size={24} className="text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800 mb-1">Foto's maken</p>
              <p className="text-xs text-gray-500">Duidelijke foto's van de schade en verpakking.</p>
            </div>
            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 text-center">
              <AlertTriangle size={24} className="text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800 mb-1">Termijn</p>
              <p className="text-xs text-gray-500">Latere meldingen kunnen mogelijk niet worden behandeld.</p>
            </div>
          </div>
        </div>

        {/* 6. Terugbetaling */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Undo2 size={28} />
            </div>
            <h2 className="text-2xl font-black text-hett-dark">6. Terugbetaling</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-2">Indien een retour wordt goedgekeurd:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3 text-gray-600 text-sm">
              <CheckCircle size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              Terugbetaling vindt plaats binnen <strong>14 dagen</strong> na ontvangst en controle van het product.
            </li>
            <li className="flex items-start gap-3 text-gray-600 text-sm">
              <CheckCircle size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              Eventuele waardevermindering door gebruik kan in mindering worden gebracht.
            </li>
          </ul>
        </div>

        {/* 8. Contact voor retouraanvraag */}
        <div className="bg-hett-primary p-8 md:p-12 rounded-[32px] shadow-sm text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Mail size={28} />
            </div>
            <h2 className="text-2xl font-black">8. Contact voor retouraanvraag</h2>
          </div>
          <p className="text-white/80 leading-relaxed mb-4">
            Retouraanvragen kunnen worden ingediend via:
          </p>
          <a href="mailto:info@hettveranda.nl" className="inline-flex items-center gap-2 bg-white text-hett-primary font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors mb-6">
            <Mail size={18} />
            info@hettveranda.nl
          </a>
          <p className="text-white/80 text-sm mb-3">Onder vermelding van:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p className="text-sm font-semibold">Ordernummer</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p className="text-sm font-semibold">Naam</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p className="text-sm font-semibold">Reden van retour</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center">
              <p className="text-sm font-semibold">Foto's</p>
            </div>
          </div>
        </div>

        {/* Belangrijk */}
        <div className="bg-yellow-50 border border-yellow-200 p-8 md:p-10 rounded-[32px]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-200 text-yellow-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-yellow-800 mb-2">Belangrijk</h4>
              <p className="text-sm text-yellow-700 leading-relaxed">
                HETT Veranda produceert voornamelijk maatwerk veranda's. Wij adviseren klanten daarom goed te controleren of de gekozen afmetingen, opties en specificaties correct zijn voordat de bestelling definitief wordt geplaatst.
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-gray-400 pt-4">
          <p>HETT Veranda – Retourbeleid</p>
        </div>

      </div>
    </div>
  );
};

export default Returns;
