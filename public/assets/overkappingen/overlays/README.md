# Variant-Aware Goot Overlays

This directory structure organizes Goot overlays by type and color.

### File Structure
- `goot/`
  - `deluxe/`
    - `antraciet.png` (Default for RAL 7016)
    - `cremewit.png` (Default for RAL 9001)
    - `gitzwart.png` (Default for RAL 9005)
  - `cube/`
    - Same structure...
  - `classic/`
    - Same structure...

### Future Expansion (Daktype)
To add daktype-specific overlays (e.g., if the glass roof sits differently near the gutter), add files with double underscore:
- `antraciet__glas.png`
- `antraciet__poly_opaal.png`

The resolver is already prepared to handle this logic if enabled in code.
