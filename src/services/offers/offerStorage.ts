/**
 * Offer Draft Storage
 * ====================
 * 
 * Persists offer draft in sessionStorage for navigation
 * from configurator to offer page.
 */

import type { OfferRequestDraft } from '../../types/offer';

const STORAGE_KEY = 'hett_offer_draft';

export function setOfferDraft(draft: OfferRequestDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('[OfferStorage] Failed to save draft:', error);
  }
}

export function getOfferDraft(): OfferRequestDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfferRequestDraft;
  } catch (error) {
    console.error('[OfferStorage] Failed to read draft:', error);
    return null;
  }
}

export function clearOfferDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[OfferStorage] Failed to clear draft:', error);
  }
}
