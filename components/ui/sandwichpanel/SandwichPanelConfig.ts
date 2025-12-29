import type { SandwichColorId, SandwichLengthMm } from '../../../src/pricing/sandwichpanelen';
import { SANDWICH_WORKING_WIDTH_MM } from '../../../src/pricing/sandwichpanelen';

export type SandwichpanelenConfig = {
    workingWidthMm: typeof SANDWICH_WORKING_WIDTH_MM;
    lengthMm?: SandwichLengthMm;
    color?: SandwichColorId;
    extras: {
        uProfiles: {
            enabled: boolean;
            meters: number;
        };
    };
};

export const DEFAULT_SANDWICHPANEL_CONFIG: SandwichpanelenConfig = {
    workingWidthMm: SANDWICH_WORKING_WIDTH_MM,
    lengthMm: undefined,
    color: undefined,
    extras: {
        uProfiles: {
            enabled: false,
            meters: 1,
        },
    },
};
