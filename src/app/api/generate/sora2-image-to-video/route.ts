import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Sora 2 Image-to-Video API Route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      image_url, 
      resolution = "auto", 
      aspect_ratio = "auto", 
      duration = 4,
      api_key 
    } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!image_url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate duration
    const validDurations = [4, 8, 12];
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: 'Duration must be 4, 8, or 12 seconds' },
        { status: 400 }
      );
    }

    // Validate resolution
    const validResolutions = ["auto", "720p"];
    if (!validResolutions.includes(resolution)) {
      return NextResponse.json(
        { error: 'Resolution must be "auto" or "720p"' },
        { status: 400 }
      );
    }

    // Validate aspect ratio
    const validAspectRatios = ["auto", "9:16", "16:9"];
    if (!validAspectRatios.includes(aspect_ratio)) {
      return NextResponse.json(
        { error: 'Aspect ratio must be "auto", "9:16", or "16:9"' },
        { status: 400 }
      );
    }

    console.log('🎬 [Sora 2 I2V] Starting generation:', {
      prompt: prompt.substring(0, 100) + '...',
      image_url: image_url.substring(0, 50) + '...',
      resolution,
      aspect_ratio,
      duration
    });

    // Prepare input for Sora 2
    const input = {
      prompt,
      image_url,
      resolution,
      aspect_ratio,
      duration,
      ...(api_key && { api_key })
    };

    // Submit request to Sora 2
    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          console.log('🎬 [Sora 2 I2V] Progress:', update.logs?.map((log: any) => log.message).join('\n'));
        }
      },
    });

    console.log('✅ [Sora 2 I2V] Generation completed:', {
      requestId: result.requestId,
      videoUrl: result.data.video?.url
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      model: 'fal-ai/sora-2/image-to-video'
    });

  } catch (error: any) {
    console.error('❌ [Sora 2 I2V] Error:', error);

    // Handle specific FAL API errors
    if (error.status === 422) {
      return NextResponse.json({
        success: false,
        error: 'Content policy violation',
        message: 'The prompt or image violates content policies. Please try with different content.',
        details: error.body?.detail || error.message
      }, { status: 422 });
    }

    if (error.status === 400) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'The request parameters are invalid. Please check your input.',
        details: error.body?.detail || error.message
      }, { status: 400 });
    }

    if (error.status === 429) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait a moment and try again.',
        details: error.body?.detail || error.message
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: 'Generation failed',
      message: error.message || 'An unexpected error occurred during video generation.',
      details: error.body?.detail || error.message
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
