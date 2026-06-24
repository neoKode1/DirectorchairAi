import { describe, expect, it } from 'vitest';
import {
  FAL_DOCUMENTATION_URL,
  FAL_MODEL_API_REFERENCE_URL,
  getFalModelDocsUrl,
  getFalModelLlmsUrl,
  getFalRunEndpointUrl,
  normalizeFalEndpointId,
} from '@/lib/fal-docs';

describe('Fal documentation links', () => {
  it('locks the canonical Fal documentation links', () => {
    expect(FAL_DOCUMENTATION_URL).toBe('https://fal.ai/docs/documentation');
    expect(FAL_MODEL_API_REFERENCE_URL).toBe('https://fal.ai/docs/model-api-reference');
  });

  it('builds exact per-model documentation links from endpoint IDs', () => {
    const endpointId = 'xai/grok-imagine-video/v1.5/image-to-video';

    expect(normalizeFalEndpointId(`/${endpointId}/`)).toBe(endpointId);
    expect(getFalModelDocsUrl(endpointId)).toBe(`https://fal.ai/models/${endpointId}`);
    expect(getFalModelLlmsUrl(endpointId)).toBe(`https://fal.ai/models/${endpointId}/llms.txt`);
    expect(getFalRunEndpointUrl(endpointId)).toBe(`https://fal.run/${endpointId}`);
  });
});