/**
 * Centralized negative prompts for AI generation
 * Prevents unwanted elements like text, watermarks, and artifacts
 */

export const DEFAULT_NEGATIVE_PROMPT = [
  // Text and writing elements
  "text", "watermark", "logo", "signature", "caption", "subtitle", 
  "writing", "letters", "words", "numbers", "symbols", "@ symbol",
  "website URL", "phone number", "email address", "social media handle",
  "brand name", "company name", "artist signature", "copyright notice",
  
  // Quality issues
  "low quality", "blurry", "distorted", "pixelated", "artifacts", "noise",
  "compression artifacts", "oversaturated", "underexposed", "overexposed",
  
  // Anatomical issues
  "bad anatomy", "deformed", "disfigured", "mutation", "extra limbs",
  "missing limbs", "floating limbs", "disconnected limbs", "malformed hands",
  "long neck", "long body", "mutated hands and fingers",
  
  // Composition issues
  "out of frame", "blender", "doll", "cropped", "low-res", "close-up",
  "poorly-drawn face", "double", "two heads", "blurred", "ugly",
  "too many limbs", "repetitive", "black and white", "grainy",
  
  // Technical issues
  "high pass filter", "airbrush", "portrait", "zoom", "soft light",
  "smooth skin", "closeup", "extra fingers", "bad proportions",
  "blind", "bad eyes", "ugly eyes", "dead eyes", "blur", "vignette",
  "out of shot", "out of focus", "gaussian", "monochrome", "noisy"
].join(", ");

export const VIDEO_NEGATIVE_PROMPT = DEFAULT_NEGATIVE_PROMPT + ", motion blur, frame rate issues, stuttering, choppy motion";

export const IMAGE_NEGATIVE_PROMPT = DEFAULT_NEGATIVE_PROMPT + ", jpeg artifacts, compression noise";

/**
 * Get negative prompt based on content type
 */
export function getNegativePrompt(contentType: 'image' | 'video' | 'audio' | 'voiceover' | 'text' | 'analysis' | 'clarification' = 'image'): string {
  switch (contentType) {
    case 'video':
      return VIDEO_NEGATIVE_PROMPT;
    case 'image':
    case 'voiceover':
    case 'text':
    case 'analysis':
    case 'clarification':
    default:
      return IMAGE_NEGATIVE_PROMPT;
  }
}

/**
 * Add custom negative prompts to the default ones
 */
export function combineNegativePrompts(customPrompts: string[]): string {
  const allPrompts = [...customPrompts, DEFAULT_NEGATIVE_PROMPT];
  return allPrompts.join(", ");
}
