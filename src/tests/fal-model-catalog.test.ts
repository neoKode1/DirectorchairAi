import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getFalModelDocsUrl, getFalModelLlmsUrl } from '@/lib/fal-docs';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

function uniqueMatches(text: string, regex: RegExp): string[] {
  return [...new Set([...text.matchAll(regex)].map(match => match[1]))].sort();
}

const endpointIdPattern = '((?:fal-ai|xai|bytedance|endframe|luma)/[A-Za-z0-9._~:/?#@!$&()*+,;=%-]+)';
const registryIds = () => uniqueMatches(read('src/lib/fal.ts'), new RegExp(`endpointId:\\s*["']${endpointIdPattern}["']`, 'g'));
const dropdownIds = () => uniqueMatches(read('src/components/chat-model-data.tsx'), new RegExp(`value:\\s*["']${endpointIdPattern}["']`, 'g'));
const agentToolIds = () => uniqueMatches(read('src/lib/agent-tools.ts'), new RegExp(`["']${endpointIdPattern}["']`, 'g'));

const docsUnavailableOrInternal = [
  'endframe/minimax-hailuo-02',
  'fal-ai/metadata',
  'fal-ai/veed/lipsync',
];

describe('Fal model catalog consistency', () => {
  it('keeps every dropdown model in the canonical registry', () => {
    const registry = new Set(registryIds());
    const missing = dropdownIds().filter(id => !registry.has(id));

    expect(missing).toEqual([]);
  });

  it('keeps every Director tool model exposed in the dropdown catalog', () => {
    const dropdown = new Set(dropdownIds());
    const toolOnly = agentToolIds().filter(id => !dropdown.has(id));

    expect(toolOnly).toEqual([]);
  });

  it('does not expose docs-unavailable/internal endpoints in public model pickers', () => {
    const publicIds = new Set([...dropdownIds(), ...agentToolIds()]);

    expect(docsUnavailableOrInternal.filter(id => publicIds.has(id))).toEqual([]);
  });

  it('can derive exact Fal docs URLs for public models', () => {
    const sample = 'xai/grok-imagine-video/v1.5/image-to-video';

    expect(dropdownIds()).toContain(sample);
    expect(getFalModelDocsUrl(sample)).toBe(`https://fal.ai/models/${sample}`);
    expect(getFalModelLlmsUrl(sample)).toBe(`https://fal.ai/models/${sample}/llms.txt`);
  });
});
