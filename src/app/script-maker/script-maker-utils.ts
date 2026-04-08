/**
 * Utility functions and constants for the ScriptMaker page.
 * Extracted to reduce page.tsx size and improve testability.
 */

/** Map model IDs to human-readable names for the ScriptMaker UI */
export function getModelFriendlyName(modelId?: string): string {
  if (!modelId) return 'Unknown Model';
  const MODEL_NAMES: Record<string, string> = {
    'fal-ai/nano-banana-pro/edit': 'Nano Banana Pro Edit',
    'fal-ai/nano-banana/edit': 'Nano Banana Edit (Legacy)',
    'fal-ai/bytedance/seedream/v4/edit': 'SeeDream 4.0 Edit',
    'fal-ai/flux-pro/v1.1-ultra': 'Flux Pro 1.1 Ultra',
    'fal-ai/stable-diffusion-v35-large': 'Stable Diffusion 3.5',
  };
  return MODEL_NAMES[modelId] || modelId;
}

/** Genre options for the movie idea step */
export const GENRE_OPTIONS = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance',
  'Sci-Fi', 'Thriller', 'Fantasy',
] as const;

/** Era/setting options for the movie idea step */
export const ERA_OPTIONS = [
  { value: 'contemporary', label: 'Contemporary (Present Day)' },
  { value: '1920s-noir', label: '1920s Noir' },
  { value: '1950s-classic', label: '1950s Classic Hollywood' },
  { value: '1970s-gritty', label: '1970s Gritty Realism' },
  { value: '1980s-neon', label: '1980s Neon Retro' },
  { value: 'futuristic', label: 'Futuristic / Cyberpunk' },
  { value: 'medieval', label: 'Medieval / Fantasy' },
  { value: 'victorian', label: 'Victorian Era' },
] as const;

/** Photo style options */
export const PHOTO_STYLE_OPTIONS = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'vhs-aesthetic', label: 'VHS Aesthetic' },
  { value: 'retro', label: 'Retro' },
  { value: 'animation', label: 'Animation' },
  { value: 'manga', label: 'Manga/Anime' },
  { value: 'noir', label: 'Film Noir' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
] as const;

/** Image generation model options for storyboard */
export const STORYBOARD_MODEL_OPTIONS = [
  { value: 'fal-ai/nano-banana-pro/edit', label: 'Nano Banana Pro Edit (Recommended)' },
  { value: 'fal-ai/nano-banana/edit', label: 'Nano Banana Edit' },
  { value: 'fal-ai/bytedance/seedream/v4/edit', label: 'SeeDream 4.0 Edit' },
  { value: 'fal-ai/flux-pro/v1.1-ultra', label: 'Flux Pro 1.1 Ultra' },
  { value: 'fal-ai/stable-diffusion-v35-large', label: 'Stable Diffusion 3.5' },
] as const;

/** Download an image from a URL as a blob */
export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${filename}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

/** Type for fullscreen image modal state */
export interface FullscreenImageState {
  url: string;
  title: string;
}

/** Type for character reference image */
export interface CharacterReferenceImage {
  url: string;
  analysis: string;
  characterName?: string;
  fileName?: string;
}

/** Type for style reference image */
export interface StyleReferenceImage {
  url: string;
  analysis: string;
  fileName?: string;
}
