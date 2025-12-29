import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import MaatwerkVerandaConfigurator from './MaatwerkVerandaConfigurator';
import type { PartialMaatwerkConfig, MaatwerkConfig } from '../src/configurators/custom/customTypes';

const MotionDiv = motion.div as any;

export default function CustomVerandaConfiguratorModal({
  isOpen,
  title = 'Maatwerk configurator',
  initialConfig,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  title?: string;
  initialConfig: PartialMaatwerkConfig;
  onSave: (config: MaatwerkConfig) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          />

          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[201]"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="h-full w-full overflow-y-auto">
              <div className="min-h-full flex items-start justify-center p-3 sm:p-6">
                <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl font-black text-hett-dark truncate">{title}</div>
                      <div className="text-xs text-hett-muted mt-0.5">Pas je bestaande maatwerk veranda aan</div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                      aria-label="Sluiten"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-hett-bg">
                    <MaatwerkVerandaConfigurator
                      mode="edit"
                      layout="modal"
                      initialConfig={initialConfig}
                      onSave={onSave}
                      onCancel={onClose}
                    />
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
