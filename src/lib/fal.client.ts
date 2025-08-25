import { createFalClient, type FalClientRequest } from '@fal-ai/client';

// Client-side FAL configuration
export const falClient = createFalClient({
  // Use relative path for proxy URL to ensure it works in all environments
  proxyUrl: process.env.NEXT_PUBLIC_FAL_PROXY_URL || '/api/fal',
  // Don't include credentials on the client side since we're using a proxy
  requestMiddleware: (request: FalClientRequest) => {
    // Add any custom headers or modifications here
    return request;
  }
});

// Re-export endpoint types and IDs
export type { FalEndpointId } from './fal.server';
export { FAL_ENDPOINTS } from './fal.server';

// Error handling types
export interface FalError extends Error {
  status?: number;
  code?: string;
}

// Helper function to handle FAL API errors
export function handleFalError(error: unknown): FalError {
  if (error instanceof Error) {
    return error as FalError;
  }
  return new Error('An unknown error occurred with the FAL API');
} 