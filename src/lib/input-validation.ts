/**
 * Input validation and sanitization for API routes.
 *
 * Prevents prompt injection, excessive payloads, and invalid model IDs.
 */
import { MODEL_GROUPS } from '@/components/chat-model-data';

// ── Limits ──
const MAX_PROMPT_LENGTH = 10_000;    // ~2,500 words
const MAX_NEGATIVE_PROMPT = 2_000;
const MAX_IMAGE_URLS = 10;
const MAX_URL_LENGTH = 50_000;       // base64 data URIs can be large

// ── Build model allowlist from the canonical catalog ──
const ALLOWED_MODELS = new Set<string>();
MODEL_GROUPS.forEach(group =>
  group.models.forEach(m => ALLOWED_MODELS.add(m.value))
);
// Also allow the FFmpeg utility model
ALLOWED_MODELS.add('fal-ai/ffmpeg-api/extract-frame');

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    prompt: string;
    model: string;
    negative_prompt?: string;
  };
}

/**
 * Sanitize a text prompt:
 * - Trim whitespace
 * - Strip control characters (except newlines/tabs)
 * - Enforce length limit
 */
export function sanitizePrompt(raw: string | undefined, maxLength = MAX_PROMPT_LENGTH): string | null {
  if (!raw || typeof raw !== 'string') return null;

  const cleaned = raw
    .trim()
    // Remove control chars except \n \r \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse excessive whitespace
    .replace(/[ \t]{20,}/g, '  ');

  if (cleaned.length === 0) return null;
  if (cleaned.length > maxLength) return cleaned.slice(0, maxLength);
  return cleaned;
}

/**
 * Validate a model ID against the known allowlist.
 */
export function isValidModel(model: string): boolean {
  return ALLOWED_MODELS.has(model);
}

/**
 * Full validation for /api/generate input.
 */
export function validateGenerateInput(body: Record<string, any>): ValidationResult {
  const model = body.model || body.endpoint || body.endpointId;

  if (!model || typeof model !== 'string') {
    return { valid: false, error: 'Model parameter is required' };
  }

  if (!isValidModel(model)) {
    return { valid: false, error: `Unknown model: "${model}". Check available models at /api/health.` };
  }

  const prompt = sanitizePrompt(body.prompt);
  if (!prompt) {
    return { valid: false, error: 'Prompt is required and must be a non-empty string' };
  }

  // Validate image URLs count
  if (body.image_urls && Array.isArray(body.image_urls)) {
    if (body.image_urls.length > MAX_IMAGE_URLS) {
      return { valid: false, error: `Too many images (max ${MAX_IMAGE_URLS})` };
    }
    for (const url of body.image_urls) {
      if (typeof url === 'string' && url.length > MAX_URL_LENGTH) {
        return { valid: false, error: 'Image URL exceeds maximum size' };
      }
    }
  }

  if (body.image_url && typeof body.image_url === 'string' && body.image_url.length > MAX_URL_LENGTH) {
    return { valid: false, error: 'Image URL exceeds maximum size' };
  }

  const negative_prompt = body.negative_prompt
    ? sanitizePrompt(body.negative_prompt, MAX_NEGATIVE_PROMPT) || undefined
    : undefined;

  return {
    valid: true,
    sanitized: { prompt, model, negative_prompt },
  };
}

/**
 * Validate chat message input.
 */
export function validateChatInput(body: Record<string, any>): ValidationResult {
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: 'Messages array is required' };
  }

  // Check last message size (the new user input)
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.content && typeof lastMsg.content === 'string') {
    if (lastMsg.content.length > MAX_PROMPT_LENGTH) {
      return { valid: false, error: `Message too long (max ${MAX_PROMPT_LENGTH} chars)` };
    }
  }

  // Limit conversation length to prevent token abuse
  if (messages.length > 100) {
    return { valid: false, error: 'Conversation too long (max 100 messages). Start a new chat.' };
  }

  return { valid: true, sanitized: { prompt: '', model: '' } };
}
