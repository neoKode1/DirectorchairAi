import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎬 [Minimax Hailuo 02 API] Starting generation request');
    
    const { 
      text, // API expects 'text' parameter
      image_url, 
      duration, 
      prompt_optimizer, 
      resolution 
    } = await request.json();

    console.log('📋 [Minimax Hailuo 02 API] Request parameters:', {
      text: text ? text.substring(0, 100) + '...' : 'undefined',
      image_url: image_url ? 'provided' : 'missing',
      duration,
      prompt_optimizer,
      resolution
    });
    
    // Log the full request body for debugging
    console.log('📋 [Minimax Hailuo 02 API] Full request body:', JSON.stringify({
      text,
      image_url,
      duration,
      prompt_optimizer,
      resolution
    }, null, 2));

    // Validate required parameters
    if (!text) {
      console.error('❌ [Minimax Hailuo 02 API] Missing text');
      return NextResponse.json({ 
        success: false, 
        error: 'Text is required' 
      }, { status: 400 });
    }

    if (!image_url) {
      console.error('❌ [Minimax Hailuo 02 API] Missing image_url');
      return NextResponse.json({ 
        success: false, 
        error: 'Image URL is required for image-to-video generation' 
      }, { status: 400 });
    }

    // Validate duration and resolution compatibility
    if (duration === '10' && resolution === '1080P') {
      console.error('❌ [Minimax Hailuo 02 API] 10s videos not supported for 1080p resolution');
      return NextResponse.json({ 
        success: false, 
        error: '10 second videos are not supported for 1080p resolution. Please use 768P or 512P instead.' 
      }, { status: 400 });
    }

    // Construct the input object
    const input: any = {
      prompt: text.trim(), // ✅ Fixed: FAL API expects 'prompt' parameter, not 'text'
      image_url: image_url,
      duration: duration || "6",
      prompt_optimizer: prompt_optimizer !== undefined ? prompt_optimizer : true,
      resolution: resolution || "768P",
    };

    console.log('🎯 [Minimax Hailuo 02 API] Final input:', input);

    // Call the FAL API
    console.log('📡 [Minimax Hailuo 02 API] Calling FAL API...');
    const result = await fal.subscribe("fal-ai/minimax/hailuo-02/standard/image-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [Minimax Hailuo 02 API] Queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach((message: string) => {
            console.log('📝 [Minimax Hailuo 02 API] Log:', message);
          });
        }
      },
    });

    console.log('✅ [Minimax Hailuo 02 API] Generation completed successfully');
    console.log('📦 [Minimax Hailuo 02 API] Result data:', {
      hasVideo: !!result.data?.video,
      videoUrl: result.data?.video?.url ? 'provided' : 'missing',
      requestId: result.requestId
    });

    return NextResponse.json({ 
      success: true, 
      data: result.data, 
      requestId: result.requestId 
    });

  } catch (error: any) {
    console.error('❌ [Minimax Hailuo 02 API] Generation error:', error);
    
    // Extract detailed error information
    let errorMessage = 'Failed to generate video with Minimax Hailuo 02';
    let errorDetails = null;
    
    if (error.status === 422) {
      console.error('❌ [Minimax Hailuo 02 API] Validation error details:', error.body);
      errorMessage = 'Validation error: Invalid parameters provided';
      errorDetails = error.body;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Log the full error object for debugging
    console.error('❌ [Minimax Hailuo 02 API] Full error object:', JSON.stringify(error, null, 2));

    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      details: errorDetails,
      status: error.status || 500
    }, { status: error.status || 500 });
  }
}
