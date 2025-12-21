export type SandwichPanelOptionType = "select" | "tiles" | "swatches" | "addons" | "included";

export interface SandwichPanelChoice {
    id: string;
    label: string;
    priceDelta: number;
    image?: string;
    badge?: string; // e.g. "Meest gekozen"
    description?: string;
    subtitle?: string; // e.g. "Set van 2"
}

export interface SandwichPanelOptionGroup {
    id: string;
    label: string;
    type: SandwichPanelOptionType;
    required: boolean;
    choices: SandwichPanelChoice[];
}

export interface SandwichPanelBuilderConfig {
    basePrice: number; // Placeholder, usually from product
    groups: SandwichPanelOptionGroup[];
}

export const DEFAULT_SANDWICH_CONFIG: SandwichPanelOptionGroup[] = [
    {
        id: "width",
        label: "Werkbreedte",
        type: "select",
        required: true,
        choices: [
            { id: "1000", label: "1000mm (Standaard)", priceDelta: 0 },
            { id: "1150", label: "1150mm (Extra breed)", priceDelta: 5 },
        ],
    },
    {
        id: "thickness",
        label: "Dikte",
        type: "select",
        required: true,
        choices: [
            { id: "40mm", label: "40mm", priceDelta: 0 },
            { id: "60mm", label: "60mm", priceDelta: 8 },
            { id: "80mm", label: "80mm", priceDelta: 15 },
            { id: "100mm", label: "100mm", priceDelta: 22 },
        ],
    },
    {
        id: "core",
        label: "Isolatiekern",
        type: "tiles",
        required: true,
        choices: [
            { id: "pir", label: "PIR", priceDelta: 0, badge: "Best isolerend" },
            { id: "eps", label: "EPS", priceDelta: -2 },
        ],
    },
    {
        id: "color",
        label: "Kleur binnenzijde",
        type: "swatches",
        required: true,
        choices: [
            { id: "ral9002", label: "Grijswit (RAL 9002)", priceDelta: 0 },
            { id: "ral9010", label: "Zuiver wit (RAL 9010)", priceDelta: 2 },
            { id: "ral7016", label: "Antraciet (RAL 7016)", priceDelta: 4 },
        ],
    },
    {
        id: "addons",
        label: "Opties",
        type: "addons",
        required: false,
        choices: [
            {
                id: "cutback",
                label: "Cutback (Eindlap)",
                subtitle: "Voorbereiding goot",
                priceDelta: 12.50,
                image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=200", // Placeholder
                badge: "Aanbevolen"
            },
            {
                id: "anticondens",
                label: "Anticondensvilt",
                subtitle: "Voorkomt druppels",
                priceDelta: 4.50,
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=200", // Placeholder
            }
        ]
    },
    {
        id: "warranty",
        label: "Garantie",
        type: "included",
        required: true,
        choices: [
            { id: "10y", label: "10 Jaar Fabrieksgarantie", priceDelta: 0, badge: "Gratis" }
        ]
    }
];
