import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure FAL client with API key
fal.config({
  credentials: process.env.FAL_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      seed,
      sync_mode = false,
      num_images = 1,
      enable_safety_checker = true,
      output_format = 'jpeg',
      safety_tolerance = '2',
      enhance_prompt = false,
      aspect_ratio = '16:9',
      raw = false,
    } = body;

    console.log('🚀 [Flux Pro API] Request received:', {
      prompt: prompt?.substring(0, 100) + '...',
      seed,
      sync_mode,
      num_images,
      enable_safety_checker,
      output_format,
      safety_tolerance,
      enhance_prompt,
      aspect_ratio,
      raw,
    });

    // Validate required parameters
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare input parameters
    const input = {
      prompt: prompt.trim(),
      seed,
      sync_mode,
      num_images,
      enable_safety_checker,
      output_format,
      safety_tolerance,
      enhance_prompt,
      aspect_ratio,
      raw,
    };

    console.log('📋 [Flux Pro API] Calling FAL API with parameters:', input);

    // Call FAL API using the new client structure
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ [Flux Pro API] Generation completed successfully');
    console.log('📊 [Flux Pro API] Result data:', result.data);
    console.log('🆔 [Flux Pro API] Request ID:', result.requestId);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
    });

  } catch (error: any) {
    console.error('❌ [Flux Pro API] Error:', error);
    
    // Handle specific FAL API errors
    if (error.message?.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your FAL API key.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate image',
        success: false 
      },
      { status: 500 }
    );
  }
}
