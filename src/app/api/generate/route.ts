import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Helper function to convert localhost URLs to base64 data URIs
async function convertLocalhostToBase64(url: string): Promise<string> {
  if (url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:')) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error('Failed to convert localhost URL to base64:', error);
      return url; // Return original URL if conversion fails
    }
  }
  return url;
}

// Unified generate route that handles all FAL models directly
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`🔍 [Generate API] ===== GENERATION REQUEST START [${requestId}] =====`);
    console.log(`🔍 [Generate API] Timestamp: ${new Date().toISOString()}`);
    
    const body = await request.json();
    console.log(`🔍 [Generate API] [${requestId}] Request received:`, {
      model: body.model,
      prompt: body.prompt?.substring(0, 100) + '...',
      hasImage: !!body.image_url,
      imageUrl: body.image_url,
      aspectRatio: body.aspect_ratio,
      duration: body.duration,
      resolution: body.resolution,
      allKeys: Object.keys(body)
    });

    // Extract model and prompt - these are required
    const model = body.model || body.endpoint || body.endpointId;
    const prompt = body.prompt;
    
    if (!model) {
      console.error('❌ [Generate API] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    if (!prompt) {
      console.error('❌ [Generate API] Missing prompt parameter');
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required" 
      }, { status: 400 });
    }

    // Determine if this is a video or image generation request
    const isVideoModel = model.includes('video') || 
                        model.includes('veo') || 
                        model.includes('kling') || 
                        model.includes('luma') || 
                        model.includes('minimax') ||
                        model.includes('seedance');

    const isImageModel = model.includes('flux') || 
                        model.includes('imagen') || 
                        model.includes('stable-diffusion') || 
                        model.includes('dreamina') ||
                        model.includes('ideogram') ||
                        model.includes('photon') ||
                        model.includes('recraft') ||
                        model.includes('nano-banana') ||
                        model.includes('gemini') ||
                        model.includes('seedream');
    
    console.log(`🔍 [Generate API] [${requestId}] Model classification:`, {
      model: model,
      isVideoModel: isVideoModel,
      isImageModel: isImageModel,
      videoKeywords: ['video', 'veo', 'kling', 'luma', 'minimax', 'seedance'].filter(keyword => model.includes(keyword)),
      imageKeywords: ['flux', 'imagen', 'stable-diffusion', 'dreamina', 'ideogram', 'photon', 'recraft', 'nano-banana', 'gemini', 'seedream'].filter(keyword => model.includes(keyword))
    });

    // Prepare FAL API input parameters
    const input: Record<string, any> = {
      prompt: prompt.trim()
    };

    // Handle image URLs for image-to-image models
    if (body.image_url) {
      input.image_url = await convertLocalhostToBase64(body.image_url);
    }
    
    if (body.image_urls && Array.isArray(body.image_urls)) {
      input.image_urls = await Promise.all(
        body.image_urls.map((url: string) => convertLocalhostToBase64(url))
      );
    }

    // Add model-specific parameters
    if (body.aspect_ratio) {
      input.aspect_ratio = body.aspect_ratio;
    }
    
    if (body.duration) {
      input.duration = body.duration;
    }
    
    if (body.resolution) {
      input.resolution = body.resolution;
    }

    if (body.negative_prompt) {
      input.negative_prompt = body.negative_prompt;
    }

    if (body.seed !== undefined) {
      input.seed = body.seed;
    }

    // Handle model-specific parameters
    if (model.includes('nano-banana/edit')) {
      // Nano Banana Edit specific handling
      if (body.image_urls && body.image_urls.length > 0) {
        input.image_urls = await Promise.all(
          body.image_urls.map((url: string) => convertLocalhostToBase64(url))
        );
      }
      // Nano Banana Edit might use different parameter names
      if (body.aspect_ratio) {
        input.aspect_ratio = body.aspect_ratio;
        // Some models might also accept 'ratio' or 'size'
        input.ratio = body.aspect_ratio;
      }
    }
    
    // Handle other image models that might need special aspect ratio handling
    if (model.includes('flux') || model.includes('stable-diffusion') || model.includes('imagen')) {
      if (body.aspect_ratio) {
        input.aspect_ratio = body.aspect_ratio;
        // Some models might use 'size' instead of 'aspect_ratio'
        input.size = body.aspect_ratio;
      }
    }

    // Handle Seedance model specific parameters
    if (model.includes('seedance')) {
      // Seedance expects duration as a number (3, 4, 5, etc.) not a string with 's'
      // Default to 5 seconds for simplicity
      input.duration = 5;
    }

    // Handle Minimax Hailuo-02 model specific parameters
    if (model.includes('minimax/hailuo-02')) {
      // Minimax Hailuo-02 only accepts duration: '6' or '10' (strings)
      // Default to 6 seconds
      input.duration = '6';
      
      // Minimax Hailuo-02 only accepts resolution: '512P' or '768P'
      // Convert 1080p to 768P, others to 512P
      if (body.resolution === '1080p') {
        input.resolution = '768P';
      } else {
        input.resolution = '512P';
      }
    }

    console.log(`🔗 [Generate API] [${requestId}] Calling FAL API directly for model:`, model);
    console.log(`🔗 [Generate API] [${requestId}] Input parameters:`, input);
    console.log(`🔗 [Generate API] [${requestId}] Aspect ratio being sent:`, input.aspect_ratio);
    console.log(`🔗 [Generate API] [${requestId}] Resolution being sent:`, input.resolution);
    console.log(`🔗 [Generate API] [${requestId}] User settings received:`, {
      aspect_ratio: body.aspect_ratio,
      resolution: body.resolution,
      model: body.model
    });

    // Call FAL API directly
    let result;
    try {
      result = await fal.subscribe(model, {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log(`📊 [Generate API] [${requestId}] Queue update:`, update.status);
          if (update.logs) {
            update.logs.forEach((log: any) => {
              console.log(`📊 [Generate API] [${requestId}] Queue log:`, log.message);
            });
          }
        },
      });

      console.log(`✅ [Generate API] [${requestId}] FAL API call successful`);
      console.log(`📦 [Generate API] [${requestId}] Result:`, result);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ [Generate API] [${requestId}] Generation successful`);
      console.log(`✅ [Generate API] [${requestId}] Total duration: ${duration}ms`);
      console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST COMPLETED =====`);

      return NextResponse.json({
        success: true,
        data: result.data,
        requestId: result.requestId,
        status: 'completed',
        model: model,
        prompt: prompt,
        duration: duration,
        timestamp: new Date().toISOString()
      });

    } catch (falError: any) {
      console.error(`❌ [Generate API] [${requestId}] FAL API error:`, falError);
      console.error(`❌ [Generate API] [${requestId}] Error status:`, falError.status);
      console.error(`❌ [Generate API] [${requestId}] Error body:`, falError.body);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check if this is a content policy violation with Nano Banana Edit that we can fallback from
      const isContentPolicyViolation = falError.status === 422 ||
                                     (falError.body && falError.body.detail && 
                                      falError.body.detail.some((d: any) => 
                                        d.msg && d.msg.includes('Gemini could not generate an image')
                                      ));
      
      const isNanoBananaEdit = model === 'fal-ai/nano-banana/edit';
      const hasImageInput = body.image_url || body.image_urls;
      
      if (isContentPolicyViolation && isNanoBananaEdit && hasImageInput) {
        console.log(`🔄 [Generate API] [${requestId}] Content policy violation detected, trying Seedream 4.0 Edit as fallback...`);
        
        try {
          // Retry with Seedream 4.0 Edit
          const fallbackInput = {
            ...input,
            // Keep the same prompt and image for fallback
          };
          
          const fallbackResult = await fal.subscribe('fal-ai/bytedance/seedream/v4/edit', {
            input: fallbackInput,
            logs: true,
            onQueueUpdate: (update: any) => {
              console.log(`📊 [Generate API] [${requestId}] Fallback queue update:`, update.status);
            },
          });
          
          const fallbackEndTime = Date.now();
          const fallbackDuration = fallbackEndTime - startTime;
          
          console.log(`✅ [Generate API] [${requestId}] Fallback generation successful with Seedream 4.0 Edit`);
          console.log(`✅ [Generate API] [${requestId}] Total duration: ${fallbackDuration}ms`);
          console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST COMPLETED (FALLBACK) =====`);
          
          return NextResponse.json({
            success: true,
            data: fallbackResult.data,
            requestId: fallbackResult.requestId,
            status: 'completed',
            model: 'fal-ai/bytedance/seedream/v4/edit',
            prompt: prompt,
            duration: fallbackDuration,
            fallbackUsed: 'fal-ai/bytedance/seedream/v4/edit',
            timestamp: new Date().toISOString()
          });
        } catch (fallbackError) {
          console.error(`❌ [Generate API] [${requestId}] Fallback also failed:`, fallbackError);
        }
      }

      // Return the original error if no fallback or fallback failed
      const originalStatus = falError.status || 500;
      
      return NextResponse.json({
        success: false,
        error: 'FAL API call failed',
        details: falError.message || 'Unknown FAL error',
        status: falError.status,
        body: falError.body,
        model: model,
        prompt: prompt,
        duration: duration,
        timestamp: new Date().toISOString()
      }, { status: originalStatus });
    }

  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ [Generate API] [${requestId}] General error:`, {
      error: error.message,
      stack: error.stack,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST ERROR =====`);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process generation request",
      details: error.message || 'Unknown error',
      requestId: requestId,
      duration: duration,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
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