import type { VerandaConfig } from "../schemas/veranda";

export function getVerandaLayers(cfg: VerandaConfig) {
    return {
        dak_opaal: cfg.daktype === "poly_opaal",
        dak_helder: cfg.daktype === "poly_helder",
        dak_glas: cfg.daktype === "glas_helder" || cfg.daktype === "glas_melk",
        voor_schuifwand: cfg.voorzijde === "schuifwand",
        zij_links_poly: cfg.zijwand_links === "poly_spie" || cfg.zijwand_links === "poly_wand",
        zij_links_dicht: cfg.zijwand_links === "rabat",
        zij_links_glas: cfg.zijwand_links === "glas_schuif",
        zij_rechts_poly: cfg.zijwand_rechts === "poly_spie" || cfg.zijwand_rechts === "poly_wand",
        zij_rechts_dicht: cfg.zijwand_rechts === "rabat",
        zij_rechts_glas: cfg.zijwand_rechts === "glas_schuif",
        verlichting: cfg.verlichting,
    };
}
