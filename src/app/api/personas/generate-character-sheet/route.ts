import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { personaId, referenceImages } = await request.json();

    if (!personaId || !referenceImages || referenceImages.length === 0) {
      return NextResponse.json({ error: 'Missing persona ID or reference images' }, { status: 400 });
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 });
    }

    console.log('🎨 [CHARACTER SHEET] Starting generation for persona:', personaId);
    console.log('📸 [CHARACTER SHEET] Reference images:', referenceImages.length);

    // Upload reference images to fal.ai storage
    const imageUrls: string[] = [];

    for (let i = 0; i < referenceImages.length; i++) {
      const dataUrl = referenceImages[i];

      // Convert data URL to blob
      const base64Data = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].split(':')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let j = 0; j < byteCharacters.length; j++) {
        byteNumbers[j] = byteCharacters.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const file = new File([blob], `reference_${i}.jpg`, { type: mimeType });

      // Upload to fal.ai
      const url = await fal.storage.upload(file);
      imageUrls.push(url);
      console.log(`✅ [CHARACTER SHEET] Uploaded image ${i + 1}/${referenceImages.length}`);
    }

    console.log('🤖 [CHARACTER SHEET] Calling fal.ai nano-banana-pro/edit...');

    // Generate character sheet using fal.ai
    const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
      input: {
        prompt:
          'professional character reference sheet, multiple poses and expressions, neutral background, high quality, detailed, consistent character design',
        image_urls: imageUrls,
        num_images: 8,
        aspect_ratio: '1:1',
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

    console.log('✅ [CHARACTER SHEET] Generation complete!');

    return NextResponse.json({
      success: true,
      requestId: result.requestId,
      images: result.data.images,
    });
  } catch (error) {
    console.error('❌ [CHARACTER SHEET] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate character sheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

