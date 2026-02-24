/**
 * Offerte Page
 * =============
 * 
 * Displays configuration summary and a contact form
 * for requesting a montage quote.
 * Supports both maatwerk and standard package offers.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Send, FileText, Ruler, Wrench, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getOfferDraft, clearOfferDraft } from '../src/services/offers/offerStorage';
import type { OfferRequestDraft, OfferContactInfo, OfferSubmitPayload, OfferSelectionLine } from '../src/types/offer';
import { formatEUR } from '../src/utils/money';

const Offerte: React.FC = () => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OfferRequestDraft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [postcode, setPostcode] = useState('');
  const [plaats, setPlaats] = useState('');
  const [opmerking, setOpmerking] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const d = getOfferDraft();
    setDraft(d);
    setLoaded(true);
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!naam.trim()) newErrors.naam = 'Naam is verplicht';
    if (!email.trim()) newErrors.email = 'E-mail is verplicht';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Ongeldig e-mailadres';
    if (!telefoon.trim()) newErrors.telefoon = 'Telefoonnummer is verplicht';
    if (!postcode.trim()) newErrors.postcode = 'Postcode is verplicht';
    if (!plaats.trim()) newErrors.plaats = 'Plaats is verplicht';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !draft) return;

    setIsSubmitting(true);
    setSubmitError('');

    // Build an absolute preview URL (safest for PDF rendering on the server)
    const previewUrlAbsolute = draft.previewImageUrl?.startsWith('http')
      ? draft.previewImageUrl
      : draft.previewImageUrl
        ? `${window.location.origin}${draft.previewImageUrl}`
        : undefined;

    try {
      const res = await fetch('/api/offerte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer: {
            reference: draft.reference,
            productTitle: draft.product.title,
            productHandle: draft.product.handle,
            previewImageUrl: previewUrlAbsolute,
            contact: {
              name: naam.trim(),
              email: email.trim(),
              phone: telefoon.trim(),
              postcode: postcode.trim(),
              city: plaats.trim(),
            },
            options: draft.selections.map((s) => ({
              label: s.label,
              value: s.valueLabel,
              price: s.priceMode === 'quote' ? undefined : s.price,
            })),
            totals: {
              base: draft.pricing.base,
              options: draft.pricing.optionsTotal,
              shipping: 0,
              total: draft.pricing.total,
            },
            notes: opmerking.trim() || undefined,
          },
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || `Server fout (${res.status})`);
      }

      console.log('[Offer] submitted successfully, ref:', data?.reference);
      setIsSubmitting(false);
      setSubmitted(true);
      clearOfferDraft();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Onbekende fout bij verzenden.';
      console.error('[Offer] submit error:', err);
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  // Loading
  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  // Empty state — no draft
  if (!draft) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader
          title="Offerte aanvragen"
          subtitle="Veranda"
          description="Configureer eerst uw veranda om een offerte aan te vragen."
          image="https://picsum.photos/1200/600?random=offerte"
        />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-hett-dark mb-2">Geen configuratie gevonden</h2>
            <p className="text-gray-500 text-sm mb-6">
              U heeft nog geen veranda geconfigureerd. Start een configurator om uw veranda samen te stellen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/categorie/verandas"
                className="inline-flex items-center gap-2 bg-[#003878] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#002050] transition-colors"
              >
                <ArrowLeft size={18} />
                Standaard veranda's
              </Link>
              <Link
                to="/maatwerk-configurator"
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl hover:border-gray-300 transition-colors"
              >
                Maatwerk configurator
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  // Derived labels based on draft kind
  const isMaatwerk = draft.kind === 'maatwerk_offer';
  const subtitleLabel = isMaatwerk ? 'Maatwerk' : 'Standaard Pakket';
  const backUrl = isMaatwerk ? '/maatwerk-configurator' : '/categorie/verandas';
  const backLabel = isMaatwerk ? 'Terug naar configurator' : 'Terug naar veranda\'s';

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] font-sans">
        <PageHeader
          title="Offerte aangevraagd"
          subtitle={subtitleLabel}
          description="Uw offerte aanvraag is succesvol verstuurd."
          image="https://picsum.photos/1200/600?random=offerte"
        />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-hett-dark mb-3">Bedankt!</h2>
            <p className="text-gray-600 mb-2">
              Uw offerte aanvraag is succesvol ontvangen.
            </p>
            <p className="text-gray-500 text-sm mb-2">
              Referentie: <span className="font-mono font-bold text-gray-700">{draft.reference}</span>
            </p>
            <p className="text-gray-500 text-sm mb-8">
              We nemen binnen <strong>1 werkdag</strong> contact met u op.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-[#003878] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#002050] transition-colors"
              >
                Terug naar home
              </Link>
              <Link
                to={backUrl}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl hover:border-gray-300 transition-colors"
              >
                Nieuwe configuratie
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main offerte form
  const f = (n: number) => formatEUR(n);

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans">
      <PageHeader
        title="Offerte aanvragen"
        subtitle={subtitleLabel}
        description="Controleer uw configuratie en laat uw gegevens achter voor een persoonlijke offerte."
        image="https://picsum.photos/1200/600?random=offerte"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT — Preview + Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            {/* Preview image — stacked layers matching configurator */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 relative flex items-center justify-center">
                {draft.previewLayers && draft.previewLayers.length > 0 ? (
                  draft.previewLayers.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={i === 0 ? 'Veranda basis' : `Overlay ${i}`}
                      className="absolute inset-0 w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))
                ) : (
                  <img
                    src={draft.previewImageUrl}
                    alt="Veranda preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/renders/veranda/fallback.webp';
                    }}
                  />
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{draft.product.title}</h3>
                  <p className="text-xs text-gray-500">Ref: {draft.reference}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Ruler size={14} />
                  {draft.size.widthCm} × {draft.size.depthCm} cm
                </div>
              </div>
            </div>

            {/* Pricing card */}
            <div className="bg-[#eff6ff] rounded-[24px] p-6 space-y-3">
              <h4 className="font-bold text-gray-900 text-lg">Prijsoverzicht</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basisprijs</span>
                  <span className="font-semibold text-gray-900">{f(draft.pricing.base)}</span>
                </div>
                {draft.selections.filter(s => s.priceMode !== 'quote' && (s.price ?? 0) > 0).map((s) => (
                  <div key={s.key} className="flex justify-between">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="font-semibold text-gray-900">+ {f(s.price!)}</span>
                  </div>
                ))}
                {/* Montage row — text only, no price */}
                {draft.selections.some(s => s.priceMode === 'quote') && (
                  <div className="flex justify-between text-[#003878]">
                    <span className="font-medium flex items-center gap-1.5">
                      <Wrench size={14} />
                      Montage
                    </span>
                    <span className="font-semibold text-xs italic">op offerte</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Totaal incl. BTW</span>
                  <span className="font-black text-2xl text-[#003878]">{f(draft.pricing.total)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                Montage wordt op basis van uw situatie geoffreerd. U ontvangt een definitieve offerte per e-mail.
              </p>
            </div>
          </div>

          {/* RIGHT — Config + Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Configuration summary */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-black text-hett-dark">Configuratie overzicht</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {draft.selections.map((s) => (
                  <div key={s.key} className="flex items-center justify-between px-6 py-3.5">
                    <span className="text-sm text-gray-500">{s.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{s.valueLabel}</span>
                      {s.priceMode === 'quote' ? (
                        <span className="block text-xs text-[#003878] font-semibold italic">op offerte</span>
                      ) : (s.price ?? 0) > 0 ? (
                        <span className="block text-xs text-[#FF7300] font-semibold">+ {f(s.price!)}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <Link
                  to={backUrl}
                  className="text-sm text-[#003878] font-semibold hover:underline"
                >
                  ← Configuratie wijzigen
                </Link>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-black text-hett-dark">Uw gegevens</h3>
                <p className="text-sm text-gray-500 mt-1">Vul uw gegevens in en wij nemen contact met u op.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Naam */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    placeholder="Uw volledige naam"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:border-[#003878] ${
                      errors.naam ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {errors.naam && <p className="text-xs text-red-500 mt-1">{errors.naam}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="uw@email.nl"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:border-[#003878] ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Telefoon */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Telefoonnummer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={telefoon}
                    onChange={(e) => setTelefoon(e.target.value)}
                    placeholder="06-12345678"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:border-[#003878] ${
                      errors.telefoon ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {errors.telefoon && <p className="text-xs text-red-500 mt-1">{errors.telefoon}</p>}
                </div>

                {/* Postcode + Plaats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Postcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="1234 AB"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:border-[#003878] ${
                        errors.postcode ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.postcode && <p className="text-xs text-red-500 mt-1">{errors.postcode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Plaats <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={plaats}
                      onChange={(e) => setPlaats(e.target.value)}
                      placeholder="Uw woonplaats"
                      className={`w-full px-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:border-[#003878] ${
                        errors.plaats ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {errors.plaats && <p className="text-xs text-red-500 mt-1">{errors.plaats}</p>}
                  </div>
                </div>

                {/* Opmerking */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Opmerking <span className="text-gray-400">(optioneel)</span>
                  </label>
                  <textarea
                    value={opmerking}
                    onChange={(e) => setOpmerking(e.target.value)}
                    placeholder="Eventuele opmerkingen of vragen..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm transition-colors focus:outline-none focus:border-[#003878] resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl text-base transition-all ${
                    isSubmitting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF7300] text-white hover:bg-[#E66600] shadow-lg shadow-[#FF7300]/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Versturen...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Offerte aanvragen
                    </>
                  )}
                </button>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
                    ⚠️ {submitError}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center">
                  Door dit formulier te versturen gaat u akkoord met onze{' '}
                  <Link to="/privacy" className="text-[#003878] hover:underline">privacyverklaring</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offerte;
