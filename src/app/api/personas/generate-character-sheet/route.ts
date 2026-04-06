import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

// nano-banana-pro/edit supports max 4 output images per call
const MAX_IMAGES_PER_CALL = 4;

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { personaId, referenceImages, personaName } = await request.json();

    if (!personaId || !referenceImages || referenceImages.length === 0) {
      return NextResponse.json({ error: 'Missing persona ID or reference images' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 });
    }

    const imageCount = referenceImages.length;
    console.log(`🎨 [CHARACTER SHEET] Starting for "${personaName || personaId}" — ${imageCount} reference image(s)`);

    // Upload all reference images to fal.ai storage
    const imageUrls: string[] = [];
    for (let i = 0; i < imageCount; i++) {
      const url = await uploadDataUrl(referenceImages[i], i);
      imageUrls.push(url);
      console.log(`✅ [CHARACTER SHEET] Uploaded ${i + 1}/${imageCount}`);
    }

    // Build a character-specific prompt
    const characterName = personaName || 'this character';
    const prompt = [
      `Professional character reference sheet for ${characterName}.`,
      `Using the provided reference photos, generate consistent character portraits`,
      `showing the SAME person in different poses, angles, and expressions.`,
      `Maintain exact facial features, skin tone, hair color, and body proportions across all outputs.`,
      `Clean neutral background, studio lighting, high detail, photorealistic.`,
    ].join(' ');

    // Clamp num_images to model limit
    const numImages = Math.min(MAX_IMAGES_PER_CALL, 4);

    console.log(`🤖 [CHARACTER SHEET] Calling nano-banana-pro/edit — ${numImages} outputs requested`);

    // Primary: nano-banana-pro/edit
    try {
      const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
        input: {
          prompt,
          image_urls: imageUrls,
          num_images: numImages,
          aspect_ratio: '3:4',
          output_format: 'png',
          resolution: '2K',
        },
        logs: true,
        onQueueUpdate: (update: { status: string; logs: Array<{ message: string }> }) => {
          if (update.status === 'IN_PROGRESS') {
            update.logs.map((log: { message: string }) => log.message).forEach(console.log);
          }
        },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [CHARACTER SHEET] Complete in ${duration}ms — ${result.data.images?.length || 0} images`);

      return NextResponse.json({
        success: true,
        requestId: result.requestId,
        images: result.data.images,
        model: 'fal-ai/nano-banana-pro/edit',
        duration,
      });
    } catch (primaryError: any) {
      // Fallback: Seedream v4 Edit if nano-banana fails (content policy, 422, etc.)
      const status = primaryError.status || 0;
      const isRecoverable = status === 422 || status === 400 ||
        (primaryError.body?.detail && JSON.stringify(primaryError.body.detail).includes('could not generate'));

      if (!isRecoverable) throw primaryError;

      console.log(`🔄 [CHARACTER SHEET] nano-banana-pro failed (${status}), falling back to Seedream v4 Edit...`);

      const fallbackResult = await fal.subscribe('fal-ai/bytedance/seedream/v4/edit', {
        input: {
          prompt,
          image_urls: imageUrls,
          num_images: numImages,
          image_size: { width: 768, height: 1024 }, // 3:4 equivalent
          output_format: 'png',
        },
        logs: true,
        onQueueUpdate: (update: { status: string; logs: Array<{ message: string }> }) => {
          if (update.status === 'IN_PROGRESS') {
            update.logs.map((log: { message: string }) => log.message).forEach(console.log);
          }
        },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [CHARACTER SHEET] Seedream fallback complete in ${duration}ms`);

      return NextResponse.json({
        success: true,
        requestId: fallbackResult.requestId,
        images: fallbackResult.data.images,
        model: 'fal-ai/bytedance/seedream/v4/edit',
        fallbackUsed: true,
        duration,
      });
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [CHARACTER SHEET] Failed after ${duration}ms:`, error.message || error);
    return NextResponse.json(
      {
        error: 'Failed to generate character sheet',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: error.status || 500 }
    );
  }
}

