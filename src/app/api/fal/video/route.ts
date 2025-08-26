import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Video-specific FAL proxy that handles all video generation models
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('🎬 [FAL Video Proxy] Request received:', {
      model: body.model,
      prompt: body.prompt?.substring(0, 100) + '...',
      hasImage: !!body.image_url
    });

    // Extract model and prompt - these are required
    const model = body.model || body.endpoint || body.endpointId;
    const prompt = body.prompt;
    
    if (!model) {
      console.error('❌ [FAL Video Proxy] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    if (!prompt) {
      console.error('❌ [FAL Video Proxy] Missing prompt parameter');
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required" 
      }, { status: 400 });
    }

    // Validate that image-to-video models have image_url
    if (model.includes('image-to-video') && !body.image_url) {
      console.error('❌ [FAL Video Proxy] Missing image_url for image-to-video model:', model);
      return NextResponse.json({ 
        success: false,
        error: "image_url parameter is required for image-to-video models" 
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

    // Add image_url if provided (for image-to-video)
    if (body.image_url) {
      input.image_url = body.image_url;
    }

    // Add video-specific parameters that FAL expects
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
    }

    if (model.includes('minimax')) {
      if (body.prompt_optimizer !== undefined) {
        input.prompt_optimizer = body.prompt_optimizer;
      }
    }

    if (model.includes('seedance')) {
      if (body.camera_fixed !== undefined) {
        input.camera_fixed = body.camera_fixed;
      }
      if (body.enable_safety_checker !== undefined) {
        input.enable_safety_checker = body.enable_safety_checker;
      }
    }

    // Luma-specific parameters
    if (model.includes('luma')) {
      console.log('🎬 [FAL Video Proxy] Processing Luma model, applying specific parameter handling');
      
      // Luma models use standard parameters, but let's ensure they're properly formatted
      if (body.loop !== undefined) {
        input.loop = body.loop;
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

    console.log('📦 [FAL Video Proxy] Clean FAL input parameters:', JSON.stringify(input, null, 2));
    console.log('📦 [FAL Video Proxy] Full request body for debugging:', JSON.stringify(body, null, 2));
    console.log('📦 [FAL Video Proxy] Model type check:', {
      isLuma: model.includes('luma'),
      isImageToVideo: model.includes('image-to-video'),
      hasImageUrl: !!input.image_url,
      requiredImageUrl: model.includes('image-to-video')
    });

    // Call FAL API directly with subscription
    try {
      console.log('🔗 [FAL Video Proxy] Calling FAL API for model:', model);
      
      const result = await fal.subscribe(model, {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log('📊 [FAL Video Proxy] Queue update:', update.status);
          if (update.status === "IN_PROGRESS" && update.logs) {
            update.logs.map((log: any) => log.message).forEach(console.log);
          }
        },
      });

      console.log('✅ [FAL Video Proxy] FAL API call successful');
      console.log('📦 [FAL Video Proxy] Result:', result);

      // Return standardized response
      return NextResponse.json({
        success: true,
        data: result.data,
        requestId: result.requestId,
        status: 'completed',
        model: model,
        prompt: prompt // Return the original prompt for verification
      });

    } catch (falError: any) {
      console.error('❌ [FAL Video Proxy] FAL API error:', falError);
      console.error('❌ [FAL Video Proxy] FAL API error body:', JSON.stringify(falError.body, null, 2));
      console.error('❌ [FAL Video Proxy] FAL API error status:', falError.status);
      
      // Check for specific error types and provide helpful messages
      let errorMessage = falError.message || 'Unknown FAL error';
      let errorDetails = 'Unknown error occurred';
      
      if (falError.body?.detail) {
        const errorDetail = falError.body.detail[0];
        if (errorDetail?.type === 'image_too_large') {
          errorMessage = 'Image too large for this model';
          errorDetails = `This model requires images to be ${errorDetail.ctx?.max_width || 1920}x${errorDetail.ctx?.max_height || 1920} pixels or smaller. Please resize your image and try again.`;
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        model: model,
        prompt: input.prompt, // Use the cleaned prompt
        originalPrompt: prompt // Keep original for debugging
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [FAL Video Proxy] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process video generation request",
      details: error.message || 'Unknown error',
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
