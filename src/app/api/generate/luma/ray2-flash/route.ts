import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎬 [Luma Ray2 Flash API] Starting generation request');
    
    const { 
      prompt, 
      image_url, 
      end_image_url, 
      aspect_ratio, 
      duration, 
      resolution, 
      loop 
    } = await request.json();

    console.log('📋 [Luma Ray2 Flash API] Request parameters:', {
      prompt: prompt?.substring(0, 100) + '...',
      image_url: image_url ? 'provided' : 'missing',
      end_image_url: end_image_url ? 'provided' : 'not provided',
      aspect_ratio,
      duration,
      resolution,
      loop
    });

    // Validate required parameters
    if (!prompt) {
      console.error('❌ [Luma Ray2 Flash API] Missing prompt');
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    if (!image_url) {
      console.error('❌ [Luma Ray2 Flash API] Missing image_url');
      return NextResponse.json({ 
        success: false, 
        error: 'Image URL is required for image-to-video generation' 
      }, { status: 400 });
    }

    // Construct the input object
    const input: any = {
      prompt: prompt.trim(),
      image_url: image_url,
      aspect_ratio: aspect_ratio || '16:9',
      duration: duration || '5s',
      resolution: resolution || '540p',
      loop: loop || false,
    };

    // Add end image if provided
    if (end_image_url) {
      input.end_image_url = end_image_url;
    }

    console.log('🎯 [Luma Ray2 Flash API] Final input:', input);

    // Call the FAL API
    console.log('📡 [Luma Ray2 Flash API] Calling FAL API...');
    const result = await fal.subscribe("fal-ai/luma-dream-machine/ray-2-flash/image-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [Luma Ray2 Flash API] Queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach((message: string) => {
            console.log('📝 [Luma Ray2 Flash API] Log:', message);
          });
        }
      },
    });

    console.log('✅ [Luma Ray2 Flash API] Generation completed successfully');
    console.log('📦 [Luma Ray2 Flash API] Result data:', {
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
    console.error('❌ [Luma Ray2 Flash API] Generation error:', error);
    
    // Extract error message
    let errorMessage = 'Failed to generate video with Luma Ray 2 Flash';
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
