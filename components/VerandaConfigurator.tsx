/**
 * VerandaConfigurator - Wrapper component
 * 
 * This file now exports the new wizard-based configurator.
 * The old accordion-based UI has been replaced with a step-by-step flow.
 */

import VerandaConfiguratorWizard from './VerandaConfiguratorWizard';

// Re-export the wizard types and component
export type { VerandaConfiguratorWizardRef as VerandaConfiguratorRef } from './VerandaConfiguratorWizard';
export default VerandaConfiguratorWizard;

