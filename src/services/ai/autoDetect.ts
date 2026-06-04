/**
 * Language auto-detection. isLikelyHausa is a fast offline heuristic over a small
 * common-word set (used when the network is down); detectLanguageRemote calls the
 * Gemini-backed endpoint for accurate detection when online.
 */
import apiClient from '../api/client';

// Hausa word list for offline fallback — common words a child might type
const HAUSA_WORDS = new Set([
  'ina', 'gida', 'ruwa', 'abinci', 'yaro', 'yarinya', 'malamai', 'makaranta',
  'littafi', 'aiki', 'dare', 'rana', 'wata', 'tauraro', 'rafi', 'daji',
  'kifi', 'tsuntsu', 'kaza', 'shanu', 'dawaki', 'rago', 'akuya',
]);

// Local check — no network needed
export function isLikelyHausa(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter((w) => HAUSA_WORDS.has(w));
  return matches.length / words.length > 0.3;
}

// Server-side detection via Gemini (online only)
// TODO: endpoint /kids/ai/detect-language
export const detectLanguageRemote = (childResponse: string, token: string) =>
  apiClient.post<{ language: string; confidence: number }>(
    '/kids/ai/detect-language',
    { response: childResponse },
    token,
  );
