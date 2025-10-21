// This file should only be imported by server components/routes
import { fal } from '@fal-ai/client';

// Only validate FAL_KEY at runtime, not during build
const getFalClient = () => {
  if (!process.env.FAL_KEY) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment
      ? 'FAL_KEY is not set in environment variables. Please set it in your .env.local file for development.'
      : 'FAL_KEY is not set in environment variables. Please configure it in your production environment.';
    
    console.warn(`⚠️ [FAL Server] ${errorMessage}`);
    
    // In production, throw error. In development, allow with warning
    if (!isDevelopment) {
      throw new Error(errorMessage);
    }
  }

  // Configure the FAL client with credentials - this should only happen server-side
  fal.config({
    credentials: process.env.FAL_KEY,
  });

  return fal;
};

// Server-side only configuration for FAL endpoints
export const FAL_ENDPOINTS = {
  // FLUX Models

  "flux-pro": "fal-ai/flux/pro/1.1", // Professional Flux model 1.1
  "flux-pro-ultra": "fal-ai/flux/pro/1.1/ultra", // Professional Flux model 1.1 Ultra
  
  // Video Generation Models
  "minimax-i2v": "fal-ai/minimax/video-01-live/image-to-video", // Image to Video
  "minimax-t2v": "fal-ai/minimax/video-01-live/text-to-video", // Text to Video
  "minimax-subject": "fal-ai/minimax/video-01-subject-reference", // Subject-aware video
  "kling-pro": "fal-ai/kling-video/v1.6/pro/image-to-video", // Kling 1.6 Pro
  "pixverse-i2v": "fal-ai/pixverse/v3.5-fast/image-to-video", // Pixverse Fast I2V
  "pixverse-t2v": "fal-ai/pixverse/v3.5/text-to-video", // Pixverse T2V
  "ray2": "fal-ai/ray2", // Ray2 model
  "hunyuan": "fal-ai/hunyuan-video", // Hunyuan video model
  
  // Training Models
  "flux-lora-fast": "fal-ai/flux-lora-fast-training", // Fast Flux LoRA training
  "hunyuan-lora": "fal-ai/hunyuan-video-lora-training", // Hunyuan LoRA training
  
  // Audio and Speech Models
  "mmaudio-v2": "fal-ai/mmaudio-v2", // MM Audio model v2
  "mmaudio-t2a": "fal-ai/mmaudio-v2/text-to-audio", // Text to Audio
  "lipsync": "fal-ai/sync-lipsync", // Lipsync model
  
  // Utility Models
  "ffmpeg": "fal-ai/ffmpeg", // FFmpeg utilities
  "metadata": "fal-ai/metadata" // Media metadata extraction
} as const;

// Type for endpoint IDs
export type FalEndpointId = keyof typeof FAL_ENDPOINTS;

// Get the full endpoint ID for a given short ID
export function getFalEndpointId(shortId: FalEndpointId): string {
  return FAL_ENDPOINTS[shortId];
}

// Helper function to run a model - server-side only
export async function runModel(modelId: FalEndpointId, input: any) {
  const falClient = getFalClient();
  const endpoint = getFalEndpointId(modelId);
  return await falClient.run(endpoint, input);
}

// Helper function to subscribe to a model - server-side only
export async function subscribeToModel(modelId: FalEndpointId, options: any) {
  const falClient = getFalClient();
  const endpoint = getFalEndpointId(modelId);
  return await falClient.subscribe(endpoint, options);
}

// Export the fal client getter instead of the configured instance
export { getFalClient as fal }; 