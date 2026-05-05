/**
 * Shared model identifiers for the persona character-sheet generation flow.
 * Kept outside the route files because Next.js App Router restricts
 * what can be exported from `route.ts` to the HTTP method handlers
 * and a small metadata whitelist (dynamic, runtime, maxDuration, etc.).
 */

export const PRIMARY_MODEL = 'fal-ai/nano-banana-pro/edit';
export const FALLBACK_MODEL = 'fal-ai/bytedance/seedream/v4/edit';

export type CharacterSheetModel = typeof PRIMARY_MODEL | typeof FALLBACK_MODEL;

export const ALLOWED_CHARACTER_SHEET_MODELS: ReadonlySet<string> = new Set([
  PRIMARY_MODEL,
  FALLBACK_MODEL,
]);
