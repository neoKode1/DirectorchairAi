import { NextRequest, NextResponse } from "next/server";
import { fal } from '@fal-ai/client';

// Simplified generate route that focuses on prompt adherence and FAL compatibility
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('🔍 [Simple Generate API] Request body:', body);

    // Extract model and prompt - these are the only required fields
    const model = body.model || body.endpoint || body.endpointId;
    const prompt = body.prompt;
    
    if (!model) {
      console.error('❌ [Simple Generate API] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    if (!prompt) {
      console.error('❌ [Simple Generate API] Missing prompt parameter');
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required" 
      }, { status: 400 });
    }

    console.log('🎯 [Simple Generate API] Processing request for model:', model);
    console.log('📝 [Simple Generate API] User prompt:', prompt);

    // Create FAL-compatible input parameters
    const input: Record<string, any> = {
      prompt: prompt.trim()
    };

    // Add optional parameters that FAL expects
    if (body.image_url) {
      input.image_url = body.image_url;
    }
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

    // Add model-specific parameters
    if (model.includes('flux-pro')) {
      input.num_inference_steps = body.num_inference_steps || 30;
      input.guidance_scale = body.guidance_scale || 7.5;
      input.num_images = body.num_images || 1;
      input.output_format = body.output_format || "jpeg";
      input.safety_tolerance = body.safety_tolerance || "2";
    }

    if (model.includes('veo3')) {
      input.enhance_prompt = body.enhance_prompt !== false; // Default to true
      input.auto_fix = body.auto_fix !== false; // Default to true
      input.generate_audio = body.generate_audio !== false; // Default to true
    }

    if (model.includes('kling')) {
      input.cfg_scale = body.cfg_scale || 0.5;
    }

    console.log('📦 [Simple Generate API] FAL input parameters:', input);

    // Call FAL API directly
    try {
      console.log('🔗 [Simple Generate API] Calling FAL API for model:', model);
      
      const result = await fal.subscribe(model, {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log('📊 [Simple Generate API] Queue update:', update.status);
          if (update.status === "IN_PROGRESS") {
            update.logs?.map((log: any) => log.message).forEach(console.log);
          }
        },
      });

      console.log('✅ [Simple Generate API] FAL API call successful');
      console.log('📦 [Simple Generate API] Result:', result);

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
      console.error('❌ [Simple Generate API] FAL API error:', falError);
      
      return NextResponse.json({
        success: false,
        error: 'FAL API call failed',
        details: falError.message || 'Unknown FAL error',
        model: model,
        prompt: prompt
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [Simple Generate API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process generation request",
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
