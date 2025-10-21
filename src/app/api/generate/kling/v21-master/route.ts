import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎬 [Kling v2.1 Master API] Starting generation request');
    
    const { 
      prompt, 
      image_url, 
      duration, 
      negative_prompt, 
      cfg_scale 
    } = await request.json();

    console.log('📋 [Kling v2.1 Master API] Request parameters:', {
      prompt: prompt?.substring(0, 100) + '...',
      image_url: image_url ? 'provided' : 'missing',
      duration,
      negative_prompt: negative_prompt?.substring(0, 50) + '...',
      cfg_scale
    });

    // Validate required parameters
    if (!prompt) {
      console.error('❌ [Kling v2.1 Master API] Missing prompt');
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    if (!image_url) {
      console.error('❌ [Kling v2.1 Master API] Missing image_url');
      return NextResponse.json({ 
        success: false, 
        error: 'Image URL is required for image-to-video generation' 
      }, { status: 400 });
    }

    // Construct the input object
    const input: any = {
      prompt: prompt.trim(),
      image_url: image_url,
      duration: duration || "5",
      negative_prompt: negative_prompt || "blur, distort, and low quality",
      cfg_scale: cfg_scale || 0.5,
    };

    console.log('🎯 [Kling v2.1 Master API] Final input:', input);

    // Call the FAL API
    console.log('📡 [Kling v2.1 Master API] Calling FAL API...');
    const result = await fal.subscribe("fal-ai/kling-video/v2.1/master/image-to-video", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [Kling v2.1 Master API] Queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach((message: string) => {
            console.log('📝 [Kling v2.1 Master API] Log:', message);
          });
        }
      },
    });

    console.log('✅ [Kling v2.1 Master API] Generation completed successfully');
    console.log('📦 [Kling v2.1 Master API] Result data:', {
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
    console.error('❌ [Kling v2.1 Master API] Generation error:', error);
    
    // Extract error message
    let errorMessage = 'Failed to generate video with Kling v2.1 Master';
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
