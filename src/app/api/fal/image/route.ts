import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Image-specific FAL proxy that handles all image generation models
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('🖼️ [FAL Image Proxy] Request received:', {
      model: body.model,
      prompt: body.prompt?.substring(0, 100) + '...',
      hasImage: !!body.image_url
    });

    // Extract model and prompt - these are required
    const model = body.model || body.endpoint || body.endpointId;
    const prompt = body.prompt;
    
    if (!model) {
      console.error('❌ [FAL Image Proxy] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    if (!prompt) {
      console.error('❌ [FAL Image Proxy] Missing prompt parameter');
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required" 
      }, { status: 400 });
    }

    // Create clean FAL-compatible input parameters
    const input: Record<string, any> = {
      prompt: prompt.trim()
    };

    // Add image_url if provided (for image-to-image)
    if (body.image_url) {
      input.image_url = body.image_url;
    }

    // Add image_urls if provided (for nano-banana/edit)
    if (body.image_urls) {
      input.image_urls = body.image_urls;
    }

    // Add image-specific parameters that FAL expects
    if (body.aspect_ratio) {
      input.aspect_ratio = body.aspect_ratio;
    }
    if (body.num_images !== undefined) {
      input.num_images = body.num_images;
    }
    if (body.output_format) {
      input.output_format = body.output_format;
    }
    if (body.negative_prompt) {
      input.negative_prompt = body.negative_prompt;
    }
    if (body.seed !== undefined) {
      input.seed = body.seed;
    }
    if (body.enable_safety_checker !== undefined) {
      input.enable_safety_checker = body.enable_safety_checker;
    }
    if (body.safety_tolerance) {
      input.safety_tolerance = body.safety_tolerance;
    }

    // Model-specific parameters
    if (model.includes('flux-pro')) {
      if (body.num_inference_steps !== undefined) {
        input.num_inference_steps = body.num_inference_steps;
      }
      if (body.guidance_scale !== undefined) {
        input.guidance_scale = body.guidance_scale;
      }
      if (body.enhance_prompt !== undefined) {
        input.enhance_prompt = body.enhance_prompt;
      }
      if (body.raw !== undefined) {
        input.raw = body.raw;
      }
    }

    if (model.includes('flux-krea-lora')) {
      if (body.strength !== undefined) {
        input.strength = body.strength;
      }
      if (body.num_inference_steps !== undefined) {
        input.num_inference_steps = body.num_inference_steps;
      }
      if (body.guidance_scale !== undefined) {
        input.guidance_scale = body.guidance_scale;
      }
    }

    if (model.includes('stable-diffusion')) {
      if (body.num_inference_steps !== undefined) {
        input.num_inference_steps = body.num_inference_steps;
      }
      if (body.guidance_scale !== undefined) {
        input.guidance_scale = body.guidance_scale;
      }
    }

    if (model.includes('dreamina')) {
      if (body.image_size) {
        input.image_size = body.image_size;
      }
      if (body.enhance_prompt !== undefined) {
        input.enhance_prompt = body.enhance_prompt;
      }
    }

    if (model.includes('imagen4')) {
      if (body.aspect_ratio) {
        input.aspect_ratio = body.aspect_ratio;
      }
      if (body.num_images !== undefined) {
        input.num_images = body.num_images;
      }
    }

    if (model.includes('ideogram')) {
      if (body.reference_image_urls) {
        input.reference_image_urls = body.reference_image_urls;
      }
      if (body.image_size) {
        input.image_size = body.image_size;
      }
      if (body.style) {
        input.style = body.style;
      }
      if (body.rendering_speed) {
        input.rendering_speed = body.rendering_speed;
      }
      if (body.expand_prompt !== undefined) {
        input.expand_prompt = body.expand_prompt;
      }
    }

    if (model.includes('nano-banana/edit')) {
      if (body.image_urls) {
        input.image_urls = body.image_urls;
      }
      if (body.num_images !== undefined) {
        input.num_images = body.num_images;
      }
      if (body.output_format) {
        input.output_format = body.output_format;
      }
      if (body.strength !== undefined) {
        input.strength = body.strength;
      }
      if (body.guidance_scale !== undefined) {
        input.guidance_scale = body.guidance_scale;
      }
    }

    console.log('📦 [FAL Image Proxy] Clean FAL input parameters:', input);

    // Call FAL API directly with subscription
    try {
      console.log('🔗 [FAL Image Proxy] Calling FAL API for model:', model);
      
      const result = await fal.subscribe(model, {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log('📊 [FAL Image Proxy] Queue update:', update.status);
          if (update.status === "IN_PROGRESS" && update.logs) {
            update.logs.map((log: any) => log.message).forEach(console.log);
          }
        },
      });

      console.log('✅ [FAL Image Proxy] FAL API call successful');
      console.log('📦 [FAL Image Proxy] Result:', result);

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
      console.error('❌ [FAL Image Proxy] FAL API error:', falError);
      
      return NextResponse.json({
        success: false,
        error: 'FAL API call failed',
        details: falError.message || 'Unknown FAL error',
        model: model,
        prompt: prompt
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [FAL Image Proxy] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process image generation request",
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: "FAL Image Proxy - Use POST for image generation",
    supportedModels: [
      "fal-ai/imagen4/preview",
      "fal-ai/stable-diffusion-v35-large",
      "fal-ai/bytedance/dreamina/v3.1/text-to-image",
      "fal-ai/flux-pro/v1.1-ultra",
      "fal-ai/flux-pro/kontext",
      "fal-ai/flux-krea-lora/image-to-image",
      "fal-ai/nano-banana/edit",
      "fal-ai/ideogram/character"
    ]
  });
}
