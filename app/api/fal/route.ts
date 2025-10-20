import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Only validate FAL_KEY at runtime, not during build
const validateFalKey = () => {
  if (!process.env.FAL_KEY) {
    throw new Error("FAL_KEY environment variable is not set");
  }
  // Debug: Log which key is being used (first few characters only)
  const keyPrefix = process.env.FAL_KEY.substring(0, 8);
  console.log(`🔑 [FAL API] Using FAL_KEY starting with: ${keyPrefix}...`);
};

export const runtime = "edge";

interface FalError extends Error {
  status?: number;
  details?: unknown;
}

// Initialize the FAL client with credentials at runtime
const initializeFalClient = () => {
  validateFalKey();
  fal.config({
    credentials: process.env.FAL_KEY,
  });
};

// Helper function to log errors with more detail
function logError(error: FalError, method: string) {
  console.error(`Error in ${method} request:`, {
    message: error.message,
    status: error.status,
    name: error.name,
    details: error.details || 'No additional details',
    stack: error.stack
  });
}

// Helper function to validate and sanitize input for different model types
function sanitizeInput(model: string, input: any) {
  const sanitized: any = { ...input };
  
  // Remove undefined and null values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined || sanitized[key] === null) {
      delete sanitized[key];
    }
  });

  // Model-specific input validation and transformation
  if (model.includes('flux-pro')) {
    // Flux Pro models expect specific parameters
    if (sanitized.prompt) {
      sanitized.prompt = sanitized.prompt.trim();
    }
    if (sanitized.num_inference_steps && typeof sanitized.num_inference_steps === 'string') {
      sanitized.num_inference_steps = parseInt(sanitized.num_inference_steps);
    }
    if (sanitized.guidance_scale && typeof sanitized.guidance_scale === 'string') {
      sanitized.guidance_scale = parseFloat(sanitized.guidance_scale);
    }
  }

  // Models that need duration without "s" suffix (expect plain string numbers like "5", "8")
  const modelsNeedingPlainDuration = [
    'minimax',
    'pixverse',
    'kling',
    'hunyuan',
    'wan',
    'ovi',
    'kandinsky',
    'ltxv',
    'lucy',
    'omnihuman'
  ];

  // Models that need duration WITH "s" suffix (expect "5s", "8s", etc.)
  const modelsNeedingSDuration = [
    'veo3',
    'luma-dream-machine'
  ];

  if (modelsNeedingPlainDuration.some(modelName => model.includes(modelName))) {
    // Strip "s" suffix from duration for models expecting plain numbers
    if (sanitized.duration && typeof sanitized.duration === 'string') {
      sanitized.duration = sanitized.duration.replace('s', '');
    }
  }

  if (modelsNeedingSDuration.some(modelName => model.includes(modelName))) {
    // Add "s" suffix to duration for models expecting "5s", "8s" format
    if (sanitized.duration && typeof sanitized.duration === 'string' && !sanitized.duration.endsWith('s')) {
      sanitized.duration = sanitized.duration + 's';
    }
  }

  if (model.includes('minimax')) {
    // Minimax models have specific parameter requirements
    if (sanitized.text && !sanitized.prompt) {
      sanitized.prompt = sanitized.text;
      delete sanitized.text;
    }
    
    // MiniMax Music requires lyrics_prompt field
    if (model.includes('minimax-music')) {
      if (sanitized.prompt && !sanitized.lyrics_prompt) {
        sanitized.lyrics_prompt = sanitized.prompt;
      }
    }
  }

  if (model.includes('playht') || model.includes('elevenlabs') || model.includes('f5-tts')) {
    // TTS models expect text parameter
    if (sanitized.prompt && !sanitized.text) {
      sanitized.text = sanitized.prompt;
      delete sanitized.prompt;
    }
  }

  if (model.includes('reve/remix')) {
    // Reve Remix expects image_urls array (1-4 images)
    if (sanitized.image_url && !sanitized.image_urls) {
      // Convert single image_url to image_urls array
      sanitized.image_urls = [sanitized.image_url];
      delete sanitized.image_url;
    }
    // Ensure output_format defaults to jpeg for compatibility
    if (!sanitized.output_format) {
      sanitized.output_format = 'jpeg';
    }
  }

  if (model.includes('reve/text-to-image') || model.includes('reve/edit')) {
    // Reve models expect specific parameters
    console.log('🔧 [FAL API] Processing Reve model parameters:', model);
    console.log('🔧 [FAL API] Input before sanitization:', sanitized);
    
    // Ensure required parameters are present
    if (model.includes('reve/text-to-image')) {
      if (!sanitized.prompt) {
        console.error('❌ [FAL API] Reve text-to-image requires prompt');
        throw new Error('Prompt is required for Reve text-to-image');
      }
    }
    
    if (model.includes('reve/edit')) {
      if (!sanitized.prompt) {
        console.error('❌ [FAL API] Reve edit requires prompt');
        throw new Error('Prompt is required for Reve edit');
      }
      if (!sanitized.image_url) {
        console.error('❌ [FAL API] Reve edit requires image_url');
        throw new Error('Image URL is required for Reve edit');
      }
    }
    
    // Set default values if not provided
    if (!sanitized.aspect_ratio) {
      sanitized.aspect_ratio = '3:2'; // Default from documentation
    }
    if (!sanitized.num_images) {
      sanitized.num_images = 1; // Default from documentation
    }
    if (!sanitized.output_format) {
      sanitized.output_format = 'png'; // Default from documentation
    }
    if (sanitized.sync_mode === undefined) {
      sanitized.sync_mode = false; // Default from documentation
    }
    
    console.log('🔧 [FAL API] Sanitized input for Reve model:', sanitized);
  }

  return sanitized;
}

// Helper function to determine if model should use subscription or run
function shouldUseSubscription(model: string): boolean {
  // Models that typically require longer processing time
  const subscriptionModels = [
    'fal-ai/veo3',
    'fal-ai/minimax',
    'fal-ai/hunyuan',
    'fal-ai/kling',
    'fal-ai/luma-dream-machine/ray-2',
    'fal-ai/luma-dream-machine/ray-2-flash',
    'fal-ai/pixverse',
    'fal-ai/flux-lora-training',
    'fal-ai/hunyuan-video-lora-training'
  ];

  return subscriptionModels.some(subModel => model.includes(subModel));
}

// Handle GET requests
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    initializeFalClient();
    console.log('🔍 [FAL API] Handling GET request');
    const url = new URL(request.url);
    const model = url.searchParams.get('model');
    const input = url.searchParams.get('input');
    const isSubscription = url.searchParams.get('subscription') === 'true';

    if (!model) {
      return NextResponse.json({ error: "Model parameter is required" }, { status: 400 });
    }

    const parsedInput = input ? JSON.parse(input) : {};
    const sanitizedInput = sanitizeInput(model, parsedInput);

    console.log('🎯 [FAL API] Processing GET request for model:', model);
    console.log('📝 [FAL API] Input:', sanitizedInput);

    if (isSubscription || shouldUseSubscription(model)) {
      const result = await fal.subscribe(model, {
        input: sanitizedInput,
        logs: true,
        onQueueUpdate: (status: any) => {
          if (status.status === "IN_PROGRESS" && status.logs) {
            status.logs.forEach((log: any) => console.log(`📊 [FAL API] ${log.message}`));
          }
        }
      });
      console.log('✅ [FAL API] GET subscription request successful');
      return NextResponse.json(result);
    }

    const result = await fal.run(model, sanitizedInput);
    console.log('✅ [FAL API] GET request successful');
    return NextResponse.json(result);
  } catch (error) {
    logError(error as FalError, 'GET');
    return NextResponse.json(
      { error: "Failed to process GET request" },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    initializeFalClient();
    console.log('🔍 [FAL API] Handling POST request');
    const body = await request.json();
    console.log('📦 [FAL API] Request body:', body);

    // Extract model and input from the request body
    const model = body.model || body.endpoint || body.endpointId;
    
    if (!model) {
      console.error('❌ [FAL API] Missing model parameter');
      return NextResponse.json({ error: "Model parameter is required" }, { status: 400 });
    }

    // Build input object from various possible sources
    const input = {
      // Standard parameters
      prompt: body.prompt || body.text,
      image_url: body.image_url || body.image,
      image_urls: body.image_urls, // For multi-image models like reve/remix
      video_url: body.video_url || body.video,
      audio_url: body.audio_url || body.audio,
      
      // Video-specific parameters
      duration: body.duration,
      aspect_ratio: body.aspect_ratio,
      resolution: body.resolution,
      fps: body.fps,
      num_frames: body.num_frames,
      
      // Image-specific parameters
      num_inference_steps: body.num_inference_steps,
      guidance_scale: body.guidance_scale,
      
      // Audio/TTS parameters
      voice: body.voice,
      text: body.text,
      
      // Style parameters
      style_strength: body.style_strength,
      subject_strength: body.subject_strength,
      
      // Output format
      output_format: body.output_format,
      sync_mode: body.sync_mode,
      
      // Additional parameters
      ...body.input,
      ...body.parameters
    };

    const sanitizedInput = sanitizeInput(model, input);

    console.log('🎯 [FAL API] Processing POST request for model:', model);
    console.log('📝 [FAL API] Sanitized input:', sanitizedInput);

    // Determine if we should use subscription or run
    const useSubscription = shouldUseSubscription(model);

    if (useSubscription) {
      const result = await fal.subscribe(model, {
        input: sanitizedInput,
        logs: true,
        pollInterval: 2000, // Poll every 2 seconds
        onQueueUpdate: (status: any) => {
          console.log(`📊 [FAL API] Queue status: ${status.status}`);
          if (status.status === "IN_PROGRESS" && status.logs) {
            status.logs.forEach((log: any) => console.log(`📊 [FAL API] ${log.message}`));
          }
        }
      });

      console.log('✅ [FAL API] POST subscription request successful');
      return NextResponse.json({
        success: true,
        data: result,
        requestId: result.requestId || 'unknown',
        status: 'completed'
      });
    } else {
      const result = await fal.run(model, sanitizedInput);
      console.log('✅ [FAL API] POST run request successful');
      return NextResponse.json({
        success: true,
        data: result,
        status: 'completed'
      });
    }

  } catch (error) {
    logError(error as FalError, 'POST');
    console.error('❌ [FAL API] Full error details:', error);
    const falError = error as FalError;
    
    return NextResponse.json(
      { 
        success: false,
        error: falError.message || "Failed to process POST request",
        details: falError.details || null
      },
      { status: falError.status || 500 }
    );
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
