import { NextRequest, NextResponse } from 'next/server';
import { EndFrameRequest, EndFrameResponse } from '@/types/endframe';

// Helper function to create data URI from base64
function createDataUri(base64Data: string): string {
  return `data:image/jpeg;base64,${base64Data}`;
}

// Helper function to validate image aspect ratio for Minimax API
function validateImageAspectRatio(base64Data: string): { isValid: boolean; message?: string } {
  try {
    console.log('🔍 Validating image aspect ratio for Minimax API...');
    // Minimax typically requires images with reasonable aspect ratios
    // Common video aspect ratios: 16:9, 4:3, 1:1, 9:16
    // We'll let Minimax handle the validation and provide better error messages
    return { isValid: true };
  } catch (error) {
    console.warn('⚠️ Image validation failed:', error);
    return { isValid: false, message: 'Image validation failed' };
  }
}

// POST endpoint to generate end frames
export async function POST(request: NextRequest) {
  console.log('🚀 API Route: /api/endframe - EndFrame generation request received');
  
  try {
    console.log('📝 Parsing request body...');
    const body: EndFrameRequest = await request.json();
    console.log('✅ Request body parsed successfully');

    // Validate required fields
    if (!body.firstImage) {
      console.error('❌ Missing firstImage (start frame)');
      return NextResponse.json({
        success: false,
        error: 'First image (start frame) is required',
        retryable: false
      } as EndFrameResponse, { status: 400 });
    }

    if (!body.secondImage) {
      console.error('❌ Missing secondImage (end frame)');
      return NextResponse.json({
        success: false,
        error: 'Second image (end frame) is required',
        retryable: false
      } as EndFrameResponse, { status: 400 });
    }

    if (!body.prompt) {
      console.error('❌ Missing prompt');
      return NextResponse.json({
        success: false,
        error: 'Prompt is required to describe the transition',
        retryable: false
      } as EndFrameResponse, { status: 400 });
    }

    console.log('🔍 Validating images...');
    const firstImageValidation = validateImageAspectRatio(body.firstImage);
    const secondImageValidation = validateImageAspectRatio(body.secondImage);

    if (!firstImageValidation.isValid) {
      console.error('❌ First image validation failed:', firstImageValidation.message);
      return NextResponse.json({
        success: false,
        error: `First image validation failed: ${firstImageValidation.message}`,
        retryable: false
      } as EndFrameResponse, { status: 400 });
    }

    if (!secondImageValidation.isValid) {
      console.error('❌ Second image validation failed:', secondImageValidation.message);
      return NextResponse.json({
        success: false,
        error: `Second image validation failed: ${secondImageValidation.message}`,
        retryable: false
      } as EndFrameResponse, { status: 400 });
    }

    console.log('✅ Image validation passed');

    // Create data URIs for the images
    const firstImageUri = createDataUri(body.firstImage);
    const secondImageUri = createDataUri(body.secondImage);

    console.log('🔄 Preparing request for Minimax EndFrame API...');
    console.log('📝 Prompt:', body.prompt);

    // Make request to Minimax EndFrame API via FAL.ai
    console.log('🔄 Making request to Minimax EndFrame API via FAL.ai...');
    
    // Use FAL.ai's Minimax Video-01 endpoint which supports frame-to-frame generation
    const falRequestBody = {
      first_frame_image: firstImageUri,
      last_frame_image: secondImageUri,
      prompt: body.prompt
    };

    console.log('📤 Request payload:', {
      prompt: falRequestBody.prompt,
      hasFirstFrame: !!falRequestBody.first_frame_image,
      hasLastFrame: !!falRequestBody.last_frame_image
    });

    // Use FAL.ai client to call Minimax Video-01 with frame-to-frame
    const { fal } = await import('@fal-ai/client');
    
    console.log('🔄 Calling FAL.ai Minimax Video-01 with frame-to-frame...');
    const minimaxResponse = await fal.subscribe('fal-ai/minimax/video-01', {
      input: falRequestBody,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('⏳ Minimax generation in progress...');
        }
      }
    });

    console.log('✅ Minimax generation completed via FAL.ai');
    console.log('📦 Response data:', minimaxResponse.data);

    // FAL.ai response format: minimaxResponse.data contains the video object
    const videoData = minimaxResponse.data;
    
    // Check if the response contains a video URL
    if (videoData && videoData.video && videoData.video.url) {
      console.log('🎬 Video URL received from Minimax:', videoData.video.url);
      
      return NextResponse.json({
        success: true,
        videoUrl: videoData.video.url,
        status: 'completed'
      } as EndFrameResponse);
    } else {
      console.error('❌ No video URL in Minimax response:', videoData);
      return NextResponse.json({
        success: false,
        error: 'EndFrame generation completed but no video was returned',
        retryable: true
      } as EndFrameResponse, { status: 500 });
    }

  } catch (error) {
    console.error('💥 Error in endframe API:', error);
    
    let errorMessage = 'An unexpected error occurred while generating the end frame.';
    let statusCode = 500;
    let retryable = true;

    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Handle specific error types
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error while communicating with Minimax API. Please check your connection and try again.';
        retryable = true;
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid response from Minimax API. Please try again.';
        retryable = true;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. The service may be busy. Please try again.';
        retryable = true;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      retryable: retryable,
      details: error instanceof Error ? error.message : 'Unknown error'
    } as EndFrameResponse, { status: statusCode });
  }
}

// GET endpoint to check task status (for async operations)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({
      success: false,
      error: 'Task ID is required'
    } as EndFrameResponse, { status: 400 });
  }

  // For now, we'll return a simple response since Minimax sync API doesn't use async tasks
  // In the future, if you switch to async API, you can implement proper task polling here
  return NextResponse.json({
    success: false,
    error: 'Task polling not implemented for sync API'
  } as EndFrameResponse, { status: 501 });
}
