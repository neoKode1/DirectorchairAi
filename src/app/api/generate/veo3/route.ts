import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 [Veo3 API] Request received');
    
    // Check if FAL_KEY is available
    if (!process.env.FAL_KEY) {
      console.error('❌ [Veo3 API] FAL_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'FAL_KEY environment variable is not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log('📝 [Veo3 API] Request body:', body);

    const {
      model,
      prompt,
      negative_prompt,
      image_url,
      aspect_ratio = "16:9",
      duration = "8s",
      resolution = "720p",
      enhance_prompt = true,
      auto_fix = true,
      generate_audio = true,
      seed,
    } = body;

    if (!prompt) {
      console.log('❌ [Veo3 API] Missing prompt');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare the input for Veo3
    const input: any = {
      prompt: prompt.trim(),
      aspect_ratio,
      duration,
      resolution,
      enhance_prompt,
      auto_fix,
      generate_audio,
    };

    // Add image URL if provided
    if (image_url?.trim()) {
      input.image_url = image_url.trim();
    }

    // Add optional parameters
    if (negative_prompt?.trim()) {
      input.negative_prompt = negative_prompt.trim();
    }
    
    if (seed !== undefined && seed !== null) {
      input.seed = seed;
    }

    console.log('🚀 [Veo3 API] Calling fal.ai with input:', input);
    console.log('🔑 [Veo3 API] FAL_KEY available:', !!process.env.FAL_KEY);
    console.log('🎬 [Veo3 API] Model requested:', model);

    // Determine the correct Veo3 endpoint based on the model
    let veo3Endpoint = "fal-ai/veo3/image-to-video";
    
    if (model?.includes('fast')) {
      veo3Endpoint = "fal-ai/veo3/fast";
    } else if (model?.includes('standard')) {
      veo3Endpoint = "fal-ai/veo3/standard";
    }

    console.log('🎬 [Veo3 API] Using Veo3 endpoint:', veo3Endpoint);

    // Call the Veo3 API
    const result = await fal.subscribe(veo3Endpoint, {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [Veo3 API] Queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach(console.log);
        }
      },
    }).catch((error: any) => {
      console.error('❌ [Veo3 API] FAL subscribe error:', error);
      console.error('❌ [Veo3 API] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    });

    console.log('✅ [Veo3 API] Generation completed');
    console.log('📦 [Veo3 API] Result:', result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      model: 'Google Veo3 Fast',
      parameters: input,
    });

  } catch (error: any) {
    console.error('❌ [Veo3 API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate video',
        details: error.message || 'Unknown error occurred',
        model: 'Google Veo3 Fast'
      },
      { status: 500 }
    );
  }
}
