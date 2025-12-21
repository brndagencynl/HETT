import type { VerandaConfig } from "../schemas/veranda";

export function calcVerandaPrice(basePrice: number, cfg: VerandaConfig) {
    const items: { label: string; amount: number }[] = [];

    // Daktype charges
    if (cfg.daktype === "glas_helder") items.push({ label: "Helder glas", amount: 320 });
    if (cfg.daktype === "glas_melk") items.push({ label: "Melk glas", amount: 450 });

    // Voorzijde
    if (cfg.voorzijde === "schuifwand") items.push({ label: "Glazen schuifwand (voorzijde)", amount: 1450 });

    // Zijwanden
    const sideMap: Record<string, number> = {
        poly_spie: 250,
        poly_wand: 450,
        glas_schuif: 895,
        rabat: 650,
        sandwich_polyspie: 950, // Future proofing
        sandwich_vol: 1250, // Future proofing
        geen: 0,
    };

    if (cfg.zijwand_links !== "geen" && sideMap[cfg.zijwand_links]) {
        items.push({ label: `Zijwand links`, amount: sideMap[cfg.zijwand_links] });
    }

    if (cfg.zijwand_rechts !== "geen" && sideMap[cfg.zijwand_rechts]) {
        items.push({ label: `Zijwand rechts`, amount: sideMap[cfg.zijwand_rechts] });
    }

    // Extra
    if (cfg.verlichting) items.push({ label: "LED Verlichting", amount: 249 });

    const extras = items.reduce((sum, i) => sum + i.amount, 0);
    const total = basePrice + extras;

    return { basePrice, items, extras, total };
}
