/**
 * MontageStepsSection Component
 * =============================
 * 
 * Visual stepper showing 5 steps for ordering and installation.
 * Responsive: desktop shows timeline + summary card, mobile shows stacked cards.
 */

import React from 'react';
import { Settings, ShoppingCart, Truck, Wrench, HeartHandshake, CalendarCheck, Users, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const MontageStepsSection: React.FC = () => {
  const { t } = useTranslation();
  const steps: Step[] = [
    {
      number: 1,
      title: t('mountingSteps.steps.1.title'),
      description: t('mountingSteps.steps.1.description'),
      icon: Settings,
    },
    {
      number: 2,
      title: t('mountingSteps.steps.2.title'),
      description: t('mountingSteps.steps.2.description'),
      icon: ShoppingCart,
    },
    {
      number: 3,
      title: t('mountingSteps.steps.3.title'),
      description: t('mountingSteps.steps.3.description'),
      icon: Truck,
    },
    {
      number: 4,
      title: t('mountingSteps.steps.4.title'),
      description: t('mountingSteps.steps.4.description'),
      icon: Wrench,
    },
    {
      number: 5,
      title: t('mountingSteps.steps.5.title'),
      description: t('mountingSteps.steps.5.description'),
      icon: HeartHandshake,
    },
  ];

  const infoBadges = [
    { icon: CalendarCheck, label: t('mountingSteps.badges.0') },
    { icon: Users, label: t('mountingSteps.badges.1') },
    { icon: Headphones, label: t('mountingSteps.badges.2') },
  ];

  return (
    <section className="py-12 md:py-16">
      {/* Section Header */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-hett-dark mb-3">
          {t('mountingSteps.title')}
        </h2>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl">
          {t('mountingSteps.description')}
        </p>
      </div>

      {/* Main Content: Steps + Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Steps Timeline (Desktop) / Cards (Mobile) */}
        <div className="lg:col-span-8">
          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#003878] via-[#003878]/50 to-gray-200" />
            
            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;
                
                return (
                  <div key={step.number} className="relative flex gap-6">
                    {/* Number Badge */}
                    <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[#003878] text-white font-black text-lg flex items-center justify-center shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Content Card */}
                    <div className={`flex-1 bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-[#003878]/30 transition-all ${!isLast ? 'mb-2' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#003878]/10 flex items-center justify-center flex-shrink-0">
                          <Icon size={20} className="text-[#003878]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-hett-dark text-base mb-1">{step.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              
              return (
                <div key={step.number} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#003878] text-white font-bold text-sm flex items-center justify-center">
                      {step.number}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className="text-[#003878] flex-shrink-0" />
                        <h3 className="font-bold text-hett-dark text-sm">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Card (Desktop) */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-br from-[#003878] to-[#002050] rounded-2xl p-6 text-white shadow-xl sticky top-32">
            <h3 className="font-bold text-lg mb-4">{t('mountingSteps.whyTitle')}</h3>
            
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm text-white/90">{t('mountingSteps.whyItems.0')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm text-white/90">{t('mountingSteps.whyItems.1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm text-white/90">{t('mountingSteps.whyItems.2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-sm text-white/90">{t('mountingSteps.whyItems.3')}</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-white/20">
              <p className="text-xs text-white/70 leading-relaxed">
                {t('mountingSteps.note')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Badges */}
      <div className="mt-8 flex flex-wrap gap-3 md:gap-4">
        {infoBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm"
            >
              <Icon size={16} className="text-[#003878]" />
              <span className="text-sm font-medium text-hett-dark">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MontageStepsSection;
