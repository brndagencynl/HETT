/**
 * Parse specifications text from Shopify metafield into structured array
 * 
 * Expected input format (one spec per line):
 * - "Materiaal: Aluminium"
 * - "Kleur: RAL 7016"
 * - "Breedte: 706 cm"
 * 
 * Handles edge cases:
 * - Empty lines are ignored
 * - Lines without ":" get label "Info"
 * - Multiple ":" in value (only first is used as separator)
 * - Whitespace is trimmed
 */

export interface SpecificationItem {
  label: string;
  value: string;
}

export function parseSpecifications(text: string | null | undefined): SpecificationItem[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lines = text.split('\n');
  const specs: SpecificationItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Find first colon
    const colonIndex = trimmed.indexOf(':');

    if (colonIndex > 0) {
      // Has colon - split into label and value
      const label = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();
      
      if (label && value) {
        specs.push({ label, value });
      } else if (label) {
        // Has label but empty value
        specs.push({ label, value: '-' });
      }
    } else {
      // No colon - treat entire line as value with "Info" label
      specs.push({ label: 'Info', value: trimmed });
    }
  }

  return specs;
}

/**
 * Check if specifications text is valid (has at least one parseable spec)
 */
export function hasValidSpecifications(text: string | null | undefined): boolean {
  return parseSpecifications(text).length > 0;
}
