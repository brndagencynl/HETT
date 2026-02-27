import React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLngs, type SupportedLng } from '../../src/i18n';

const labels: Record<SupportedLng, string> = { nl: 'NL', en: 'EN', de: 'DE' };

const LangSwitch: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider">
      {supportedLngs.map((lng, i) => (
        <React.Fragment key={lng}>
          {i > 0 && <span className="text-white/40">|</span>}
          <button
            onClick={() => i18n.changeLanguage(lng)}
            className={`px-1 transition-colors ${
              i18n.language === lng
                ? 'text-hett-brown underline underline-offset-2'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {labels[lng]}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default LangSwitch;
