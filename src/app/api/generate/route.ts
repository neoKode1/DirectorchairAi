import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';
import { compressImageFromUrl, compressBase64DataUri, getOptimalCompressionOptions } from '@/lib/image-compression';

// Helper function to process images with compression (handles both URLs and base64 data URIs)
async function processImageWithCompression(imageData: string): Promise<string> {
  try {
    console.log('🔄 [Generate API] Processing image with compression:', imageData.substring(0, 100) + '...');
    
    // Handle base64 data URIs
    if (imageData.startsWith('data:')) {
      console.log('📊 [Generate API] Processing base64 data URI');
      const compressionOptions = getOptimalCompressionOptions(0); // Will be determined from actual size
      return await compressBase64DataUri(imageData, compressionOptions);
    }
    
    // Handle HTTP URLs
    if (imageData.startsWith('http://localhost:') || imageData.startsWith('http://127.0.0.1:') || imageData.startsWith('https://')) {
      console.log('🔄 [Generate API] Converting HTTP URL to base64 with compression:', imageData);
      
      // First, fetch the image to check its size
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const originalSize = arrayBuffer.byteLength;
      
      console.log('📊 [Generate API] Original image size:', (originalSize / 1024 / 1024).toFixed(2) + 'MB');
      
      // If image is small enough, use simple base64 conversion
      if (originalSize <= 2 * 1024 * 1024) { // 2MB threshold
        console.log('✅ [Generate API] Image is small enough, using simple base64 conversion');
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        return `data:${contentType};base64,${base64}`;
      }
      
      // For larger images, use compression
      console.log('🗜️ [Generate API] Image is large, applying compression');
      const compressionOptions = getOptimalCompressionOptions(originalSize);
      return await compressImageFromUrl(imageData, compressionOptions);
    }
    
    // Return as-is if not a recognized format
    return imageData;
    
  } catch (error) {
    console.error('❌ [Generate API] Failed to process image:', error);
    return imageData; // Return original if processing fails
  }
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
                        model.includes('minimax');

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
      videoKeywords: ['video', 'veo', 'kling', 'minimax'].filter(keyword => model.includes(keyword)),
      imageKeywords: ['flux', 'imagen', 'stable-diffusion', 'dreamina', 'ideogram', 'photon', 'recraft', 'nano-banana', 'gemini', 'seedream'].filter(keyword => model.includes(keyword))
    });

    // Validate prompt length for different models
    const promptLength = prompt.trim().length;
    const modelPromptLimits: Record<string, number> = {
      'fal-ai/nano-banana/edit': 2000,        // Nano Banana Edit has stricter limits
      'fal-ai/bytedance/seedream/v4/edit': 2000, // Seedream also has limits
      'fal-ai/flux-pro': 3000,                // Flux Pro allows longer prompts
      'fal-ai/imagen4': 3000,                 // Imagen 4 allows longer prompts
      'default': 2500                         // Default limit for other models
    };
    
    const maxLength = modelPromptLimits[model] || modelPromptLimits['default'];
    
    if (promptLength > maxLength) {
      console.log(`⚠️ [Generate API] [${requestId}] Prompt too long: ${promptLength} chars (max: ${maxLength})`);
      return NextResponse.json({
        success: false,
        error: 'Prompt too long',
        message: `Your prompt is ${promptLength} characters long, but the ${model} model has a limit of ${maxLength} characters. Please shorten your prompt and try again.`,
        details: `Current length: ${promptLength} characters. Maximum allowed: ${maxLength} characters.`,
        status: 400,
        model: model,
        promptLength: promptLength,
        maxLength: maxLength,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Prepare FAL API input parameters
    const input: Record<string, any> = {
      prompt: prompt.trim()
    };

    // Set default parameters for video models
    if (isVideoModel) {
      // Default aspect ratio for all video models
      if (body.aspect_ratio) {
        input.aspect_ratio = body.aspect_ratio;
      } else {
        input.aspect_ratio = '16:9'; // Default aspect ratio for video models
      }
      
      // Default duration for video models (will be overridden by model-specific handling)
      if (body.duration) {
        input.duration = body.duration;
    } else {
        input.duration = 6; // Default to 6 seconds for video models (compatible with Hailuo AI 02)
      }
    }

    // Handle image URLs for image-to-image models
    if (body.image_url) {
      input.image_url = await processImageWithCompression(body.image_url);
    }
    
    if (body.image_urls && Array.isArray(body.image_urls)) {
      input.image_urls = await Promise.all(
        body.image_urls.map((url: string) => processImageWithCompression(url))
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
          body.image_urls.map((url: string) => processImageWithCompression(url))
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


    // Handle Veo 3 model specific parameters
    if (model.includes('veo3')) {
      // Veo 3 uses duration: '8s' (string with 's') and supports 720p/1080p resolution
      input.duration = '8s'; // Veo 3 only supports 8 seconds
      
      // Veo 3 supports resolution: '720p' or '1080p'
      if (body.resolution && !['720p', '1080p'].includes(body.resolution)) {
        // Convert common resolutions to Veo 3 format
        if (body.resolution === '1080p') {
          input.resolution = '1080p';
        } else {
          input.resolution = '720p'; // Default to 720p
        }
      }

      // Veo 3 supports aspect_ratio: 'auto', '16:9', '9:16'
      if (body.aspect_ratio && !['auto', '16:9', '9:16'].includes(body.aspect_ratio)) {
        // Convert to supported aspect ratios
        if (body.aspect_ratio === '16:9') {
          input.aspect_ratio = '16:9';
        } else if (body.aspect_ratio === '9:16') {
          input.aspect_ratio = '9:16';
        } else {
          input.aspect_ratio = 'auto'; // Default to auto
        }
      }

      // Set default generate_audio to true for Veo 3
      if (input.generate_audio === undefined) {
        input.generate_audio = true;
      }

      console.log(`🔧 [Generate API] [${requestId}] Veo 3 model parameters:`, {
        originalDuration: body.duration,
        originalResolution: body.resolution,
        originalAspectRatio: body.aspect_ratio,
        finalDuration: input.duration,
        finalResolution: input.resolution,
        finalAspectRatio: input.aspect_ratio,
        generateAudio: input.generate_audio,
        note: 'Veo 3 uses duration: 8s (string with s), resolution: 720p or 1080p, aspect_ratio: auto/16:9/9:16'
      });
    }

    // Handle Minimax Hailuo-02 model specific parameters
    if (model.includes('minimax/hailuo-02') || model.includes('minimax/hailuo-02/standard')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Minimax Hailuo-02 model: ${model}`);
      // Hailuo AI 02 Standard ONLY accepts duration: '6' or '10' (strings)
      // NEVER send '5' or '5s' - it will be rejected!
      if (body.duration) {
        const durationStr = body.duration.toString();
        if (durationStr.includes('5') || durationStr.includes('5s')) {
          input.duration = '6'; // Convert 5s to 6s (closest valid option)
        } else if (durationStr.includes('10') || durationStr.includes('10s')) {
          input.duration = '10';
        } else if (durationStr.includes('6') || durationStr.includes('6s')) {
          input.duration = '6';
        } else {
          input.duration = '6'; // Default to 6 seconds (valid option)
        }
      } else {
        input.duration = '6'; // Default to 6 seconds (valid option)
      }
      
      // Hailuo AI 02 Standard ONLY accepts resolution: '512P' or '768P'
      // NEVER send '1080p', '720p', etc. - they will be rejected!
      if (body.resolution) {
        if (body.resolution === '1080p' || body.resolution === '720p') {
          input.resolution = '768P'; // Convert high res to 768P
        } else if (body.resolution === '512P' || body.resolution === '768P') {
          input.resolution = body.resolution; // Already valid
        } else {
          input.resolution = '768P'; // Default to 768P (valid option)
        }
      } else {
        input.resolution = '768P'; // Default to 768P (valid option)
      }
      
      console.log(`🔧 [Generate API] [${requestId}] Hailuo AI 02 Standard parameters:`, {
        model: model,
        originalDuration: body.duration,
        originalResolution: body.resolution,
        finalDuration: input.duration,
        finalResolution: input.resolution,
        note: 'Hailuo AI 02 only accepts duration: 6 or 10 (strings), resolution: 512P or 768P (strings)'
      });
    }

    // Handle Kling model specific parameters
    if (model.includes('kling-video')) {
      // Kling models only accept duration: '5' or '10' (strings without 's')
      if (body.duration) {
        const durationStr = body.duration.toString();
        if (durationStr.includes('5') || durationStr.includes('5s')) {
          input.duration = '5'; // Kling uses '5' not '5s'
        } else if (durationStr.includes('10') || durationStr.includes('10s')) {
          input.duration = '10';
        } else {
          input.duration = '5'; // Default to 5 seconds
        }
      } else {
        input.duration = '5'; // Default to 5 seconds
      }
      
      console.log(`🔧 [Generate API] [${requestId}] Kling model parameters:`, {
        originalDuration: body.duration,
        finalDuration: input.duration,
        note: 'Kling uses duration: 5 or 10 (strings without s)'
      });
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
      
      // Check if this is a content policy violation or prompt length issue with Nano Banana Edit that we can fallback from
      const isContentPolicyViolation = falError.status === 422 ||
                                     (falError.body && falError.body.detail && 
                                      falError.body.detail.some((d: any) => 
                                        d.msg && (d.msg.includes('Gemini could not generate an image') ||
                                                 d.msg.includes('prompt too long') ||
                                                 d.msg.includes('input too long'))
                                      ));
      
      const isPromptTooLong = falError.status === 400 && 
                             (falError.message?.toLowerCase().includes('too long') ||
                              falError.body?.detail?.some((d: any) => 
                                d.msg?.toLowerCase().includes('too long')
                              ));
      
      const isNanoBananaEdit = model === 'fal-ai/nano-banana/edit';
      const hasImageInput = body.image_url || body.image_urls;
      
      if ((isContentPolicyViolation || isPromptTooLong) && isNanoBananaEdit && hasImageInput) {
        const issueType = isPromptTooLong ? 'prompt length issue' : 'content policy violation';
        console.log(`🔄 [Generate API] [${requestId}] ${issueType} detected, trying Seedream 4.0 Edit as fallback...`);
        
        try {
          // Retry with Seedream 4.0 Edit
          const fallbackInput = {
            ...input,
            // Keep the same prompt and image for fallback
          };
          
          // Convert aspect_ratio to image_size for Seedream 4.0 Edit
          if (body.aspect_ratio) {
            const aspectRatioToDimensions = (ratio: string) => {
              switch (ratio) {
                case '1:1':
                  return { width: 1024, height: 1024 };
                case '16:9':
                  return { width: 1920, height: 1080 };
                case '9:16':
                  return { width: 1080, height: 1920 };
                case '4:3':
                  return { width: 1024, height: 768 };
                case '3:4':
                  return { width: 768, height: 1024 };
                default:
                  return { width: 1920, height: 1080 }; // Default to 16:9
              }
            };
            
            fallbackInput.image_size = aspectRatioToDimensions(body.aspect_ratio);
            // Remove aspect_ratio since Seedream uses image_size
            delete fallbackInput.aspect_ratio;
            
            console.log(`🔄 [Generate API] [${requestId}] Converted aspect_ratio ${body.aspect_ratio} to image_size:`, fallbackInput.image_size);
          }
          
          // Add timeout to prevent hanging
          const fallbackTimeout = 300000; // 5 minutes timeout
          const fallbackPromise = fal.subscribe('fal-ai/bytedance/seedream/v4/edit', {
            input: fallbackInput,
            logs: true,
            onQueueUpdate: (update: any) => {
              console.log(`📊 [Generate API] [${requestId}] Fallback queue update:`, update.status);
            },
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fallback timeout after 5 minutes')), fallbackTimeout);
          });
          
          const fallbackResult = await Promise.race([fallbackPromise, timeoutPromise]);
          
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
        } catch (fallbackError: any) {
          console.error(`❌ [Generate API] [${requestId}] Fallback also failed:`, fallbackError);
          
          // Return a user-friendly error message for content policy violations or prompt length issues
          const errorType = isPromptTooLong ? 'Prompt too long' : 'Content policy violation';
          const errorMessage = isPromptTooLong 
            ? 'Your prompt is too long for both the primary model and fallback model. Please shorten your prompt and try again.'
            : 'The prompt contains content that violates our content policy. Please try rephrasing your prompt to be more appropriate.';
          const errorDetails = isPromptTooLong
            ? 'Both models have prompt length limits. Please reduce your prompt length and try again.'
            : 'Both the primary model and fallback model rejected the content. Please modify your prompt and try again.';
          
          return NextResponse.json({
            success: false,
            error: errorType,
            message: errorMessage,
            details: errorDetails,
            status: isPromptTooLong ? 400 : 422,
            model: model,
            prompt: prompt,
            promptLength: prompt.length,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }, { status: isPromptTooLong ? 400 : 422 });
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