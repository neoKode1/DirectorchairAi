import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';
import { compressImageFromUrl, compressBase64DataUri, getOptimalCompressionOptions, bufferToDataUri } from '@/lib/image-compression-server';
import { optimizePrompt, isPromptLikelyRejected, formatOptimizationResult } from '@/lib/prompt-optimizer';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Helper function to save generation result to database
async function saveGenerationToDatabase(
  requestId: string,
  prompt: string,
  model: string,
  outputUrl: string | null,
  status: string,
  userId?: string,
  sessionId?: string
) {
  try {
    const supabase = await createClient();
    
    const generationData = {
      id: requestId,
      user_id: userId || null,
      session_id: sessionId || null,
      prompt,
      model,
      output_url: outputUrl,
      status,
      expires_at: userId ? null : new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours for anonymous
      metadata: {
        timestamp: new Date().toISOString(),
        model_type: model.includes('video') ? 'video' : 'image'
      }
    };

    const { data, error } = await supabase
      .from('generations')
      .insert(generationData);

    if (error) {
      console.error('❌ [Generate API] Failed to save generation to database:', error);
    } else {
      console.log('✅ [Generate API] Generation saved to database:', requestId);
    }
  } catch (error) {
    console.error('❌ [Generate API] Database save error:', error);
  }
}

// Helper function to process images with compression (handles both URLs and base64 data URIs)
async function processImageWithCompression(imageData: string): Promise<string> {
  try {
    console.log('🔄 [Generate API] Processing image with compression:', imageData.substring(0, 100) + '...');
    
    // Handle base64 data URIs
    if (imageData.startsWith('data:')) {
      console.log('📊 [Generate API] Processing base64 data URI');
      const compressionOptions = getOptimalCompressionOptions(0); // Will be determined from actual size
      const result = await compressBase64DataUri(imageData, compressionOptions);
      return bufferToDataUri(result.compressedBuffer, result.mimeType);
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
      const result = await compressImageFromUrl(imageData, compressionOptions);
      return bufferToDataUri(result.compressedBuffer, result.mimeType);
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
  const requestId = uuidv4();
  
  try {
    console.log(`🔍 [Generate API] ===== GENERATION REQUEST START [${requestId}] =====`);
    console.log(`🔍 [Generate API] Timestamp: ${new Date().toISOString()}`);
    
    // Get user authentication and session info
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let userId: string | undefined;
    let sessionId: string | undefined;
    
    if (user && !authError) {
      userId = user.id;
      console.log(`👤 [Generate API] [${requestId}] Authenticated user: ${user.email}`);
    } else {
      // Generate session ID for anonymous users
      sessionId = requestId; // Use requestId as sessionId for anonymous users
      console.log(`👤 [Generate API] [${requestId}] Anonymous user, session: ${sessionId}`);
    }
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error(`❌ [Generate API] [${requestId}] Failed to parse request JSON:`, jsonError);
      return NextResponse.json({
        success: false,
        error: "Invalid JSON in request body",
        details: jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error',
        requestId: requestId,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
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
    
    // Validate required fields
    if (!body.model) {
      console.error(`❌ [Generate API] [${requestId}] Missing model field`);
      return NextResponse.json({
        success: false,
        error: "Missing required field: model",
        requestId: requestId,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    if (!body.prompt && !body.image_url && !body.image_urls) {
      console.error(`❌ [Generate API] [${requestId}] Missing prompt or image`);
      return NextResponse.json({
        success: false,
        error: "Missing required field: prompt or image_url/image_urls",
        requestId: requestId,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Extract model and prompt - these are required
    const model = body.model || body.endpoint || body.endpointId;
    const originalPrompt = body.prompt;
    
    if (!model) {
      console.error('❌ [Generate API] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    if (!originalPrompt) {
      console.error('❌ [Generate API] Missing prompt parameter');
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required" 
      }, { status: 400 });
    }

    // Optimize the prompt to avoid content policy violations
    const optimizationResult = optimizePrompt(originalPrompt);
    const prompt = optimizationResult.optimizedPrompt;
    
    if (optimizationResult.wasOptimized) {
      console.log(`🔧 [Generate API] [${requestId}] Prompt optimized:`, formatOptimizationResult(optimizationResult));
      console.log(`🔧 [Generate API] [${requestId}] Original: "${originalPrompt}"`);
      console.log(`🔧 [Generate API] [${requestId}] Optimized: "${prompt}"`);
    } else {
      console.log(`✅ [Generate API] [${requestId}] Prompt appears safe, no optimization needed`);
    }

    // Check if the prompt is likely to be rejected
    const rejectionCheck = isPromptLikelyRejected(prompt);
    if (rejectionCheck.isLikelyRejected) {
      console.log(`⚠️ [Generate API] [${requestId}] Prompt may still be rejected:`, {
        confidence: rejectionCheck.confidence,
        reasons: rejectionCheck.reasons
      });
    }

    // Determine if this is a video or image generation request
    const isVideoModel = model.includes('video') || 
                        model.includes('veo') || 
                        model.includes('kling') || 
                        model.includes('minimax') ||
                        model.includes('endframe');

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
    
    // Only add image_urls if it exists and is a valid array
    if (body.image_urls && Array.isArray(body.image_urls) && body.image_urls.length > 0) {
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

    // Handle Seedream 4.0 Edit model specific parameters
    if (model.includes('bytedance/seedream/v4/edit')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Seedream 4.0 Edit model: ${model}`);
      
      // Seedream uses image_size, not aspect_ratio
      // Convert aspect_ratio to image_size enum
      if (body.aspect_ratio) {
        const aspectRatioToImageSize: Record<string, string> = {
          '16:9': 'landscape_16_9',
          '9:16': 'portrait_16_9',
          '4:3': 'landscape_4_3',
          '3:4': 'portrait_4_3',
          '1:1': 'square_hd',
          'auto': 'auto'
        };
        
        input.image_size = aspectRatioToImageSize[body.aspect_ratio] || 'auto';
        console.log(`🔧 [Generate API] [${requestId}] Converted aspect_ratio to image_size:`, {
          aspect_ratio: body.aspect_ratio,
          image_size: input.image_size
        });
        
        // Remove aspect_ratio as Seedream doesn't use it
        delete input.aspect_ratio;
      } else {
        input.image_size = 'auto'; // Default to auto to maintain input aspect ratio
      }
      
      // Set default parameters
      input.num_images = input.num_images || 1;
      input.max_images = input.max_images || 1;
      input.enable_safety_checker = input.enable_safety_checker !== undefined ? input.enable_safety_checker : true;
      
      console.log(`🔧 [Generate API] [${requestId}] Seedream 4.0 Edit parameters:`, {
        image_size: input.image_size,
        num_images: input.num_images,
        max_images: input.max_images,
        note: 'Seedream uses image_size (auto/square_hd/landscape_16_9/portrait_16_9/etc), not aspect_ratio'
      });
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

    // Handle Wan v2.2-A14B model specific parameters
    if (model.includes('wan/v2.2-a14b')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Wan v2.2-A14B model: ${model}`);
      
      // Wan v2.2-A14B uses specific parameters
      // Resolution: '480p', '580p', or '720p' (default: '720p')
      if (body.resolution) {
        if (['480p', '580p', '720p'].includes(body.resolution)) {
          input.resolution = body.resolution;
        } else if (body.resolution === '1080p') {
          input.resolution = '720p'; // Convert 1080p to 720p (highest available)
        } else {
          input.resolution = '720p'; // Default to 720p
        }
      } else {
        input.resolution = '720p';
      }
      
      // Aspect ratio: 'auto', '16:9', '9:16', '1:1' (default: 'auto')
      if (body.aspect_ratio && ['auto', '16:9', '9:16', '1:1'].includes(body.aspect_ratio)) {
        input.aspect_ratio = body.aspect_ratio;
      } else {
        input.aspect_ratio = 'auto';
      }
      
      // Set default parameters for Wan v2.2-A14B
      input.num_frames = input.num_frames || 81;
      input.frames_per_second = input.frames_per_second || 16;
      input.num_inference_steps = input.num_inference_steps || 27;
      input.enable_safety_checker = input.enable_safety_checker !== undefined ? input.enable_safety_checker : true;
      input.enable_output_safety_checker = input.enable_output_safety_checker !== undefined ? input.enable_output_safety_checker : false;
      input.enable_prompt_expansion = input.enable_prompt_expansion !== undefined ? input.enable_prompt_expansion : false;
      input.acceleration = input.acceleration || 'regular';
      input.guidance_scale = input.guidance_scale || 3.5;
      input.guidance_scale_2 = input.guidance_scale_2 || 3.5;
      input.shift = input.shift || 5;
      input.interpolator_model = input.interpolator_model || 'film';
      input.num_interpolated_frames = input.num_interpolated_frames !== undefined ? input.num_interpolated_frames : 1;
      input.adjust_fps_for_interpolation = input.adjust_fps_for_interpolation !== undefined ? input.adjust_fps_for_interpolation : true;
      input.video_quality = input.video_quality || 'high';
      input.video_write_mode = input.video_write_mode || 'balanced';
      input.negative_prompt = input.negative_prompt || '';
      
      // Remove duration as Wan v2.2-A14B uses num_frames instead
      delete input.duration;
      
      console.log(`🔧 [Generate API] [${requestId}] Wan v2.2-A14B model parameters:`, {
        originalResolution: body.resolution,
        finalResolution: input.resolution,
        aspect_ratio: input.aspect_ratio,
        num_frames: input.num_frames,
        frames_per_second: input.frames_per_second,
        note: 'Wan v2.2-A14B uses num_frames (17-161) and frames_per_second (4-60) instead of duration'
      });
    }

    // Handle Wan 2.5 Preview model specific parameters
    if (model.includes('wan-25-preview')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Wan 2.5 Preview model: ${model}`);
      
      // Wan 2.5 uses specific parameters
      // Resolution: '480p', '720p', or '1080p' (default: '1080p')
      if (body.resolution) {
        if (['480p', '720p', '1080p'].includes(body.resolution)) {
          input.resolution = body.resolution;
        } else {
          input.resolution = '1080p'; // Default to 1080p
        }
      } else {
        input.resolution = '1080p';
      }
      
      // Duration: '5' or '10' (as strings, not '5s' or '10s')
      if (body.duration) {
        if (typeof body.duration === 'string') {
          // Remove 's' if present and validate
          const durationNum = body.duration.replace('s', '');
          if (['5', '10'].includes(durationNum)) {
            input.duration = durationNum;
          } else {
            input.duration = '5';
          }
        } else if (typeof body.duration === 'number') {
          // Convert number to string
          input.duration = body.duration >= 10 ? '10' : '5';
        } else {
          input.duration = '5';
        }
      } else {
        input.duration = '5';
      }
      
      // Negative prompt (optional, max 500 characters)
      if (body.negative_prompt) {
        input.negative_prompt = body.negative_prompt.substring(0, 500);
      } else {
        input.negative_prompt = 'low resolution, error, worst quality, low quality, defects';
      }
      
      // Enable prompt expansion (default: true)
      if (body.enable_prompt_expansion !== undefined) {
        input.enable_prompt_expansion = body.enable_prompt_expansion;
      } else {
        input.enable_prompt_expansion = true;
      }
      
      // Remove aspect_ratio as Wan 2.5 doesn't use it
      delete input.aspect_ratio;
      
      console.log(`🔧 [Generate API] [${requestId}] Wan 2.5 Preview model parameters:`, {
        originalResolution: body.resolution,
        finalResolution: input.resolution,
        originalDuration: body.duration,
        finalDuration: input.duration,
        negative_prompt: input.negative_prompt,
        enable_prompt_expansion: input.enable_prompt_expansion,
        note: 'Wan 2.5 uses duration: 5 or 10 (strings without s), resolution: 480p/720p/1080p'
      });
    }

    // Handle Luma Ray 2 model specific parameters
    if (model.includes('luma-dream-machine/ray-2')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Luma Ray 2 model: ${model}`);
      
      // Luma Ray 2 uses specific parameters
      // Resolution: '540p', '720p', or '1080p' (default: '540p')
      // Note: 720p costs 2x more, 1080p costs 4x more
      if (body.resolution) {
        if (['540p', '720p', '1080p'].includes(body.resolution)) {
          input.resolution = body.resolution;
        } else {
          input.resolution = '540p'; // Default to 540p
        }
      } else {
        input.resolution = '540p';
      }
      
      // Duration: '5s' or '9s' (default: '5s')
      // Note: 9s costs 2x more
      if (body.duration) {
        if (typeof body.duration === 'string' && ['5s', '9s'].includes(body.duration)) {
          input.duration = body.duration;
        } else if (typeof body.duration === 'number') {
          // Convert number to string format
          if (body.duration >= 9) {
            input.duration = '9s';
          } else {
            input.duration = '5s';
          }
        } else {
          input.duration = '5s';
        }
      } else {
        input.duration = '5s';
      }
      
      // Aspect ratio: '16:9', '9:16', '4:3', '3:4', '21:9', '9:21' (default: '16:9')
      if (body.aspect_ratio && ['16:9', '9:16', '4:3', '3:4', '21:9', '9:21'].includes(body.aspect_ratio)) {
        input.aspect_ratio = body.aspect_ratio;
      } else if (body.aspect_ratio === 'auto') {
        input.aspect_ratio = '16:9'; // Convert auto to 16:9
      } else {
        input.aspect_ratio = '16:9';
      }
      
      // Loop parameter (optional)
      if (body.loop !== undefined) {
        input.loop = body.loop;
      } else {
        input.loop = false;
      }
      
      console.log(`🔧 [Generate API] [${requestId}] Luma Ray 2 model parameters:`, {
        originalResolution: body.resolution,
        finalResolution: input.resolution,
        originalDuration: body.duration,
        finalDuration: input.duration,
        aspect_ratio: input.aspect_ratio,
        loop: input.loop,
        note: 'Luma Ray 2 uses duration: 5s or 9s (string), resolution: 540p/720p/1080p, aspect_ratio: 16:9/9:16/4:3/3:4/21:9/9:21'
      });
    }

    // Handle Ovi model specific parameters
    if (model.includes('ovi')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Ovi model: ${model}`);
      
      // Ovi requires specific resolution format: '512x992', '992x512', '960x512', '512x960', '720x720', '448x1120', '1120x448'
      if (body.resolution) {
        // Convert common resolutions to Ovi format
        if (body.resolution === '1080p') {
          input.resolution = '992x512'; // Default to 992x512 for 1080p
        } else if (body.resolution === '720p') {
          input.resolution = '720x720'; // Use 720x720 for 720p
        } else if (['512x992', '992x512', '960x512', '512x960', '720x720', '448x1120', '1120x448'].includes(body.resolution)) {
          input.resolution = body.resolution; // Already valid
        } else {
          input.resolution = '992x512'; // Default to 992x512
        }
      } else {
        input.resolution = '992x512'; // Default resolution for Ovi
      }
      
      console.log(`🔧 [Generate API] [${requestId}] Ovi model parameters:`, {
        originalResolution: body.resolution,
        finalResolution: input.resolution,
        note: 'Ovi requires specific resolution format: 512x992, 992x512, 960x512, 512x960, 720x720, 448x1120, 1120x448'
      });
    }

    // Handle EndFrame model specific parameters
    if (model.includes('endframe')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected EndFrame model: ${model}`);
      
      // EndFrame requires two images - redirect to EndFrame API
      console.log(`🎬 [Generate API] [${requestId}] Redirecting EndFrame request to dedicated API`);
      
      // For EndFrame, we should redirect to the /api/endframe endpoint
      // This is handled by the client-side logic, so we'll return an error here
      return NextResponse.json({
        success: false,
        error: "EndFrame requests should be sent directly to /api/endframe endpoint",
        requestId: requestId,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Handle Sora 2 and Sora 2 Pro model specific parameters
    if (model.includes('sora-2')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Sora 2 model: ${model}`);
      
      // Sora 2 Pro supports resolution: 'auto', '720p', '1080p'
      // Sora 2 (standard) supports resolution: 'auto', '720p'
      const isSora2Pro = model.includes('sora-2/image-to-video/pro');
      
      // Sora 2 models default to 'auto' for resolution (matching playground example)
      if (body.resolution) {
        if (isSora2Pro) {
          // Sora 2 Pro supports 1080p
          if (body.resolution === 'auto' || body.resolution === '720p' || body.resolution === '1080p') {
            input.resolution = body.resolution; // Already valid
          } else {
            input.resolution = 'auto'; // Default to auto
          }
        } else {
          // Sora 2 standard only supports auto and 720p
          if (body.resolution === '1080p') {
            input.resolution = '720p'; // Convert 1080p to 720p (closest valid option)
          } else if (body.resolution === 'auto' || body.resolution === '720p') {
            input.resolution = body.resolution; // Already valid
          } else {
            input.resolution = 'auto'; // Default to auto
          }
        }
      } else {
        input.resolution = 'auto'; // Default to auto (matching playground example)
      }
      
      // Sora 2 ONLY accepts duration: 4, 8, or 12 (numbers, not strings)
      if (body.duration) {
        const durationNum = parseInt(body.duration.toString());
        if (durationNum === 4 || durationNum === 8 || durationNum === 12) {
          input.duration = durationNum; // Already valid
        } else if (durationNum <= 4) {
          input.duration = 4; // Convert short durations to 4
        } else if (durationNum <= 8) {
          input.duration = 8; // Convert medium durations to 8
        } else {
          input.duration = 12; // Convert long durations to 12
        }
      } else {
        input.duration = 4; // Default to 4 seconds
      }
      
      // Sora 2 supports aspect_ratio: 'auto', '9:16', '16:9' (default to 'auto' like playground)
      if (body.aspect_ratio && !['auto', '9:16', '16:9'].includes(body.aspect_ratio)) {
        // Convert to supported aspect ratios
        if (body.aspect_ratio === '16:9') {
          input.aspect_ratio = '16:9';
        } else if (body.aspect_ratio === '9:16') {
          input.aspect_ratio = '9:16';
        } else {
          input.aspect_ratio = 'auto'; // Default to auto
        }
      } else if (!body.aspect_ratio) {
        input.aspect_ratio = 'auto'; // Default to auto (matching playground example)
      }
      
      console.log(`🔧 [Generate API] [${requestId}] Sora 2 model parameters:`, {
        model: model,
        isSora2Pro: isSora2Pro,
        originalDuration: body.duration,
        originalResolution: body.resolution,
        originalAspectRatio: body.aspect_ratio,
        finalDuration: input.duration,
        finalResolution: input.resolution,
        finalAspectRatio: input.aspect_ratio,
        note: isSora2Pro 
          ? 'Sora 2 Pro accepts duration: 4, 8, or 12 (numbers), resolution: auto/720p/1080p, aspect_ratio: auto/9:16/16:9'
          : 'Sora 2 accepts duration: 4, 8, or 12 (numbers), resolution: auto or 720p, aspect_ratio: auto/9:16/16:9'
      });
      
      // For both Sora 2 and Sora 2 Pro, use exact schema from FAL AI documentation
      console.log(`🔧 [Generate API] [${requestId}] Applying Sora 2 exact schema parameters`);
      
      // Build input according to exact FAL AI schema - ONLY include valid parameters
      const sora2Input: Record<string, any> = {
        prompt: input.prompt
      };
      
      // Only add image_url if it exists and is valid
      if (input.image_url) {
        sora2Input.image_url = input.image_url;
      }
      
      // Add optional parameters only if they have valid values
      if (isSora2Pro) {
        // Sora 2 Pro supports 1080p
        if (input.resolution && ['auto', '720p', '1080p'].includes(input.resolution)) {
          sora2Input.resolution = input.resolution;
        }
      } else {
        // Sora 2 standard only supports auto and 720p
        if (input.resolution && ['auto', '720p'].includes(input.resolution)) {
          sora2Input.resolution = input.resolution;
        }
      }
      
      if (input.aspect_ratio && ['auto', '9:16', '16:9'].includes(input.aspect_ratio)) {
        sora2Input.aspect_ratio = input.aspect_ratio;
      }
      
      if (input.duration && [4, 8, 12].includes(Number(input.duration))) {
        sora2Input.duration = Number(input.duration);
      }
      
      // Completely replace input with clean Sora 2 parameters
      // This ensures no extra parameters like image_urls (plural) are sent
      Object.keys(input).forEach(key => delete input[key]);
      Object.assign(input, sora2Input);
      
      console.log(`🔧 [Generate API] [${requestId}] Sora 2 final input (exact schema):`, sora2Input);
      console.log(`🔧 [Generate API] [${requestId}] Sora 2 input keys:`, Object.keys(sora2Input));
      console.log(`🔧 [Generate API] [${requestId}] Has image_url:`, !!sora2Input.image_url);
    }


    // Final cleanup: remove any undefined values from input
    Object.keys(input).forEach(key => {
      if (input[key] === undefined) {
        delete input[key];
      }
    });

    console.log(`🔗 [Generate API] [${requestId}] Calling FAL API directly for model:`, model);
    console.log(`🔗 [Generate API] [${requestId}] Input parameters:`, {
      ...input,
      image_url: input.image_url ? '[IMAGE_DATA_OMITTED]' : undefined,
      image_urls: input.image_urls ? '[IMAGE_DATA_OMITTED]' : undefined
    });
    console.log(`🔗 [Generate API] [${requestId}] Aspect ratio being sent:`, input.aspect_ratio);
    console.log(`🔗 [Generate API] [${requestId}] Resolution being sent:`, input.resolution);
    console.log(`🔗 [Generate API] [${requestId}] Duration being sent:`, input.duration);
    console.log(`🔗 [Generate API] [${requestId}] User settings received:`, {
      aspect_ratio: body.aspect_ratio,
      resolution: body.resolution,
      duration: body.duration,
      model: body.model
    });

    // Call FAL API directly with timeout handling
    let result;
    try {
      // Add timeout based on model type and quality (based on actual FAL AI timing data)
      const isVideoModel = model.includes('sora-2') || model.includes('veo3') || model.includes('kling-video') || model.includes('minimax') || model.includes('wan-pro') || model.includes('wan/v2.2-a14b') || model.includes('wan-25-preview') || model.includes('hunyuan') || model.includes('ovi') || model.includes('luma-dream-machine') || model.includes('endframe');
      const isHighQualityImageModel = model.includes('flux-pro') || model.includes('imagen4') || model.includes('nano-banana');
      
      let timeoutDuration;
      if (isVideoModel) {
        // Video models: Based on actual timing data + buffer
        if (model.includes('kling-video')) {
          timeoutDuration = 5 * 60 * 1000; // 5 minutes for Kling (actual: ~3 min)
        } else if (model.includes('sora-2')) {
          timeoutDuration = 5 * 60 * 1000; // 5 minutes for Sora 2 (actual: ~2-2.5 min)
        } else if (model.includes('minimax')) {
          timeoutDuration = 4 * 60 * 1000; // 4 minutes for Minimax (actual: ~2 min)
        } else if (model.includes('veo3')) {
          timeoutDuration = 3 * 60 * 1000; // 3 minutes for Veo 3 (actual: ~1 min)
        } else if (model.includes('wan-pro')) {
          timeoutDuration = 8 * 60 * 1000; // 8 minutes for Wan Pro (known to be slow)
        } else if (model.includes('wan/v2.2-a14b')) {
          timeoutDuration = 6 * 60 * 1000; // 6 minutes for Wan v2.2-A14B
        } else if (model.includes('wan-25-preview')) {
          timeoutDuration = 4 * 60 * 1000; // 4 minutes for Wan 2.5 Preview (1-3 minutes typical)
        } else if (model.includes('hunyuan')) {
          timeoutDuration = 6 * 60 * 1000; // 6 minutes for Hunyuan
        } else if (model.includes('ovi')) {
          timeoutDuration = 6 * 60 * 1000; // 6 minutes for Ovi (audio generation takes time)
        } else if (model.includes('luma-dream-machine')) {
          timeoutDuration = 5 * 60 * 1000; // 5 minutes for Luma Ray 2
        } else {
          timeoutDuration = 5 * 60 * 1000; // 5 minutes default for other video models
        }
      } else if (isHighQualityImageModel) {
        timeoutDuration = 3 * 60 * 1000; // 3 minutes for high-quality image models
      } else {
        timeoutDuration = 2 * 60 * 1000; // 2 minutes for standard image models
      }
      
      result = await Promise.race([
        fal.subscribe(model, {
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
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Generation timeout after ${timeoutDuration / 1000 / 60} minutes`)), timeoutDuration)
        )
      ]) as any;

      console.log(`✅ [Generate API] [${requestId}] FAL API call successful`);
      console.log(`📦 [Generate API] [${requestId}] Result:`, result);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ [Generate API] [${requestId}] Generation successful`);
      console.log(`✅ [Generate API] [${requestId}] Total duration: ${duration}ms`);
      
      // Save generation to database (temporarily disabled until table is created)
      const outputUrl = result.data?.video?.url || result.data?.images?.[0]?.url || null;
      try {
        await saveGenerationToDatabase(
          requestId,
          prompt,
          model,
          outputUrl,
          'completed',
          userId,
          sessionId
        );
      } catch (dbError: any) {
        console.log(`⚠️ [Generate API] [${requestId}] Database save failed (table may not exist):`, dbError.message);
        // Continue without failing the request
      }
      
      console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST COMPLETED =====`);
      
      return NextResponse.json({
        success: true,
        data: result.data,
        requestId: result.requestId,
        status: 'completed',
        model: model,
        prompt: prompt,
        originalPrompt: optimizationResult.wasOptimized ? originalPrompt : undefined,
        promptOptimized: optimizationResult.wasOptimized,
        optimizationChanges: optimizationResult.wasOptimized ? optimizationResult.changes : undefined,
        duration: duration,
        timestamp: new Date().toISOString()
      });

    } catch (falError: any) {
      console.error(`❌ [Generate API] [${requestId}] FAL API error:`, falError);
      console.error(`❌ [Generate API] [${requestId}] Error status:`, falError.status);
      console.error(`❌ [Generate API] [${requestId}] Error body:`, falError.body);
      
      // Save failed generation to database
      try {
        await saveGenerationToDatabase(
          requestId,
          prompt,
          model,
          null,
          'failed',
          userId,
          sessionId
        );
      } catch (dbError: any) {
        console.log(`⚠️ [Generate API] [${requestId}] Database save failed (table may not exist):`, dbError.message);
      }
      
      // Handle timeout errors specifically
      if (falError.message && falError.message.includes('timeout')) {
        console.log(`⏰ [Generate API] [${requestId}] Generation timeout detected`);
        return NextResponse.json({
          success: false,
          error: 'Generation timeout',
          message: 'The generation request timed out. Video generation can take several minutes. Please try again with a shorter duration or try again later.',
          details: falError.message,
          status: 504,
          model: model,
          timestamp: new Date().toISOString()
        }, { status: 504 });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Check if this is a content policy violation or prompt length issue with Nano Banana Edit that we can fallback from
      const isContentPolicyViolation = falError.status === 422 ||
                                     (falError.body && falError.body.detail && 
                                      Array.isArray(falError.body.detail) &&
                                      falError.body.detail.some((d: any) => 
                                        d.msg && (d.msg.includes('Gemini could not generate an image') ||
                                                 d.msg.includes('prompt too long') ||
                                                 d.msg.includes('input too long') ||
                                                 d.msg.includes('content could not be processed') ||
                                                 d.msg.includes('flagged by a content checker') ||
                                                 d.msg.includes('content policy') ||
                                                 d.msg.includes('content is not passing') ||
                                                 d.msg.includes('OpenAI could not generate') ||
                                                 d.msg.includes('rejected by content filter') ||
                                                 d.type === 'content_policy_violation')
                                      ));
      
      // Check if this is a Sora 2 parameter validation error
      const isSora2ValidationError = falError.status === 422 &&
                                    (falError.body && falError.body.detail && 
                                     Array.isArray(falError.body.detail) &&
                                     falError.body.detail.some((d: any) => 
                                       d.msg && (d.msg.includes('Invalid request to downstream service') ||
                                                d.msg.includes('validation error') ||
                                                d.msg.includes('invalid parameter'))
                                     ));
      
      const isPromptTooLong = falError.status === 400 && 
                             (falError.message?.toLowerCase().includes('too long') ||
                              (falError.body?.detail && Array.isArray(falError.body.detail) &&
                               falError.body.detail.some((d: any) => 
                                 d.msg?.toLowerCase().includes('too long')
                               )));
      
      const isNanoBananaEdit = model === 'fal-ai/nano-banana/edit';
      const hasImageInput = body.image_url || body.image_urls;
      
      console.log(`🔍 [Generate API] [${requestId}] Error analysis:`, {
        isContentPolicyViolation,
        isPromptTooLong,
        isNanoBananaEdit,
        hasImageInput,
        model,
        errorStatus: falError.status,
        errorBody: falError.body
      });
      
      if ((isContentPolicyViolation || isPromptTooLong) && isNanoBananaEdit && hasImageInput) {
        const issueType = isPromptTooLong ? 'prompt length issue' : 'content policy violation';
        console.log(`🔄 [Generate API] [${requestId}] ${issueType} detected, trying fallback models...`);
        
        try {
          // Prepare fallback input
          const fallbackInput: Record<string, any> = {
            prompt: input.prompt,
            logs: true,
          };

          if (body.image_url) {
            fallbackInput.image_url = await processImageWithCompression(body.image_url);
          } else if (body.image_urls && body.image_urls.length > 0) {
            fallbackInput.image_urls = await Promise.all(
              body.image_urls.map((url: string) => processImageWithCompression(url))
            );
          }
          
          // Set image_size to auto for Seedream 4.0 Edit (maintains input aspect ratio)
          fallbackInput.image_size = "auto";
          delete fallbackInput.aspect_ratio; // Remove aspect_ratio as Seedream uses image_size
          console.log(`🔄 [Generate API] [${requestId}] Set image_size to auto for Seedream 4.0 Edit`);
          
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
          
          // Save fallback generation to database
          const fallbackOutputUrl = fallbackResult.data?.video?.url || fallbackResult.data?.images?.[0]?.url || null;
          await saveGenerationToDatabase(
            requestId,
            prompt,
            'fal-ai/bytedance/seedream/v4/edit',
            fallbackOutputUrl,
            'completed',
            userId,
            sessionId
          );
          
          console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST COMPLETED (FALLBACK) =====`);
          
        return NextResponse.json({
            success: true,
            data: fallbackResult.data,
            requestId: fallbackResult.requestId,
            status: 'completed',
            model: 'fal-ai/bytedance/seedream/v4/edit',
          prompt: prompt,
          originalPrompt: optimizationResult.wasOptimized ? originalPrompt : undefined,
          promptOptimized: optimizationResult.wasOptimized,
          optimizationChanges: optimizationResult.wasOptimized ? optimizationResult.changes : undefined,
            duration: fallbackDuration,
            fallbackUsed: 'fal-ai/bytedance/seedream/v4/edit',
            timestamp: new Date().toISOString()
          });
        } catch (fallbackError: any) {
          console.error(`❌ [Generate API] [${requestId}] Seedream 4.0 Edit fallback failed, trying Flux Pro...`);
          
          // Try Flux Pro as a second fallback
          try {
            const fluxInput: Record<string, any> = {
              prompt: input.prompt,
              logs: true,
            };

            if (body.image_url) {
              fluxInput.image_url = await processImageWithCompression(body.image_url);
            } else if (body.image_urls && body.image_urls.length > 0) {
              fluxInput.image_urls = await Promise.all(
                body.image_urls.map((url: string) => processImageWithCompression(url))
              );
            }
            
            if (body.aspect_ratio) {
              fluxInput.aspect_ratio = body.aspect_ratio;
            }
            if (body.resolution) {
              fluxInput.resolution = body.resolution;
            }
            
            const fluxResult = await fal.subscribe('fal-ai/flux-pro/v1.1-ultra', {
              input: fluxInput,
              logs: true,
              onQueueUpdate: (update: any) => {
                console.log(`📊 [Generate API] [${requestId}] Flux Pro queue update:`, update.status);
              },
            });
            
            console.log(`✅ [Generate API] [${requestId}] Flux Pro fallback successful`);
            
            // Save Flux Pro generation to database
            const fluxOutputUrl = fluxResult.data?.images?.[0]?.url || null;
            await saveGenerationToDatabase(
              requestId,
              prompt,
              'fal-ai/flux-pro/v1.1-ultra',
              fluxOutputUrl,
              'completed',
              userId,
              sessionId
            );

            return NextResponse.json({
              success: true,
              data: fluxResult.data,
              requestId: fluxResult.requestId,
              status: 'completed',
              model: 'fal-ai/flux-pro/v1.1-ultra',
              prompt: prompt,
              originalPrompt: optimizationResult.wasOptimized ? originalPrompt : undefined,
              promptOptimized: optimizationResult.wasOptimized,
              optimizationChanges: optimizationResult.wasOptimized ? optimizationResult.changes : undefined,
              duration: Date.now() - startTime,
              fallbackUsed: 'fal-ai/flux-pro/v1.1-ultra',
              originalModel: model,
              timestamp: new Date().toISOString()
            });

          } catch (fluxError: any) {
            console.error(`❌ [Generate API] [${requestId}] All fallbacks failed:`, fluxError);
            
            // Return a user-friendly error message for content policy violations or prompt length issues
            const errorType = isPromptTooLong ? 'Prompt too long' : 'Content policy violation';
            const errorMessage = isPromptTooLong 
              ? 'Your prompt is too long for all available models. Please shorten your prompt and try again.'
              : 'The prompt contains content that violates our content policy. Please try rephrasing your prompt to be more appropriate.';
            const errorDetails = isPromptTooLong
              ? 'All models have prompt length limits. Please reduce your prompt length and try again.'
              : 'All available models rejected the content. Please modify your prompt and try again.';
            
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
      }

      // Handle Sora 2 validation errors specifically
      if (isSora2ValidationError) {
        return NextResponse.json({
          success: false,
          error: 'Invalid Sora 2 parameters',
          message: 'The parameters sent to Sora 2 are invalid. Please check your resolution, duration, and aspect ratio settings.',
          details: falError.body?.detail || 'Parameter validation failed',
          status: 422,
          model: model,
          prompt: prompt,
          duration: duration,
          timestamp: new Date().toISOString()
        }, { status: 422 });
      }

      // DISABLED: Video fallback system to prevent expensive video generations
      // Handle Sora 2 content policy violations - NO FALLBACK (too expensive)
      if (isContentPolicyViolation && model.includes('sora-2')) {
        console.log(`❌ [Generate API] [${requestId}] Sora 2 content policy violation - NO FALLBACK (disabled to prevent expensive video generations)`);
        
        // Return error instead of trying expensive video fallbacks
        return NextResponse.json({
          success: false,
          error: 'Content policy violation',
          message: 'Your content was rejected by Sora 2\'s content policy. Please try a different prompt or use a different model.',
          details: 'Sora 2 has strict content policies. Try using single-person images, avoid horror/violence themes, and use detailed, positive prompts.',
          status: 422,
          model: model,
          timestamp: new Date().toISOString()
        }, { status: 422 });
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