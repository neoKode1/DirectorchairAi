import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { filterSora2Content, generateSafeSora2Prompt as getSafeAlternatives, validateImageForSora2, getSora2ContentGuidance } from '@/lib/sora2-content-filter';

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

    // Validate image content
    const imageValidation = validateImageForSora2(image_url);
    if (!imageValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Image validation failed',
          issues: imageValidation.issues,
          guidance: getSora2ContentGuidance()
        },
        { status: 400 }
      );
    }

    // Skip pre-filtering for now - let Sora 2 handle content policy directly
    // This avoids false positives from overly aggressive filtering
    const finalPrompt = prompt;

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
      originalPrompt: prompt.substring(0, 100) + '...',
      finalPrompt: finalPrompt.substring(0, 100) + '...',
      image_url: image_url.substring(0, 50) + '...',
      resolution,
      aspect_ratio,
      duration,
      contentFiltered: false // No pre-filtering applied
    });

    // Prepare input for Sora 2
    const input = {
      prompt: finalPrompt,
      image_url,
      resolution,
      aspect_ratio,
      duration,
      ...(api_key && { api_key })
    };

    // Submit request to Sora 2 with timeout handling
    const result = await Promise.race([
      fal.subscribe("fal-ai/sora-2/image-to-video", {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          if (update.status === "IN_PROGRESS") {
            console.log('🎬 [Sora 2 I2V] Progress:', update.logs?.map((log: any) => log.message).join('\n'));
          }
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sora 2 generation timeout after 10 minutes')), 10 * 60 * 1000)
      )
    ]) as any;

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
      // Check if this is a content policy violation
      const isContentPolicyViolation = error.body?.detail && 
        (Array.isArray(error.body.detail) ? 
          error.body.detail.some((d: any) => 
            d.msg && (d.msg.includes('content policy') || 
                     d.msg.includes('flagged by a content checker') ||
                     d.msg.includes('content could not be processed'))
          ) :
          error.body.detail.includes('content policy'));

      if (isContentPolicyViolation) {
        // Generate safe alternatives for the user
        const safeAlternatives = [
          "A person walking through a beautiful landscape, with natural lighting and peaceful atmosphere",
          "Someone enjoying a hobby or activity in a well-lit, positive environment",
          "A character in a clean, modern setting with bright, natural lighting"
        ];
        
        return NextResponse.json({
          success: false,
          error: 'Content policy violation',
          message: 'The prompt or image violates Sora 2\'s content policies. Please try with different content.',
          details: error.body?.detail || error.message,
          safeAlternatives: safeAlternatives,
          guidance: getSora2ContentGuidance(),
          fallbackModels: [
            'fal-ai/kling-video/v2.1/master/image-to-video',
            'fal-ai/veo3/image-to-video',
            'fal-ai/minimax/hailuo-02/standard/image-to-video'
          ]
        }, { status: 422 });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Validation error',
          message: 'The request parameters are invalid. Please check your input.',
          details: error.body?.detail || error.message
        }, { status: 422 });
      }
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
