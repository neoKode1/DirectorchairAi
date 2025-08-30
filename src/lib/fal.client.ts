import { fal } from '@fal-ai/client';

// Environment-aware configuration function
function configureFalClient() {
  // Only run on client side
  if (typeof window !== 'undefined') {
    fal.config({
      proxyUrl: '/api/fal/proxy'
    });
  }
}

// Initialize configuration
configureFalClient();

// Export the configured client for compatibility
export const falClient = fal;

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