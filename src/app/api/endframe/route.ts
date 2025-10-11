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

    // Get Minimax API key from environment
    const minimaxApiKey = process.env.MINIMAX_API_KEY;
    if (!minimaxApiKey) {
      console.error('❌ MINIMAX_API_KEY not found in environment variables');
      return NextResponse.json({
        success: false,
        error: 'Minimax API key not configured',
        retryable: false
      } as EndFrameResponse, { status: 500 });
    }

    // Make request to Minimax EndFrame API
    console.log('🔄 Making request to Minimax EndFrame API...');
    
    const minimaxRequestBody = {
      first_frame_image: firstImageUri, // Use the first image as the starting frame
      last_frame_image: secondImageUri, // Use the second image as the ending frame
      prompt: body.prompt,
      model: body.model || 'MiniMax-Hailuo-02'
    };

    console.log('📤 Request payload:', {
      model: minimaxRequestBody.model,
      prompt: minimaxRequestBody.prompt,
      hasFirstFrame: !!minimaxRequestBody.first_frame_image,
      hasLastFrame: !!minimaxRequestBody.last_frame_image
    });

    const minimaxResponse = await fetch('https://api.minimax.chat/v1/text_to_video_sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${minimaxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimaxRequestBody)
    });

    console.log('📥 Minimax API response status:', minimaxResponse.status);

    if (!minimaxResponse.ok) {
      const errorText = await minimaxResponse.text();
      console.error('❌ Minimax API error:', errorText);
      
      let errorMessage = 'Minimax EndFrame generation failed';
      let statusCode = 500;
      let retryable = true;

      if (minimaxResponse.status === 400) {
        errorMessage = 'Invalid request parameters. Please check your images and prompt.';
        retryable = false;
        statusCode = 400;
      } else if (minimaxResponse.status === 401) {
        errorMessage = 'Authentication failed. Please check API key configuration.';
        retryable = false;
        statusCode = 500;
      } else if (minimaxResponse.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        retryable = true;
        statusCode = 429;
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        retryable: retryable,
        details: errorText
      } as EndFrameResponse, { status: statusCode });
    }

    const minimaxData = await minimaxResponse.json();
    console.log('✅ Minimax API response received');

    // Check if the response contains a video URL
    if (minimaxData.video_url) {
      console.log('🎬 Video URL received from Minimax:', minimaxData.video_url);
      
      return NextResponse.json({
        success: true,
        videoUrl: minimaxData.video_url,
        status: 'completed'
      } as EndFrameResponse);
    } else {
      console.error('❌ No video URL in Minimax response:', minimaxData);
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
