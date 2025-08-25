import { NextRequest, NextResponse } from "next/server";

// Import the FAL proxy handlers
import { route } from '@fal-ai/server-proxy/nextjs';
// Content filtering removed - user has full control over prompts

// Note: Removed Edge Runtime to support localStorage-based logging



// Custom handler that adapts our format to FAL proxy format
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('🔍 [Generate API] Request body:', body);
    console.log('🔍 [Generate API] Prompt in request:', body.prompt);
    console.log('🔍 [Generate API] Enhanced prompt in request:', body.prompt);
    console.log('🔍 [Generate API] Structured prompt for display:', body.structuredPromptForDisplay);
    console.log('🔍 [Generate API] All keys in request:', Object.keys(body));

    // Extract model from request body
    const model = body.model || body.endpoint || body.endpointId;
    
    if (!model) {
      console.error('❌ [Generate API] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    // Check if this is a Veo3 model and route to the dedicated endpoint
    if (model.includes('veo3')) {
      console.log('🎬 [Generate API] Detected Veo3 model, routing to dedicated endpoint');
      
      // Create a new request for the Veo3 endpoint
      const veo3Url = new URL(request.url);
      veo3Url.pathname = `/api/generate/veo3`;
      
      const veo3Request = new NextRequest(veo3Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(request.headers.entries())
        },
        body: JSON.stringify(body)
      });

      // Call the Veo3 endpoint
      const veo3Response = await fetch(veo3Request);
      const veo3Result = await veo3Response.json();
      
      if (!veo3Response.ok) {
        console.error('❌ [Generate API] Veo3 endpoint error:', veo3Result);
        return NextResponse.json({
          success: false,
          error: veo3Result.error || 'Veo3 generation failed',
          details: veo3Result.details
        }, { status: veo3Response.status });
      }

      console.log('✅ [Generate API] Veo3 generation successful:', veo3Result);
      return NextResponse.json(veo3Result);
    }

    // Check if this is a Luma model and route to the dedicated endpoint
    if (model.includes('luma')) {
      console.log('🎬 [Generate API] Detected Luma model, routing to dedicated endpoint');
      
      // Create a new request for the Luma endpoint
      const lumaUrl = new URL(request.url);
      lumaUrl.pathname = `/api/generate/luma`;
      
      const lumaRequest = new NextRequest(lumaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(request.headers.entries())
        },
        body: JSON.stringify(body)
      });

      // Call the Luma endpoint
      const lumaResponse = await fetch(lumaRequest);
      const lumaResult = await lumaResponse.json();
      
      if (!lumaResponse.ok) {
        console.error('❌ [Generate API] Luma endpoint error:', lumaResult);
        return NextResponse.json({
          success: false,
          error: lumaResult.error || 'Luma generation failed',
          details: lumaResult.details
        }, { status: lumaResponse.status });
      }

      console.log('✅ [Generate API] Luma generation successful:', lumaResult);
      return NextResponse.json(lumaResult);
    }

    // Remove model from body and prepare input for proxy
    const { model: _, endpoint: __, endpointId: ___, ...input } = body;

    // Clean up the input parameters based on model type
    let cleanedInput = { ...input };
    
    // Content filtering removed - user has full control over prompts
    
    // For image generation models, remove video-specific parameters but keep image_url if present
    if (model.includes('flux') || model.includes('image')) {
      // Remove video-specific parameters that might cause issues
      const { duration, resolution, loop, ...imageParams } = cleanedInput;
      cleanedInput = imageParams;
    }
    
    // For video generation models, ensure required parameters are present and compress images if needed
    if (model.includes('video') || model.includes('veo') || model.includes('kling') || model.includes('luma') || model.includes('minimax')) {
      // If this is image-to-video and no image_url is provided, it's a text-to-video request
      if (!cleanedInput.image_url && !cleanedInput.prompt) {
        console.error('❌ [Generate API] Video generation requires either image_url or prompt');
        return NextResponse.json({ 
          success: false,
          error: "Video generation requires either image_url or prompt" 
        }, { status: 400 });
      }
      
      // Note: Image compression is handled at the model selection level in intelligence-core.ts
      // Models are selected based on their ability to handle different image sizes
      if (cleanedInput.image_url) {
        console.log('🎬 [Generate API] Image-to-video generation with image URL:', cleanedInput.image_url);
      }
    }

    // Create a new request for the proxy
    const proxyUrl = new URL(request.url);
    proxyUrl.pathname = `/api/fal/proxy`;
    
    const proxyRequest = new NextRequest(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-fal-target-url': `https://fal.run/${model}`,
        ...Object.fromEntries(request.headers.entries())
      },
      body: JSON.stringify(cleanedInput)
    });

    console.log('🔗 [Generate API] Forwarding to proxy:', proxyUrl.pathname);
    console.log('📦 [Generate API] Proxy request body:', cleanedInput);
    console.log('📦 [Generate API] Enhanced prompt being sent to proxy:', cleanedInput.prompt);
    console.log('📦 [Generate API] Structured prompt for display being sent to proxy:', cleanedInput.structuredPromptForDisplay);

    // Call the FAL proxy
    console.log('🔗 [Generate API] Calling FAL proxy...');
    
    try {
      const proxyResponse = await route.POST(proxyRequest);
      console.log('📊 [Generate API] Proxy response status:', proxyResponse.status);
      console.log('📊 [Generate API] Proxy response headers:', Object.fromEntries(proxyResponse.headers.entries()));
      
      if (!proxyResponse.ok) {
        const errorData = await proxyResponse.json().catch(() => ({ error: 'Proxy request failed' }));
        console.error('❌ [Generate API] Proxy error:', errorData);
        return NextResponse.json({
          success: false,
          error: errorData.error || 'Proxy request failed',
          details: errorData.details
        }, { status: proxyResponse.status });
      }
      
      const result = await proxyResponse.json();
      console.log('✅ [Generate API] Proxy response:', result);
      console.log('🔍 [Generate API] Response keys:', Object.keys(result));
      
    } catch (proxyError: any) {
      console.error('❌ [Generate API] Proxy request failed:', proxyError);
      
      // Try fallback to direct FAL client if proxy fails
      console.log('🔄 [Generate API] Attempting fallback to direct FAL client...');
      
      try {
        const { fal } = await import('@fal-ai/client');
        
        if (!process.env.FAL_KEY) {
          throw new Error('FAL_KEY environment variable is not set');
        }
        
        console.log('🔗 [Generate API] Using direct FAL client for model:', model);
        const directResult = await fal.run(model, { input: cleanedInput });
        
        console.log('✅ [Generate API] Direct FAL client successful:', directResult);
        
        return NextResponse.json({
          success: true,
          data: directResult,
          model: model,
          parameters: cleanedInput,
          source: 'direct-fal-client'
        });
        
      } catch (fallbackError: any) {
        console.error('❌ [Generate API] Fallback also failed:', fallbackError);
        
        return NextResponse.json({
          success: false,
          error: 'Both proxy and direct FAL client failed',
          proxyError: proxyError.message,
          fallbackError: fallbackError.message,
          details: 'Please check FAL configuration and network connectivity'
        }, { status: 500 });
      }
    }

    const result = await proxyResponse.json();
    console.log('✅ [Generate API] Proxy response:', result);
    console.log('🔍 [Generate API] Response keys:', Object.keys(result));

    // Content filtering logging removed - user has full control over prompts

    // Check if this is a video generation request
    const isVideoGeneration = model.includes('video') || model.includes('veo') || model.includes('kling') || model.includes('luma') || model.includes('minimax');
    
    if (isVideoGeneration) {
      // First check if we got an immediate video result
      if (result.video || result.images || result.data?.video || result.data?.images) {
        console.log('🎬 [Generate API] Video result received immediately, returning direct result');
        
        // For video models, the result might be in the images array or direct video field
        let videoData = null;
        if (result.video) {
          videoData = result.video;
        } else if (result.images && result.images.length > 0) {
          const videoResult = result.images[0];
          videoData = {
            url: videoResult.url,
            duration: videoResult.duration || '5s',
            resolution: videoResult.resolution || 'HD',
            format: videoResult.content_type || 'mp4',
          };
        } else if (result.data?.video) {
          videoData = result.data.video;
        }
        
        return NextResponse.json({
          success: true,
          data: result,
          video: videoData,
          images: result.images || result.data?.images,
          status: 'completed'
        });
      }
      
      // If no immediate result, look for task ID for polling
      const taskId = result.requestId || result.id || result.taskId || result.request_id;
      
      console.log('🔍 [Generate API] Looking for task ID in response:');
      console.log('  - result.requestId:', result.requestId);
      console.log('  - result.id:', result.id);
      console.log('  - result.taskId:', result.taskId);
      console.log('  - result.request_id:', result.request_id);
      console.log('  - Final taskId:', taskId);
      
      if (taskId) {
        console.log('🎬 [Generate API] Video generation started, task ID:', taskId);
        return NextResponse.json({
          success: true,
          taskId: taskId,
          status: 'processing',
          message: 'Video generation started. Use the task ID to poll for results.',
          model: model
        });
      } else {
        console.error('❌ [Generate API] No task ID received for video generation');
        console.error('❌ [Generate API] Full response structure:', JSON.stringify(result, null, 2));
        
        return NextResponse.json({
          success: false,
          error: 'No task ID received for video generation'
        }, { status: 500 });
      }
    } else {
      // For image generation, handle multiple images if present
      console.log('🖼️ [Generate API] Processing image generation result');
      console.log('🖼️ [Generate API] Result structure:', Object.keys(result));
      
      // Check for multiple images in the response
      let images = [];
      if (result.images && Array.isArray(result.images)) {
        images = result.images;
        console.log('🖼️ [Generate API] Found multiple images:', images.length);
      } else if (result.image) {
        images = [result.image];
        console.log('🖼️ [Generate API] Found single image');
      } else if (result.data?.images) {
        images = result.data.images;
        console.log('🖼️ [Generate API] Found images in data:', images.length);
      } else if (result.data?.image) {
        images = [result.data.image];
        console.log('🖼️ [Generate API] Found single image in data');
      }
      
      return NextResponse.json({
        success: true,
        data: result,
        images: images,
        imageCount: images.length,
        requestId: result.requestId || result.id
      });
    }

  } catch (error) {
    console.error('❌ [Generate API] Error:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to process generation request",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
