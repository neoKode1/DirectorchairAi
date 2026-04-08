import { NextRequest, NextResponse } from "next/server";
import { createFalClient } from '@fal-ai/client';

// Create a dedicated server-side fal client (avoids singleton proxyUrl contamination)
const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

export const runtime = "edge";

interface FalError extends Error {
  status?: number;
  details?: unknown;
}

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

  if (model.includes('minimax')) {
    // Minimax models have specific parameter requirements
    if (sanitized.text && !sanitized.prompt) {
      sanitized.prompt = sanitized.text;
      delete sanitized.text;
    }
    if (sanitized.duration && typeof sanitized.duration === 'string') {
      sanitized.duration = sanitized.duration.replace('s', '');
    }
  }

  if (model.includes('veo3')) {
    // Veo3 specific parameters
    if (sanitized.duration && typeof sanitized.duration === 'string') {
      sanitized.duration = sanitized.duration.replace('s', '');
    }
  }

  if (model.includes('luma-dream-machine/ray-2') || model.includes('luma-dream-machine/ray-2-flash')) {
    // Luma Ray 2 models specific parameters
    if (sanitized.duration && typeof sanitized.duration === 'string') {
      sanitized.duration = sanitized.duration.replace('s', '');
    }
  }

  if (model.includes('playht') || model.includes('elevenlabs') || model.includes('f5-tts')) {
    // TTS models expect text parameter
    if (sanitized.prompt && !sanitized.text) {
      sanitized.text = sanitized.prompt;
      delete sanitized.prompt;
    }
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
        requestId: result.requestId || (result as any).id,
        status: (result as any).status || 'queued'
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
export async function OPTIONS(_request: NextRequest): Promise<NextResponse> {
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
