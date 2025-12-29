import React, { useMemo, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';

import type { SandwichConfig } from '../../../types';
import {
  SANDWICH_COLOR_OPTIONS,
  SANDWICH_LENGTH_MM_OPTIONS,
  SANDWICH_WORKING_WIDTH_MM,
  calculateSandwichpanelenPricing,
} from '../../../src/pricing/sandwichpanelen';

export default function SandwichPanelCartItemEditor({
  basePrice,
  initialConfig,
  onCancel,
  onSave,
}: {
  basePrice: number;
  initialConfig: SandwichConfig;
  onCancel: () => void;
  onSave: (nextConfig: SandwichConfig) => void;
}) {
  const [config, setConfig] = useState<SandwichConfig>(() => ({
    workingWidthMm: SANDWICH_WORKING_WIDTH_MM,
    lengthMm: initialConfig.lengthMm,
    color: initialConfig.color,
    extras: {
      uProfiles: {
        enabled: Boolean(initialConfig.extras?.uProfiles?.enabled),
        meters: Math.max(1, Math.round(Number(initialConfig.extras?.uProfiles?.meters || 1))),
      },
    },
  }));
  const [touched, setTouched] = useState(false);

  const isValid = Boolean(config.lengthMm) && Boolean(config.color);

  const pricing = useMemo(() => {
    return calculateSandwichpanelenPricing({
      basePrice,
      config: config as any,
    });
  }, [basePrice, config]);

  const selectedColor = useMemo(
    () => SANDWICH_COLOR_OPTIONS.find(c => c.id === config.color),
    [config.color]
  );

  return (
    <div className="space-y-6">
      {/* Width (locked) */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">Werkende breedte</label>
        </div>
        <select
          disabled
          className="w-full p-3 bg-white border rounded-lg appearance-none font-medium text-hett-dark border-gray-200 opacity-80 cursor-not-allowed"
          value={String(SANDWICH_WORKING_WIDTH_MM)}
          onChange={() => undefined}
        >
          <option value={String(SANDWICH_WORKING_WIDTH_MM)}>{SANDWICH_WORKING_WIDTH_MM} mm (standaard)</option>
        </select>
      </div>

      {/* Length (required) */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">
            Lengte (mm) <span className="text-red-500">*</span>
          </label>
          {touched && !config.lengthMm && (
            <span className="text-xs text-red-500 font-bold animate-pulse">Verplicht veld</span>
          )}
        </div>
        <select
          className={`w-full p-3 bg-white border rounded-lg appearance-none font-medium text-hett-dark focus:outline-none focus:ring-2 focus:ring-hett-primary/20 ${
            touched && !config.lengthMm ? 'border-red-300' : 'border-gray-200'
          }`}
          value={config.lengthMm ? String(config.lengthMm) : ''}
          onChange={(e) => {
            setConfig((p) => ({ ...p, lengthMm: Number(e.target.value) as any }));
            setTouched(true);
          }}
        >
          <option value="" disabled>Maak een keuze...</option>
          {SANDWICH_LENGTH_MM_OPTIONS.map((mm) => (
            <option key={mm} value={String(mm)}>{mm}</option>
          ))}
        </select>
      </div>

      {/* Color (required) */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">
            Kleur <span className="text-red-500">*</span>
          </label>
          {touched && !config.color && (
            <span className="text-xs text-red-500 font-bold animate-pulse">Verplicht veld</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {SANDWICH_COLOR_OPTIONS.map((c) => {
            const isSelected = config.color === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setConfig((p) => ({ ...p, color: c.id as any }));
                  setTouched(true);
                }}
                className={`group relative w-12 h-12 rounded-lg shadow-sm border-2 transition-all ${
                  isSelected ? 'border-hett-primary scale-110 ring-2 ring-hett-primary/20' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
                aria-label={c.label}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center text-hett-primary drop-shadow-md">
                    <Check size={20} />
                  </div>
                )}
              </button>
            );
          })}
          {selectedColor ? (
            <div className="text-xs text-gray-600 font-semibold truncate">{selectedColor.label}</div>
          ) : null}
        </div>
      </div>

      {/* U profiles */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-hett-dark uppercase tracking-wide">U-profielen</label>

        <div
          onClick={() => {
            setConfig((p) => ({
              ...p,
              extras: {
                uProfiles: {
                  enabled: !p.extras?.uProfiles?.enabled,
                  meters: Math.max(1, Math.round(Number(p.extras?.uProfiles?.meters || 1))),
                },
              },
            }));
            setTouched(true);
          }}
          className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer select-none ${
            config.extras?.uProfiles?.enabled
              ? 'border-hett-primary bg-hett-primary/5 ring-1 ring-hett-primary'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          role="button"
          tabIndex={0}
        >
          <div className="flex-grow min-w-0">
            <div className="font-bold text-hett-dark text-sm truncate">U-profielen per meter</div>
            <div className="text-xs text-gray-500 font-medium">Optioneel</div>
          </div>
          <div className="text-right pl-3">
            <div className="text-sm font-bold text-hett-dark">
              {config.extras?.uProfiles?.enabled ? `+€${pricing.extrasTotal.toFixed(2)}` : '—'}
            </div>
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ml-auto transition-colors ${
                config.extras?.uProfiles?.enabled
                  ? 'bg-hett-primary border-hett-primary text-white'
                  : 'border-gray-300'
              }`}
            >
              {config.extras?.uProfiles?.enabled ? <Check size={12} /> : null}
            </div>
          </div>
        </div>

        {config.extras?.uProfiles?.enabled ? (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Aantal (m)</div>
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 w-32">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfig((p) => ({
                    ...p,
                    extras: {
                      uProfiles: {
                        enabled: true,
                        meters: Math.max(1, Math.round(Number(p.extras?.uProfiles?.meters || 1)) - 1),
                      },
                    },
                  }));
                }}
                className="p-2 text-gray-400 hover:text-hett-dark"
                aria-label="Minder meters"
              >
                <Minus size={16} />
              </button>
              <span className="flex-grow text-center font-bold text-hett-dark">{Math.max(1, Math.round(Number(config.extras?.uProfiles?.meters || 1)))}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfig((p) => ({
                    ...p,
                    extras: {
                      uProfiles: {
                        enabled: true,
                        meters: Math.max(1, Math.round(Number(p.extras?.uProfiles?.meters || 1)) + 1),
                      },
                    },
                  }));
                }}
                className="p-2 text-gray-400 hover:text-hett-dark"
                aria-label="Meer meters"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Totals + actions */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Product totaal</span>
            <span>€ {pricing.basePrice.toLocaleString()},-</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Opties totaal</span>
            <span>€ {pricing.extrasTotal.toLocaleString()},-</span>
          </div>
          <div className="flex justify-between text-lg font-black text-hett-dark pt-2 border-t border-gray-200">
            <span>Totaal</span>
            <span>€ {pricing.total.toLocaleString()},-</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-lg font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              if (!isValid) return;
              onSave(config);
            }}
            disabled={!isValid}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
              isValid
                ? 'bg-hett-primary text-white hover:bg-hett-dark shadow-lg shadow-hett-primary/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Opslaan
          </button>
        </div>

        {!isValid && touched ? (
          <p className="text-center text-xs text-red-500 font-bold mt-2 animate-pulse">
            Selecteer a.u.b. alle verplichte opties
          </p>
        ) : null}
      </div>
    </div>
  );
}
