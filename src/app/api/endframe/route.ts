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
        error: 'Minimax API key not configured. Please add MINIMAX_API_KEY to your environment variables.',
        retryable: false
      } as EndFrameResponse, { status: 500 });
    }

    // Make request to Minimax video generation API
    console.log('🔄 Making request to Minimax video generation API...');
    
    // Build request body for Minimax MiniMax-Hailuo-02 model with first_frame_image and last_frame_image
    const minimaxRequestBody: {
      model: string;
      first_frame_image: string;
      last_frame_image: string;
      prompt?: string;
      duration: number;
      resolution: string;
    } = {
      model: 'MiniMax-Hailuo-02',
      first_frame_image: firstImageUri,
      last_frame_image: secondImageUri,
      duration: 6, // 6 seconds (6s or 10s supported for 768P)
      resolution: '768P' // 768P supports both first and last frame (6s and 10s)
    };

    // Add prompt if provided (optional when using both first and last frame)
    if (body.prompt && body.prompt.trim()) {
      minimaxRequestBody.prompt = body.prompt.trim();
    }

    console.log('📤 Request payload:', {
      model: minimaxRequestBody.model,
      prompt: minimaxRequestBody.prompt || '(auto-generated from frames)',
      hasFirstFrame: !!minimaxRequestBody.first_frame_image,
      hasLastFrame: !!minimaxRequestBody.last_frame_image,
      duration: minimaxRequestBody.duration,
      resolution: minimaxRequestBody.resolution
    });

    const minimaxResponse = await fetch('https://api.minimax.io/v1/video_generation', {
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

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
        }
      } catch (e) {
        // If error is not JSON, use text as is
        errorMessage = errorText || errorMessage;
      }

      if (minimaxResponse.status === 400) {
        errorMessage = `Invalid request: ${errorMessage}. Please check your images meet requirements (JPG/PNG/WebP, aspect ratio 2:5 to 5:2, shortest side > 300px, < 20MB).`;
        retryable = false;
        statusCode = 400;
      } else if (minimaxResponse.status === 401 || minimaxResponse.status === 403) {
        errorMessage = 'Authentication failed. Please check your MINIMAX_API_KEY configuration.';
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
        retryable: retryable
      } as EndFrameResponse, { status: statusCode });
    }

    const minimaxData = await minimaxResponse.json();
    console.log('✅ Minimax API response received:', JSON.stringify(minimaxData, null, 2));

    // Minimax returns a task_id for async video generation
    // The response will contain either a video URL (if completed) or a task_id for polling
    if (minimaxData.video_url || (minimaxData.data && minimaxData.data.video_url)) {
      const videoUrl = minimaxData.video_url || minimaxData.data.video_url;
      console.log('🎬 Video URL received from Minimax:', videoUrl);
      
      return NextResponse.json({
        success: true,
        videoUrl: videoUrl,
        status: 'completed'
      } as EndFrameResponse);
    } else if (minimaxData.task_id || (minimaxData.data && minimaxData.data.task_id)) {
      // Task created, need to poll for completion
      const taskId = minimaxData.task_id || minimaxData.data.task_id;
      console.log('⏳ Minimax task created:', taskId);
      
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'IN_PROGRESS'
      } as EndFrameResponse);
    } else {
      console.error('❌ Unexpected Minimax response format:', minimaxData);
      return NextResponse.json({
        success: false,
        error: 'Unexpected response format from Minimax API',
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
  console.log('🔍 API Route: /api/endframe - Task status check');
  
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    console.error('❌ Missing taskId parameter');
    return NextResponse.json({
      success: false,
      error: 'Task ID is required for status check'
    } as EndFrameResponse, { status: 400 });
  }

  console.log('🔍 Checking status for task:', taskId);

  try {
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

    // Query Minimax task status
    const statusResponse = await fetch(`https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${minimaxApiKey}`
      }
    });

    console.log('📥 Minimax status response:', statusResponse.status);

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('❌ Minimax status check error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to check task status',
        retryable: true
      } as EndFrameResponse, { status: 500 });
    }

    const statusData = await statusResponse.json();
    console.log('📦 Task status:', statusData);

    // Check task status
    const status = statusData.status || (statusData.data && statusData.data.status);
    
    console.log('📊 Task status value:', status);
    
    // Check for completion with video URL
    if (status === 'Success' || status === 'completed' || status === 'Finished') {
      console.log('✅ Task completed with status:', status);
      
      // Try to get video URL from various possible fields
      let videoUrl = statusData.file_url || statusData.video_url || (statusData.data && (statusData.data.file_url || statusData.data.video_url));
      
      // If no direct video URL, check if we have a file_id and need to fetch the file
      if (!videoUrl && statusData.file_id) {
        console.log('📥 No direct video URL, fetching file using file_id:', statusData.file_id);
        
        try {
          // Query the file endpoint to get the video URL
          const fileResponse = await fetch(`https://api.minimax.io/v1/files/retrieve?file_id=${statusData.file_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${minimaxApiKey}`
            }
          });
          
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            console.log('📦 File data received:', fileData);
            
            // Extract video URL from file data
            videoUrl = fileData.file?.download_url || fileData.download_url || fileData.url || fileData.file_url;
            
            if (videoUrl) {
              console.log('✅ Video URL extracted from file:', videoUrl);
            }
          } else {
            console.error('❌ Failed to fetch file:', await fileResponse.text());
          }
        } catch (fileError) {
          console.error('❌ Error fetching file:', fileError);
        }
      }
      
      if (videoUrl) {
        console.log('✅ Task completed, video URL:', videoUrl);
        return NextResponse.json({
          success: true,
          videoUrl: videoUrl,
          status: 'completed',
          taskId: taskId
        } as EndFrameResponse);
      } else {
        console.error('❌ Status is success but no video URL found in response or file endpoint');
        console.log('📦 Full status data:', JSON.stringify(statusData, null, 2));
        
        // Return error instead of continuing to poll
        return NextResponse.json({
          success: false,
          error: 'Video generation completed but video URL not available. Please try again.',
          retryable: true
        } as EndFrameResponse, { status: 500 });
      }
    }
    
    // Check for in-progress statuses (Minimax uses various status names)
    if (status === 'Processing' || 
        status === 'Queueing' || 
        status === 'Preparing' || 
        status === 'IN_PROGRESS' || 
        status === 'Running' ||
        status === 'Pending') {
      console.log('⏳ Task still in progress, status:', status);
      return NextResponse.json({
        success: true,
        status: 'IN_PROGRESS',
        taskId: taskId
      } as EndFrameResponse);
    }
    
    // Check for failure
    if (status === 'Failed' || status === 'failed' || status === 'Error') {
      console.error('❌ Task failed with status:', status);
      const errorMessage = statusData.error || statusData.message || 'Video generation task failed';
      return NextResponse.json({
        success: false,
        error: errorMessage,
        status: 'failed',
        taskId: taskId,
        retryable: false
      } as EndFrameResponse, { status: 500 });
    }

    // Unknown status - treat as still in progress to continue polling
    console.warn('⚠️ Unknown task status (treating as in-progress):', status);
    return NextResponse.json({
      success: true,
      status: 'IN_PROGRESS',
      taskId: taskId
    } as EndFrameResponse);

  } catch (error) {
    console.error('💥 Error checking task status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check task status',
      retryable: true
    } as EndFrameResponse, { status: 500 });
  }
}
