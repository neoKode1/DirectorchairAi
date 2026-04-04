import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Allow large request bodies (base64 images can be several MB)
export const maxDuration = 120; // seconds

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
                        model.includes('minimax') ||
                        model.includes('dreamactor') ||
                        model.includes('endframe') ||
                        model.includes('ovi/');

    const isImageModel = model.includes('flux') || 
                        model.includes('imagen') || 
                        model.includes('stable-diffusion') || 
                        model.includes('dreamina') ||
                        model.includes('ideogram') ||
                        model.includes('photon') ||
                        model.includes('recraft') ||
                        model.includes('nano-banana') ||
                        model.includes('gemini') ||
                        model.includes('seedream') ||
                        (model.includes('wan') && !model.includes('video'));

    console.log(`🔍 [Generate API] [${requestId}] Model classification:`, {
      model: model,
      isVideoModel: isVideoModel,
      isImageModel: isImageModel,
      videoKeywords: ['video', 'veo', 'kling', 'minimax'].filter(keyword => model.includes(keyword)),
      imageKeywords: ['flux', 'imagen', 'stable-diffusion', 'dreamina', 'ideogram', 'photon', 'recraft', 'nano-banana', 'gemini', 'seedream', 'wan'].filter(keyword => model.includes(keyword))
    });

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
    
    // Handle Wan 2.7 models — use image_urls array and image_size preset string
    if (model.includes('wan/v2.7')) {
      if (body.image_urls && body.image_urls.length > 0) {
        input.image_urls = await Promise.all(
          body.image_urls.map((url: string) => convertLocalhostToBase64(url))
        );
      } else if (body.image_url) {
        input.image_urls = [await convertLocalhostToBase64(body.image_url)];
      }
      // Wan 2.7 uses image_size presets, not aspect_ratio
      input.image_size = 'square_hd';
      delete input.aspect_ratio;
      delete input.size;
      console.log(`🔧 [Generate API] [${requestId}] Wan 2.7: image_urls=${input.image_urls?.length || 0}, image_size=${input.image_size}`);
    }

    // Handle Seedream 5.0 Lite Edit — uses image_urls array and image_size string
    if (model.includes('seedream/v5')) {
      if (body.image_urls && body.image_urls.length > 0) {
        input.image_urls = await Promise.all(
          body.image_urls.map((url: string) => convertLocalhostToBase64(url))
        );
      } else if (body.image_url) {
        input.image_urls = [await convertLocalhostToBase64(body.image_url)];
      }
      // Seedream v5 uses image_size as a string preset, not aspect_ratio
      input.image_size = 'auto_2K';
      delete input.aspect_ratio;
      delete input.size;
      console.log(`🔧 [Generate API] [${requestId}] Seedream v5: image_urls=${input.image_urls?.length || 0}, image_size=${input.image_size}`);
    }

    // Handle other image models that might need special aspect ratio handling
    if (model.includes('flux') || model.includes('stable-diffusion') || model.includes('imagen')) {
      if (body.aspect_ratio) {
        input.aspect_ratio = body.aspect_ratio;
        // Some models might use 'size' instead of 'aspect_ratio'
        input.size = body.aspect_ratio;
      }
    }


    // Handle Veo 3.1 model specific parameters
    if (model.includes('veo3')) {
      // Veo 3.1 supports duration: '4s', '6s', '8s' (string with 's')
      const validVeoDurations = ['4s', '6s', '8s'];
      if (body.duration) {
        const dStr = body.duration.toString().replace(/s$/, '');
        const mapped = `${dStr}s`;
        input.duration = validVeoDurations.includes(mapped) ? mapped : '8s';
      } else {
        input.duration = '8s';
      }

      // Veo 3.1 supports resolution: '720p', '1080p', '4k' (text-to-video & fast i2v)
      const validVeoResolutions = ['720p', '1080p', '4k'];
      if (body.resolution && validVeoResolutions.includes(body.resolution)) {
        input.resolution = body.resolution;
      } else {
        input.resolution = '720p';
      }

      // Veo 3.1 supports aspect_ratio: 'auto', '16:9', '9:16'
      if (!['auto', '16:9', '9:16'].includes(input.aspect_ratio)) {
        input.aspect_ratio = '16:9';
      }

      // Veo 3.1 supports native audio generation
      input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;

      // Handle First/Last Frame model — needs first_frame_url & last_frame_url instead of image_url
      if (model.includes('first-last-frame-to-video')) {
        if (body.first_frame_url) {
          input.first_frame_url = await convertLocalhostToBase64(body.first_frame_url);
        } else if (body.image_url) {
          // Use image_url as first_frame_url if not explicitly provided
          input.first_frame_url = input.image_url;
        }
        if (body.last_frame_url) {
          input.last_frame_url = await convertLocalhostToBase64(body.last_frame_url);
        } else if (body.image_urls && body.image_urls.length >= 2) {
          // Use second image_url as last_frame_url
          input.last_frame_url = await convertLocalhostToBase64(body.image_urls[1]);
        }
        // Remove generic image_url — this model doesn't accept it
        delete input.image_url;
        delete input.image_urls;
      }

      // Handle Image-to-Video — uses image_url (standard for Veo)
      // No remapping needed — image_url is correct for veo3.1 i2v

      console.log(`🔧 [Generate API] [${requestId}] Veo 3.1 model parameters:`, {
        originalDuration: body.duration,
        originalResolution: body.resolution,
        finalDuration: input.duration,
        finalResolution: input.resolution,
        finalAspectRatio: input.aspect_ratio,
        generateAudio: input.generate_audio,
        isFirstLastFrame: model.includes('first-last-frame'),
        note: 'Veo 3.1: duration 4s/6s/8s, resolution 720p/1080p/4k, aspect_ratio auto/16:9/9:16'
      });
    }

    // Handle ALL Minimax Hailuo models (Hailuo 02, Hailuo 2.3, EndFrame)
    if (model.includes('minimax/hailuo') || model.includes('minimax-hailuo') || model.includes('endframe')) {
      console.log(`🔧 [Generate API] [${requestId}] Detected Minimax Hailuo model: ${model}`);
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
      
      // Hailuo 2.3 has prompt_optimizer enabled by default
      if (model.includes('hailuo-2.3')) {
        input.prompt_optimizer = body.prompt_optimizer !== undefined ? body.prompt_optimizer : true;
      }

      console.log(`🔧 [Generate API] [${requestId}] Minimax Hailuo parameters:`, {
        model: model,
        originalDuration: body.duration,
        originalResolution: body.resolution,
        finalDuration: input.duration,
        finalResolution: input.resolution,
        promptOptimizer: input.prompt_optimizer,
        note: 'Hailuo models: duration 6/10, resolution 512P/768P'
      });
    }

    // Handle Kling model specific parameters
    if (model.includes('kling-video')) {
      // Kling v3 and O3 accept duration '3' through '15' (strings without 's')
      // Older Kling versions accept '5' or '10'
      const isKlingV3OrO3 = model.includes('/v3/') || model.includes('/o3/');
      const validKlingV3Durations = ['3','4','5','6','7','8','9','10','11','12','13','14','15'];

      if (body.duration) {
        const dStr = body.duration.toString().replace(/s$/, '');
        if (isKlingV3OrO3 && validKlingV3Durations.includes(dStr)) {
          input.duration = dStr;
        } else if (!isKlingV3OrO3 && (dStr === '5' || dStr === '10')) {
          input.duration = dStr;
        } else {
          input.duration = '5';
        }
      } else {
        input.duration = '5';
      }

      // Kling I2V models use start_image_url (NOT image_url)
      if (model.includes('image-to-video')) {
        if (input.image_url) {
          input.start_image_url = input.image_url;
          delete input.image_url;
        }
        // Kling O3 also supports end_image_url for start/end frame control
        if (body.end_image_url) {
          input.end_image_url = await convertLocalhostToBase64(body.end_image_url);
        } else if (body.image_urls && body.image_urls.length >= 2) {
          input.end_image_url = await convertLocalhostToBase64(body.image_urls[1]);
        }
        // Remove image_urls — Kling I2V doesn't use this
        delete input.image_urls;
      }

      // Kling O3 video-to-video edit — needs video_url, image_urls, elements
      if (model.includes('video-to-video/edit')) {
        if (body.video_url) {
          input.video_url = body.video_url;
        }
        if (body.image_urls && body.image_urls.length > 0) {
          input.image_urls = body.image_urls;
        }
        if (body.elements && body.elements.length > 0) {
          input.elements = body.elements;
        }
        input.keep_audio = body.keep_audio !== undefined ? body.keep_audio : true;
        input.shot_type = body.shot_type || 'customize';
        // V2V edit doesn't use start_image_url or duration
        delete input.start_image_url;
        delete input.image_url;
        delete input.duration;
        delete input.aspect_ratio;
      }

      // Kling v2.6 motion-control — needs video_url + character_orientation
      if (model.includes('motion-control')) {
        if (body.video_url) {
          input.video_url = body.video_url;
        }
        input.character_orientation = body.character_orientation || 'video';
        input.keep_original_sound = body.keep_original_sound !== undefined ? body.keep_original_sound : true;
        // motion-control doesn't use start_image_url, it uses image_url directly
        delete input.start_image_url;
        delete input.duration;
      }

      // Kling v2.6 I2V also supports audio + end_image_url
      const isKlingV26 = model.includes('/v2.6/');
      if (isKlingV26 && model.includes('image-to-video')) {
        input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
      }

      // Kling v3/O3 support native audio generation
      if (isKlingV3OrO3) {
        input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
        // Kling v3 supports aspect_ratio: '16:9', '9:16' for T2V
        if (!['16:9', '9:16'].includes(input.aspect_ratio)) {
          input.aspect_ratio = '16:9';
        }
      }

      // Kling v3 supports negative_prompt and cfg_scale
      if (isKlingV3OrO3) {
        if (!input.negative_prompt) {
          input.negative_prompt = 'blur, distort, and low quality';
        }
        if (body.cfg_scale !== undefined) {
          input.cfg_scale = body.cfg_scale;
        }
      }

      console.log(`🔧 [Generate API] [${requestId}] Kling model parameters:`, {
        originalDuration: body.duration,
        finalDuration: input.duration,
        isV3OrO3: isKlingV3OrO3,
        hasStartImage: !!input.start_image_url,
        hasEndImage: !!input.end_image_url,
        generateAudio: input.generate_audio,
        note: isKlingV3OrO3 ? 'Kling v3/O3: duration 3-15, start_image_url, generate_audio' : 'Kling legacy: duration 5 or 10'
      });
    }

    // Handle Pixverse V6 — I2V, 1-15s (integer), style presets, generate_audio_switch
    if (model.includes('pixverse')) {
      // Duration is an integer 1-15
      if (body.duration) {
        const dNum = parseInt(body.duration.toString().replace(/s$/, ''), 10);
        input.duration = isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 15);
      } else {
        input.duration = 5;
      }
      // Resolution
      const validPixRes = ['360p', '540p', '720p', '1080p'];
      if (body.resolution && validPixRes.includes(body.resolution)) {
        input.resolution = body.resolution;
      } else {
        input.resolution = '720p';
      }
      // Pixverse uses generate_audio_switch, not generate_audio
      if (body.generate_audio !== undefined) {
        input.generate_audio_switch = body.generate_audio;
        delete input.generate_audio;
      }
      // Remove aspect_ratio — Pixverse doesn't use it
      delete input.aspect_ratio;
      console.log(`🔧 [Generate API] [${requestId}] Pixverse V6 parameters:`, {
        duration: input.duration, resolution: input.resolution, generate_audio_switch: input.generate_audio_switch
      });
    }

    // Handle Seedance 1.5 Pro — I2V with audio, start + end frame, 4-12s
    if (model.includes('seedance')) {
      // Duration: "4" through "12" as string
      const validSeedanceDurations = ['4','5','6','7','8','9','10','11','12'];
      if (body.duration) {
        const dStr = body.duration.toString().replace(/s$/, '');
        input.duration = validSeedanceDurations.includes(dStr) ? dStr : '5';
      } else {
        input.duration = '5';
      }
      // Resolution: 480p, 720p, 1080p
      const validSeedanceRes = ['480p', '720p', '1080p'];
      if (body.resolution && validSeedanceRes.includes(body.resolution)) {
        input.resolution = body.resolution;
      } else {
        input.resolution = '720p';
      }
      // Audio generation — default true
      input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
      // End frame support
      if (body.end_image_url) {
        input.end_image_url = await convertLocalhostToBase64(body.end_image_url);
      }
      console.log(`🔧 [Generate API] [${requestId}] Seedance parameters:`, {
        duration: input.duration, resolution: input.resolution, generate_audio: input.generate_audio, end_image_url: !!input.end_image_url
      });
    }

    // Handle Sora 2 model specific parameters
    if (model.includes('sora-2')) {
      // Sora 2 supports aspect_ratio: '16:9', '9:16'
      if (!['16:9', '9:16'].includes(input.aspect_ratio)) {
        input.aspect_ratio = '16:9';
      }
      // Sora 2 duration is in seconds (number), default 5
      if (body.duration) {
        const dNum = parseInt(body.duration.toString().replace(/s$/, ''), 10);
        input.duration = isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 20);
      } else {
        input.duration = 5;
      }
      // Sora 2 Remix (V2V) — needs video_url as source, no image_url
      if (model.includes('video-to-video/remix')) {
        if (body.video_url) {
          input.video_url = body.video_url;
        }
        // Remix doesn't use image_url
        delete input.image_url;
        delete input.image_urls;
      }
      console.log(`🔧 [Generate API] [${requestId}] Sora 2 parameters:`, {
        duration: input.duration, aspectRatio: input.aspect_ratio,
        isRemix: model.includes('remix'), hasVideoUrl: !!input.video_url
      });
    }

    // Handle Wan model specific parameters
    if (model.includes('wan-pro') || model.includes('wan/v2') || model.includes('wan-25')) {
      // Wan models use image_url for I2V (correct as-is)
      // Wan supports resolution parameter for output quality
      if (body.resolution) {
        input.resolution = body.resolution;
      }
      console.log(`🔧 [Generate API] [${requestId}] Wan model parameters:`, {
        duration: input.duration, resolution: input.resolution
      });
    }

    // Handle DreamActor v2 model specific parameters
    if (model.includes('dreamactor')) {
      // DreamActor v2 expects source_image (not image_url) and driving_video
      if (input.image_url) {
        input.source_image = input.image_url;
        delete input.image_url;
      }
      if (body.driving_video) {
        input.driving_video = body.driving_video;
      }
      delete input.image_urls;
      delete input.aspect_ratio;
      delete input.duration;
      console.log(`🔧 [Generate API] [${requestId}] DreamActor v2 parameters:`, {
        hasSourceImage: !!input.source_image, hasDrivingVideo: !!input.driving_video
      });
    }

    // Handle Luma Ray 2 model specific parameters
    if (model.includes('luma-dream-machine')) {
      // Luma Ray 2 uses image_url for I2V (correct as-is)
      // Ensure aspect_ratio is valid for Luma
      if (!['16:9', '9:16', '4:3', '3:4'].includes(input.aspect_ratio)) {
        input.aspect_ratio = '16:9';
      }
      console.log(`🔧 [Generate API] [${requestId}] Luma Ray 2 parameters:`, {
        duration: input.duration, aspectRatio: input.aspect_ratio
      });
    }

    // Handle Grok video models — resolution MUST be '480p' or '720p' only
    if (model.includes('grok-imagine-video')) {
      // Grok uses standard image_url for I2V, text prompt for T2V
      // Duration should be a number
      if (body.duration) {
        const dNum = parseInt(body.duration.toString().replace(/s$/, ''), 10);
        input.duration = isNaN(dNum) ? 6 : dNum;
      } else {
        input.duration = 6;
      }
      // Grok only supports 480p or 720p — clamp anything higher
      const validGrokRes = ['480p', '720p'];
      if (!validGrokRes.includes(input.resolution)) {
        input.resolution = '720p';
      }
      console.log(`🔧 [Generate API] [${requestId}] Grok Video parameters:`, {
        duration: input.duration, aspectRatio: input.aspect_ratio, resolution: input.resolution
      });
    }

    // Handle Ovi I2V — image-to-video with synchronized audio
    if (model.includes('ovi/')) {
      // Ovi uses image_url for source image (standard, already set)
      // Clean params — only send what Ovi accepts
      if (body.duration) {
        const dNum = parseInt(body.duration.toString().replace(/s$/, ''), 10);
        input.duration = isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 10);
      } else {
        input.duration = 5;
      }
      // Ovi supports generate_audio
      input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
      console.log(`🔧 [Generate API] [${requestId}] Ovi I2V parameters:`, {
        duration: input.duration, generateAudio: input.generate_audio
      });
    }

    // Handle Hunyuan Video — T2V, no image needed
    if (model.includes('hunyuan-video')) {
      // Hunyuan is pure T2V — remove any image params that might have leaked through
      delete input.image_url;
      delete input.image_urls;
      // Duration defaults
      if (body.duration) {
        const dNum = parseInt(body.duration.toString().replace(/s$/, ''), 10);
        input.duration = isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 10);
      } else {
        input.duration = 5;
      }
      console.log(`🔧 [Generate API] [${requestId}] Hunyuan Video parameters:`, {
        duration: input.duration, aspectRatio: input.aspect_ratio
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
          
          // Convert aspect_ratio to image_size for Seedream 4.0 Edit
          if (body.aspect_ratio) {
            const aspectRatioToDimensions = (ratio: string) => {
              switch (ratio) {
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
export async function OPTIONS(_request: NextRequest) {
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