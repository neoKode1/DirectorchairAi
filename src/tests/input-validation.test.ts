/**
 * Tests for input validation and sanitization.
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizePrompt,
  isValidModel,
  validateGenerateInput,
  validateChatInput,
} from '@/lib/input-validation';

describe('sanitizePrompt', () => {
  it('trims whitespace', () => {
    expect(sanitizePrompt('  hello world  ')).toBe('hello world');
  });

  it('returns null for empty string', () => {
    expect(sanitizePrompt('')).toBeNull();
    expect(sanitizePrompt('   ')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(sanitizePrompt(undefined)).toBeNull();
  });

  it('strips control characters', () => {
    expect(sanitizePrompt('hello\x00\x01\x02world')).toBe('helloworld');
  });

  it('preserves newlines and tabs', () => {
    expect(sanitizePrompt('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });

  it('truncates at max length', () => {
    const long = 'a'.repeat(20_000);
    const result = sanitizePrompt(long, 10_000);
    expect(result!.length).toBe(10_000);
  });

  it('collapses excessive spaces', () => {
    const spacey = 'hello' + ' '.repeat(30) + 'world';
    expect(sanitizePrompt(spacey)).toBe('hello  world');
  });
});

describe('isValidModel', () => {
  it('accepts known models', () => {
    expect(isValidModel('fal-ai/imagen4/preview')).toBe(true);
    expect(isValidModel('fal-ai/flux-pro/v1.1-ultra')).toBe(true);
    expect(isValidModel('fal-ai/ffmpeg-api/extract-frame')).toBe(true);
  });

  it('rejects unknown models', () => {
    expect(isValidModel('evil-model/steal-data')).toBe(false);
    expect(isValidModel('')).toBe(false);
    expect(isValidModel('fal-ai/nonexistent')).toBe(false);
  });
});

describe('validateGenerateInput', () => {
  it('rejects missing model', () => {
    const result = validateGenerateInput({ prompt: 'test' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Model');
  });

  it('rejects unknown model', () => {
    const result = validateGenerateInput({ model: 'bad/model', prompt: 'test' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unknown model');
  });

  it('rejects missing prompt', () => {
    const result = validateGenerateInput({ model: 'fal-ai/imagen4/preview' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Prompt');
  });

  it('accepts valid input and sanitizes', () => {
    const result = validateGenerateInput({
      model: 'fal-ai/imagen4/preview',
      prompt: '  A beautiful sunset\x00  ',
    });
    expect(result.valid).toBe(true);
    expect(result.sanitized!.prompt).toBe('A beautiful sunset');
    expect(result.sanitized!.model).toBe('fal-ai/imagen4/preview');
  });

  it('rejects too many image_urls', () => {
    const result = validateGenerateInput({
      model: 'fal-ai/imagen4/preview',
      prompt: 'test',
      image_urls: Array(11).fill('https://example.com/img.jpg'),
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Too many images');
  });
});

describe('validateChatInput', () => {
  it('rejects empty messages', () => {
    expect(validateChatInput({ messages: [] }).valid).toBe(false);
  });

  it('rejects missing messages', () => {
    expect(validateChatInput({}).valid).toBe(false);
  });

  it('accepts valid messages', () => {
    const result = validateChatInput({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(result.valid).toBe(true);
  });

  it('rejects oversized last message', () => {
    const result = validateChatInput({
      messages: [{ role: 'user', content: 'x'.repeat(11_000) }],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('rejects too many messages', () => {
    const messages = Array(101).fill({ role: 'user', content: 'hi' });
    const result = validateChatInput({ messages });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });
});
