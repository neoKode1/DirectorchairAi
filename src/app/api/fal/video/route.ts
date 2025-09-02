import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Helper function to get dimensions from aspect ratio
function getAspectRatioDimensions(aspectRatio: string): { width: number; height: number } | null {
  const ratios: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1440, height: 1080 },
    '3:4': { width: 1080, height: 1440 },
    '21:9': { width: 2560, height: 1080 },
    '9:21': { width: 1080, height: 2560 },
  };
  
  return ratios[aspectRatio] || null;
}

// Video-specific FAL proxy that handles all video generation models
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`🎬 [FAL Video Proxy] ===== VIDEO GENERATION REQUEST START [${requestId}] =====`);
    console.log(`🎬 [FAL Video Proxy] Timestamp: ${new Date().toISOString()}`);
    
    const body = await request.json();
    console.log('🎬 [FAL Video Proxy] Request received:', {
      requestId,
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
    
    console.log(`🎬 [FAL Video Proxy] [${requestId}] Model extraction:`, {
      originalModel: body.model,
      fallbackEndpoint: body.endpoint,
      fallbackEndpointId: body.endpointId,
      finalModel: model
    });
    
    console.log(`🎬 [FAL Video Proxy] [${requestId}] Prompt extraction:`, {
      promptLength: prompt?.length || 0,
      promptPreview: prompt?.substring(0, 200) + (prompt?.length > 200 ? '...' : ''),
      hasPrompt: !!prompt
    });
    
    if (!model) {
      console.error(`❌ [FAL Video Proxy] [${requestId}] Missing model parameter`);
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required",
        requestId
      }, { status: 400 });
    }

    if (!prompt) {
      console.error(`❌ [FAL Video Proxy] [${requestId}] Missing prompt parameter`);
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required",
        requestId
      }, { status: 400 });
    }

    // Validate that image-to-video models have image_url
    if (model.includes('image-to-video') && !body.image_url) {
      console.error(`❌ [FAL Video Proxy] [${requestId}] Missing image_url for image-to-video model:`, model);
      return NextResponse.json({ 
        success: false,
        error: "image_url parameter is required for image-to-video models",
        requestId
      }, { status: 400 });
    }
    
    // Validate required parameters for Luma models according to FAL documentation
    if (model.includes('luma')) {
      const requiredParams = ['prompt', 'image_url', 'aspect_ratio', 'duration', 'resolution'];
      const missingParams = requiredParams.filter(param => !body[param]);
      
      if (missingParams.length > 0) {
        console.error('❌ [FAL Video Proxy] Missing required parameters for Luma model:', missingParams);
        return NextResponse.json({
          success: false,
          error: 'Missing required parameters',
          details: `Required parameters for Luma models: ${requiredParams.join(', ')}. Missing: ${missingParams.join(', ')}`,
          model: model
        }, { status: 400 });
      }
      
      console.log('✅ [FAL Video Proxy] All required Luma parameters present');
    }

    // Create clean FAL-compatible input parameters
    const input: Record<string, any> = {
      prompt: prompt.trim()
    };
    
    console.log(`🎬 [FAL Video Proxy] [${requestId}] Initial input parameters:`, {
      prompt: input.prompt,
      modelType: model.includes('image-to-video') ? 'image-to-video' : 'text-to-video',
      hasImageUrl: !!body.image_url
    });

    // Add image_url if provided (for image-to-video)
    if (body.image_url) {
      // Convert HTTP URLs to base64 data URIs for FAL compatibility
      if (body.image_url.startsWith('http://localhost:') || body.image_url.startsWith('http://127.0.0.1:')) {
        console.log('🎬 [FAL Video Proxy] Converting HTTP URL to base64 for FAL compatibility:', body.image_url);
        try {
          // Fetch the image and convert to base64
          const response = await fetch(body.image_url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          const dataUri = `data:${mimeType};base64,${base64}`;
          
          input.image_url = dataUri;
          console.log('🎬 [FAL Video Proxy] Successfully converted to base64 data URI');
        } catch (error) {
          console.error('❌ [FAL Video Proxy] Failed to convert HTTP URL to base64:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to process image URL for FAL compatibility'
          }, { status: 400 });
        }
      } else if (body.image_url.startsWith('data:')) {
        // Use data URIs directly
        input.image_url = body.image_url;
        console.log('🎬 [FAL Video Proxy] Using existing data URI');
      } else if (body.image_url.startsWith('https://')) {
        // Use HTTPS URLs directly
        input.image_url = body.image_url;
        console.log('🎬 [FAL Video Proxy] Using HTTPS URL');
      } else {
        // For any other URL format, try to convert to base64
        console.log('🎬 [FAL Video Proxy] Converting unknown URL format to base64:', body.image_url);
        try {
          const response = await fetch(body.image_url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          const dataUri = `data:${mimeType};base64,${base64}`;
          
          input.image_url = dataUri;
          console.log('🎬 [FAL Video Proxy] Successfully converted to base64 data URI');
        } catch (error) {
          console.error('❌ [FAL Video Proxy] Failed to convert URL to base64:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to process image URL for FAL compatibility'
          }, { status: 400 });
        }
      }
    }

    // Add video-specific parameters that FAL expects
    if (body.aspect_ratio) {
      input.aspect_ratio = body.aspect_ratio;
    }
    
    // Set duration based on model requirements
    if (model.includes('minimax/hailuo-02')) {
      // HALU Minimax model expects "6" or "10" (without "s" suffix)
      input.duration = '6';
      console.log('🎬 [FAL Video Proxy] Setting duration to 6 for HALU Minimax model');
    } else if (model.includes('minimax')) {
      // Other Minimax models require minimum 6s
      input.duration = '6s';
      console.log('🎬 [FAL Video Proxy] Setting duration to 6s for Minimax model (minimum requirement)');
    } else if (model.includes('luma-dream-machine/ray-2-flash')) {
      // Luma Ray 2 Flash only accepts 5s or 9s
      input.duration = '5s';
      console.log('🎬 [FAL Video Proxy] Setting duration to 5s for Luma Ray 2 Flash');
    } else {
      // Default to 5s for other models
      input.duration = '5s';
      console.log('🎬 [FAL Video Proxy] Setting duration to 5s for other video models');
    }
    
    if (body.resolution) {
      // HALU Minimax expects "512P" or "768P" (uppercase P)
      if (model.includes('minimax/hailuo-02')) {
        const resolution = body.resolution.toUpperCase();
        if (resolution === '720P') {
          input.resolution = '768P'; // Map 720p to 768P for HALU
        } else if (resolution === '540P' || resolution === '480P') {
          input.resolution = '512P'; // Map lower resolutions to 512P
        } else {
          input.resolution = resolution;
        }
        console.log('🎬 [FAL Video Proxy] HALU Minimax resolution mapping:', body.resolution, '->', input.resolution);
      } else {
        input.resolution = body.resolution;
      }
    }
    if (body.negative_prompt) {
      input.negative_prompt = body.negative_prompt;
    }
    if (body.seed !== undefined) {
      input.seed = body.seed;
    }
    if (body.loop !== undefined) {
      input.loop = body.loop;
    }
    if (body.fps) {
      input.fps = body.fps;
    }
    if (body.num_frames) {
      input.num_frames = body.num_frames;
    }

    // Model-specific parameters
    if (model.includes('veo3')) {
      if (body.enhance_prompt !== undefined) {
        input.enhance_prompt = body.enhance_prompt;
      }
      if (body.auto_fix !== undefined) {
        input.auto_fix = body.auto_fix;
      }
      if (body.generate_audio !== undefined) {
        input.generate_audio = body.generate_audio;
      }
    }

    if (model.includes('kling')) {
      if (body.cfg_scale !== undefined) {
        input.cfg_scale = body.cfg_scale;
      }
      
      // Kling models require specific parameters
      console.log('🎬 [FAL Video Proxy] Processing Kling model, applying specific parameter handling');
      
      // Ensure required parameters for Kling models
      if (model.includes('image-to-video')) {
        if (!body.image_url) {
          console.error(`❌ [FAL Video Proxy] [${requestId}] Kling image-to-video model requires image_url`);
          return NextResponse.json({ 
            success: false,
            error: "image_url parameter is required for Kling image-to-video models",
            details: "Kling image-to-video models require an input image to generate video from",
            requestId
          }, { status: 400 });
        }
        
        // Kling models only support these specific parameters
        // Remove any unsupported parameters that might cause 422 errors
        const klingSupportedParams = ['prompt', 'image_url', 'duration', 'negative_prompt', 'cfg_scale'];
        
        // Clean the input to only include supported parameters
        const cleanedInput: Record<string, any> = {};
        klingSupportedParams.forEach(param => {
          if (input[param] !== undefined) {
            cleanedInput[param] = input[param];
          }
        });
        
        // Set defaults for Kling models
        if (!cleanedInput.duration) {
          cleanedInput.duration = "5";
        }
        if (!cleanedInput.negative_prompt) {
          cleanedInput.negative_prompt = "blur, distort, and low quality";
        }
        if (!cleanedInput.cfg_scale) {
          cleanedInput.cfg_scale = 0.5;
        }
        
        // Replace the input with cleaned version
        Object.keys(input).forEach(key => {
          delete input[key];
        });
        Object.assign(input, cleanedInput);
        
        console.log(`🎬 [FAL Video Proxy] [${requestId}] Kling model cleaned input parameters:`, input);
      }
    }

    if (model.includes('minimax')) {
      if (body.prompt_optimizer !== undefined) {
        input.prompt_optimizer = body.prompt_optimizer;
      }
    }

    if (model.includes('seedance')) {
      console.log('🎬 [FAL Video Proxy] Processing Seed Dance model, applying specific parameter handling');
      
      if (body.camera_fixed !== undefined) {
        input.camera_fixed = body.camera_fixed;
      }
      if (body.enable_safety_checker !== undefined) {
        input.enable_safety_checker = body.enable_safety_checker;
      }
      
      // Seed Dance duration will be handled at the end to override other model processing
    }

    // Luma-specific parameters
    if (model.includes('luma')) {
      console.log('🎬 [FAL Video Proxy] Processing Luma model, applying specific parameter handling');
      
      // Luma models use standard parameters, but let's ensure they're properly formatted
      if (body.loop !== undefined) {
        input.loop = body.loop;
      }
      
      // Luma Ray 2 Flash only accepts '5s' or '9s' for duration
      if (model.includes('ray-2-flash')) {
        console.log('🎬 [FAL Video Proxy] Luma Ray 2 Flash detected, validating duration');
        if (body.duration && body.duration !== '5s' && body.duration !== '9s') {
          console.log('🎬 [FAL Video Proxy] Invalid duration for Ray 2 Flash, defaulting to 5s');
          input.duration = '5s';
        }
      }
      
      // Ensure duration is properly formatted for Luma models
      if (body.duration && !body.duration.endsWith('s')) {
        input.duration = body.duration + 's';
      }
      
      // Validate and handle image requirements for Luma models
      if (input.image_url) {
        console.log('🖼️ [FAL Video Proxy] Validating image for Luma compatibility...');
        
        // FAL Documentation Requirements for Luma Ray 2 Flash:
        // - Maximum dimensions: 1920x1920 pixels
        // - Supported formats: JPEG, PNG, WebP
        // - image_url must be a valid URL
        
        try {
          // Basic URL validation
          const imageUrl = new URL(input.image_url);
          console.log('✅ [FAL Video Proxy] Image URL is valid:', imageUrl.hostname);
          
          // Check if it's a FAL media URL (which should already be optimized)
          if (imageUrl.hostname.includes('fal.media')) {
            console.log('✅ [FAL Video Proxy] Using FAL media URL - should be pre-optimized');
          } else {
            console.log('⚠️ [FAL Video Proxy] Non-FAL media URL detected - ensure image meets size requirements');
          }
          
          // Log FAL requirements for reference
          console.log('📋 [FAL Video Proxy] FAL Requirements for Luma Ray 2 Flash:');
          console.log('📋 [FAL Video Proxy] - Max dimensions: 1920x1920 pixels');
          console.log('📋 [FAL Video Proxy] - Supported formats: JPEG, PNG, WebP');
          console.log('📋 [FAL Video Proxy] - Required parameters: prompt, image_url, aspect_ratio, duration, resolution, loop');
          
        } catch (error) {
          console.error('❌ [FAL Video Proxy] Invalid image URL:', error);
          return NextResponse.json({
            success: false,
            error: 'Invalid image URL',
            details: 'The provided image URL is not valid',
            model: model
          }, { status: 400 });
        }
      }
      
      // Luma models have specific parameter requirements
      // Remove any parameters that might cause validation errors
      const allowedLumaParams = ['prompt', 'image_url', 'aspect_ratio', 'duration', 'loop', 'resolution'];
      
      // Clean the prompt by removing unsupported parameters
      if (input.prompt) {
        console.log(`🎬 [FAL Video Proxy] Original prompt before cleaning: "${input.prompt}"`);
        
        // Log what we're looking for
        console.log(`🎬 [FAL Video Proxy] Looking for parameters to remove:`);
        console.log(`🎬 [FAL Video Proxy] - Aspect ratio patterns: ${input.prompt.match(/--ar\s+\d+\.?\d*:\d+\.?\d*/gi) || 'none'}`);
        console.log(`🎬 [FAL Video Proxy] - Style patterns: ${input.prompt.match(/--style\s+[^\s]+/gi) || 'none'}`);
        console.log(`🎬 [FAL Video Proxy] - Cinematic lighting: ${input.prompt.match(/--cinematic\s+lighting/gi) || 'none'}`);
        console.log(`🎬 [FAL Video Proxy] - Other --parameters: ${input.prompt.match(/--\w+\s+[^\s]+/gi) || 'none'}`);
        
        // Remove common unsupported parameters from the prompt
        let cleanedPrompt = input.prompt
          // Remove specific parameter patterns
          .replace(/--ar\s+\d+\.?\d*:\d+\.?\d*/gi, '') // Remove aspect ratio parameters (including decimals)
          .replace(/--style\s+[^\s]+/gi, '') // Remove style parameters (any word after --style)
          .replace(/--cinematic\s+lighting/gi, '') // Remove lighting parameters
          .replace(/--\w+\s+[^\s]+/gi, '') // Remove any other --parameter value pairs
          // Remove any remaining --parameters without values
          .replace(/--\w+/gi, '')
          // Clean up extra spaces and commas
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/,\s*,/g, ',') // Remove double commas
          .replace(/^\s*,\s*/, '') // Remove leading comma
          .replace(/\s*,\s*$/, '') // Remove trailing comma
          .trim();
        
        console.log(`🎬 [FAL Video Proxy] Prompt after cleaning: "${cleanedPrompt}"`);
        
        if (cleanedPrompt !== input.prompt) {
          console.log(`⚠️ [FAL Video Proxy] Prompt was cleaned for Luma compatibility`);
          input.prompt = cleanedPrompt;
        } else {
          console.log(`✅ [FAL Video Proxy] Prompt was already clean, no changes needed`);
        }
      }
      
      // Remove any other unsupported parameters
      Object.keys(input).forEach(key => {
        if (!allowedLumaParams.includes(key)) {
          console.log(`⚠️ [FAL Video Proxy] Removing unsupported parameter for Luma: ${key}`);
          delete input[key];
        }
      });
    }

    console.log(`📦 [FAL Video Proxy] [${requestId}] Final input parameters:`, JSON.stringify(input, null, 2));
    console.log(`📦 [FAL Video Proxy] [${requestId}] Model analysis:`, {
      isLuma: model.includes('luma'),
      isImageToVideo: model.includes('image-to-video'),
      isMinimax: model.includes('minimax'),
      isVeo3: model.includes('veo3'),
      isKling: model.includes('kling'),
      isSeedance: model.includes('seedance'),
      hasImageUrl: !!input.image_url,
      requiredImageUrl: model.includes('image-to-video'),
      duration: input.duration,
      resolution: input.resolution,
      aspectRatio: input.aspect_ratio
    });

    // Final parameter adjustments - Seed Dance duration override (must be last)
    if (model.includes('seedance') && input.duration) {
      let durationValue = input.duration.toString();
      // Remove 's' suffix if present (Seed Dance is the only model that needs duration without 's')
      if (durationValue.endsWith('s')) {
        durationValue = durationValue.slice(0, -1);
        console.log(`🎬 [FAL Video Proxy] [${requestId}] Seed Dance detected: removing 's' suffix from duration`);
      }
      
      // Validate against permitted values for Seed Dance
      const permittedDurations = ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      if (permittedDurations.includes(durationValue)) {
        input.duration = durationValue;
        console.log(`🎬 [FAL Video Proxy] [${requestId}] Seed Dance duration finalized:`, durationValue);
      } else {
        // Default to '5' if invalid
        input.duration = '5';
        console.log(`🎬 [FAL Video Proxy] [${requestId}] Invalid Seed Dance duration, defaulting to: 5`);
      }
    }

    // Call FAL API directly with subscription
    try {
      console.log(`🔗 [FAL Video Proxy] [${requestId}] Calling FAL API for model:`, model);
      console.log(`🔗 [FAL Video Proxy] [${requestId}] FAL API call start time:`, new Date().toISOString());
      
      const result = await fal.subscribe(model, {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log(`📊 [FAL Video Proxy] [${requestId}] Queue update:`, {
            status: update.status,
            timestamp: new Date().toISOString(),
            logs: update.logs?.length || 0
          });
          if (update.status === "IN_PROGRESS" && update.logs) {
            update.logs.forEach((log: any) => {
              console.log(`📊 [FAL Video Proxy] [${requestId}] Progress log:`, log.message);
            });
          }
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [FAL Video Proxy] [${requestId}] FAL API call successful`);
      console.log(`✅ [FAL Video Proxy] [${requestId}] Total duration: ${duration}ms`);
      console.log(`📦 [FAL Video Proxy] [${requestId}] Result:`, {
        requestId: result.requestId,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        videoUrl: result.data?.video,
        status: result.status
      });

      // Return standardized response
      console.log(`🎬 [FAL Video Proxy] [${requestId}] ===== VIDEO GENERATION REQUEST COMPLETED =====`);
      
      return NextResponse.json({
        success: true,
        data: result.data,
        requestId: result.requestId,
        status: 'completed',
        model: model,
        prompt: prompt, // Return the original prompt for verification
        duration: duration,
        timestamp: new Date().toISOString()
      });

    } catch (falError: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ [FAL Video Proxy] [${requestId}] FAL API error:`, {
        error: falError.message,
        status: falError.status,
        duration: duration,
        timestamp: new Date().toISOString()
      });
      console.error(`❌ [FAL Video Proxy] [${requestId}] FAL API error body:`, JSON.stringify(falError.body, null, 2));
      console.error(`❌ [FAL Video Proxy] [${requestId}] FAL API error status:`, falError.status);
      
      // Check for specific error types and provide helpful messages
      let errorMessage = falError.message || 'Unknown FAL error';
      let errorDetails = 'Unknown error occurred';
      
      if (falError.status === 422) {
        errorMessage = 'Validation Error';
        
        // Parse FAL API validation errors
        if (falError.body?.detail && Array.isArray(falError.body.detail)) {
          const validationErrors = falError.body.detail;
          const errorMessages = validationErrors.map((err: any) => {
            if (err.type === 'image_too_large') {
              return `Image too large: ${err.ctx?.max_width || 1920}x${err.ctx?.max_height || 1920} pixels max`;
            } else if (err.type === 'missing_field') {
              return `Missing required field: ${err.loc?.join('.') || 'unknown'}`;
            } else if (err.type === 'value_error') {
              return `Invalid value for ${err.loc?.join('.') || 'field'}: ${err.msg || 'invalid value'}`;
            } else {
              return `${err.type}: ${err.msg || 'validation error'}`;
            }
          });
          
          errorDetails = errorMessages.join('; ');
        } else if (falError.body?.error) {
          errorDetails = falError.body.error;
        } else {
          errorDetails = 'The request parameters are invalid. Please check your input and try again.';
        }
        
        console.error(`❌ [FAL Video Proxy] [${requestId}] Validation error details:`, falError.body);
      } else if (falError.body?.detail) {
        const errorDetail = falError.body.detail[0];
        if (errorDetail?.type === 'image_too_large') {
          errorMessage = 'Image too large for this model';
          errorDetails = `This model requires images to be ${errorDetail.ctx?.max_width || 1920}x${errorDetail.ctx?.max_height || 1920} pixels or smaller. Please resize your image and try again.`;
        }
      }
      
      console.log(`🎬 [FAL Video Proxy] [${requestId}] ===== VIDEO GENERATION REQUEST FAILED =====`);
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        model: model,
        prompt: input.prompt, // Use the cleaned prompt
        originalPrompt: prompt, // Keep original for debugging
        requestId: requestId,
        duration: duration,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ [FAL Video Proxy] [${requestId}] General error:`, {
      error: error.message,
      stack: error.stack,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🎬 [FAL Video Proxy] [${requestId}] ===== VIDEO GENERATION REQUEST ERROR =====`);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process video generation request",
      details: error.message || 'Unknown error',
      requestId: requestId,
      duration: duration,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: "FAL Video Proxy - Use POST for video generation",
    supportedModels: [
      "fal-ai/veo3/fast",
      "fal-ai/veo3/standard", 
      "fal-ai/kling-video/v2.1/master/image-to-video",
      "fal-ai/kling-video/v2.1/master/text-to-video",
      "fal-ai/luma-dream-machine/ray-2",
      "fal-ai/luma-dream-machine/ray-2-flash/image-to-video",
      "fal-ai/minimax/hailuo-02/standard/image-to-video",
      "fal-ai/minimax/hailuo-02/standard/text-to-video",
      "fal-ai/bytedance/seedance/v1/pro/image-to-video"
    ]
  });
}
