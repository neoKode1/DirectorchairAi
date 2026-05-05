import { NextRequest, NextResponse } from 'next/server';
import { createFalClient } from '@fal-ai/client';
import { applyRateLimit } from '@/lib/rate-limit';
import { createRequestLogger, logger } from '@/lib/logger';
import { PRIMARY_MODEL, FALLBACK_MODEL } from '@/lib/persona-models';

const log = logger.child({ route: '/api/personas/character-sheet' });

// Submit only — actual generation is polled via /api/personas/character-sheet-status.
// 60s is plenty for parallel storage uploads + queue.submit; the long-running fal job
// runs out-of-band on fal's infrastructure and is not gated by this function's lifetime.
export const maxDuration = 60;

// Create a dedicated server-side fal client (avoids singleton proxyUrl contamination)
const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

// nano-banana-pro/edit: up to 10 input reference images, max 4 output images per call
const MAX_OUTPUT_IMAGES = 4;
const MAX_INPUT_IMAGES = 10;

/**
 * Convert a base64 data URL to a File and upload to fal.ai storage.
 */
async function uploadDataUrl(dataUrl: string, index: number): Promise<string> {
  // If already a URL (not base64), return as-is
  if (!dataUrl.startsWith('data:')) return dataUrl;

  const base64Data = dataUrl.split(',')[1];
  const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
  const byteCharacters = atob(base64Data);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let j = 0; j < byteCharacters.length; j++) {
    byteArray[j] = byteCharacters.charCodeAt(j);
  }
  const blob = new Blob([byteArray], { type: mimeType });
  const file = new File([blob], `reference_${index}.jpg`, { type: mimeType });
  return fal.storage.upload(file);
}

function isRecoverableError(err: any): boolean {
  const status = err?.status || 0;
  if (status === 422 || status === 400) return true;
  const detail = err?.body?.detail;
  return !!(detail && JSON.stringify(detail).includes('could not generate'));
}

export async function POST(request: NextRequest) {
  const rateLimited = await applyRateLimit(request, 'generate');
  if (rateLimited) return rateLimited;

  const startTime = Date.now();
  try {
    const { personaId, referenceImages, personaName, useFallback } = await request.json();

    if (!personaId || !referenceImages || referenceImages.length === 0) {
      return NextResponse.json({ error: 'Missing persona ID or reference images' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 });
    }

    // Clamp input images to model limit (10 max)
    const clampedImages: string[] = referenceImages.slice(0, MAX_INPUT_IMAGES);
    const imageCount = clampedImages.length;
    log.debug({ personaId, personaName, imageCount, useFallback: !!useFallback }, 'Submitting character sheet job');

    // Parallel upload of reference images to fal.ai storage
    const imageUrls = await Promise.all(
      clampedImages.map((img, i) => uploadDataUrl(img, i))
    );

    // Build a character-specific prompt
    const characterName = personaName || 'this character';
    const prompt = [
      `Professional character reference sheet for ${characterName}.`,
      `Using the provided reference photos, generate consistent character portraits`,
      `showing the SAME person in different poses, angles, and expressions.`,
      `Maintain exact facial features, skin tone, hair color, and body proportions across all outputs.`,
      `Clean neutral background, studio lighting, high detail, photorealistic.`,
    ].join(' ');

    const numImages = MAX_OUTPUT_IMAGES;
    const model = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
    const input = useFallback
      ? {
          prompt,
          image_urls: imageUrls,
          num_images: numImages,
          image_size: { width: 768, height: 1024 }, // 3:4 equivalent
          output_format: 'png',
        }
      : {
          prompt,
          image_urls: imageUrls,
          num_images: numImages,
          aspect_ratio: '3:4',
          output_format: 'png',
          resolution: '2K',
          safety_tolerance: '4',
        };

    const submitResult = await fal.queue.submit(model, { input: input as any });
    const duration = Date.now() - startTime;
    log.info({ requestId: submitResult.request_id, model, duration }, 'Character sheet job queued');

    return NextResponse.json({
      success: true,
      requestId: submitResult.request_id,
      model,
      status: 'IN_QUEUE',
      fallbackUsed: !!useFallback,
      duration,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const status = error?.status || 0;
    const recoverable = isRecoverableError(error);
    log.error({ duration, status, err: error?.message || error }, 'Character sheet submit failed');
    return NextResponse.json(
      {
        error: 'Failed to submit character sheet generation',
        details: error instanceof Error ? error.message : 'Unknown error',
        recoverable,
        duration,
      },
      { status: status || 500 }
    );
  }
}

