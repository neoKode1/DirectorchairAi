export const FAL_DOCUMENTATION_URL = 'https://fal.ai/docs/documentation';
export const FAL_MODEL_API_REFERENCE_URL = 'https://fal.ai/docs/model-api-reference';

export function normalizeFalEndpointId(endpointId: string): string {
  return endpointId.trim().replace(/^\/+|\/+$/g, '');
}

export function getFalModelDocsUrl(endpointId: string): string {
  return `https://fal.ai/models/${normalizeFalEndpointId(endpointId)}`;
}

export function getFalModelLlmsUrl(endpointId: string): string {
  return `${getFalModelDocsUrl(endpointId)}/llms.txt`;
}

export function getFalRunEndpointUrl(endpointId: string): string {
  return `https://fal.run/${normalizeFalEndpointId(endpointId)}`;
}