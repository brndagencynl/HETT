export type VerandaOptionKey =
    | "daktype"
    | "goot"
    | "voorzijde"
    | "zijwand_links"
    | "zijwand_rechts"
    | "verlichting";

export type VerandaConfig = {
    daktype: "poly_helder" | "poly_opaal" | "glas_helder" | "glas_melk";
    goot: 'deluxe' | 'cube' | 'classic';
    voorzijde: "geen" | "schuifwand";
    zijwand_links: "geen" | "poly_wand" | "poly_spie" | "sandwich_polyspie" | "sandwich_vol" | "rabat" | "glas_schuif";
    zijwand_rechts: "geen" | "poly_wand" | "poly_spie" | "sandwich_polyspie" | "sandwich_vol" | "rabat" | "glas_schuif";
    verlichting: boolean;
    profileColor: 'Antraciet (RAL7016)' | 'Crèmewit (RAL9001)' | 'Zwart (RAL9005)';
};

// @ts-ignore - Partial defaults fine, validation catches missing
export const DEFAULT_VERANDA_CONFIG: Partial<VerandaConfig> = {
    // daktype: undefined, // Force choice
    // goot: undefined, // Force choice
    voorzijde: "geen",
    zijwand_links: "geen",
    zijwand_rechts: "geen",
    verlichting: false,
    profileColor: 'Antraciet (RAL7016)'
};

export const VERANDA_OPTIONS_UI = [
    {
        key: "profileColor",
        label: "Kleur profiel",
        type: "radio",
        choices: [
            { value: 'Antraciet (RAL7016)', label: 'Antraciet (RAL7016)', hex: '#293133' },
            { value: 'Crèmewit (RAL9001)', label: 'Crèmewit (RAL9001)', hex: '#FDF4E3' },
            { value: 'Zwart (RAL9005)', label: 'Zwart (RAL9005)', hex: '#0E0E10' }
        ]
    },
    {
        key: "daktype",
        label: "Daktype",
        type: "card",
        choices: [
            { value: "poly_opaal", label: "Polycarbonaat opaal", price: 0, description: "Melkwit polycarbonaat. Laat licht door maar weert directe hitte.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400" },
            { value: "poly_helder", label: "Polycarbonaat helder", price: 0, description: "Helder polycarbonaat. Maximale lichtinval.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400" },
            { value: "glas_helder", label: "Helder glas", price: 320, description: "Luxe uitstraling, geluiddempend.", image: "https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?q=80&w=400" },
            { value: "glas_melk", label: "Melk glas", price: 450, description: "Privacy en luxe uitstraling.", image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=400" },
        ],
    },
    {
        key: "goot",
        label: "Goot optie",
        type: "select",
        choices: [
            { value: "classic", label: "Classic (Rond)", price: 0, description: "Traditionele ronde goot." },
            { value: "cube", label: "Cube (Vierkant)", price: 0, description: "Strakke rechte goot." },
            { value: "deluxe", label: "Deluxe (Sierlijst)", price: 50, description: "Luxe afgewerkte goot met sierlijst." },
        ],
    },
    {
        key: "zijwand_links",
        label: "Zijwand links",
        type: "select", // Changed to select/list for consistency with previous UI
        choices: [
            { value: "geen", label: "Geen (Open)", price: 0, description: "De zijkant blijft volledig open." },
            { value: "poly_wand", label: "Polycarbonaat wand", price: 450, description: "Vaste wand met lichtdoorlatend polycarbonaat." },
            { value: "poly_spie", label: "Glazen spie (driehoek)", price: 250, description: "Dicht de driehoek boven een schutting." },
            { value: "glas_schuif", label: "Glazen schuifwand", price: 895, description: "Glazen panelen die u open en dicht kunt schuiven." },
            { value: "rabat", label: "Dicht (Rabatdelen)", price: 650, description: "Volledig dichte wand van aluminium rabatdelen." }
        ],
    },
    {
        key: "zijwand_rechts",
        label: "Zijwand rechts",
        type: "select",
        choices: [
            { value: "geen", label: "Geen (Open)", price: 0, description: "De zijkant blijft volledig open." },
            { value: "poly_wand", label: "Polycarbonaat wand", price: 450, description: "Vaste wand met lichtdoorlatend polycarbonaat." },
            { value: "poly_spie", label: "Glazen spie (driehoek)", price: 250, description: "Dicht de driehoek boven een schutting." },
            { value: "glas_schuif", label: "Glazen schuifwand", price: 895, description: "Glazen panelen die u open en dicht kunt schuiven." },
            { value: "rabat", label: "Dicht (Rabatdelen)", price: 650, description: "Volledig dichte wand van aluminium rabatdelen." }
        ],
    },
    {
        key: "voorzijde",
        label: "Voorzijde",
        type: "select",
        choices: [
            { value: "geen", label: "Volledig open", price: 0, description: "De voorzijde blijft volledig open." },
            { value: "schuifwand", label: "Glazen schuifwanden", price: 1450, description: "Glazen panelen over de gehele breedte." },
        ],
    },
    {
        key: "verlichting",
        label: "Extra",
        type: "toggle",
        choices: [{ value: true, label: "Verlichting", price: 249, description: "LED Verlichting Set (6 spots)" }],
    },
] as const;
