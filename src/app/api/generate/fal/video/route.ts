import { NextResponse } from "next/server";
import { fal, subscribeToModel } from "@/lib/fal.server";
import { getAspectRatioDimensions, isAspectRatioSupported } from "@/lib/utils";
import { STYLE_PRESETS, getModelStyleSupport } from "@/lib/fal";

// FAL_KEY validation moved to runtime in POST function

export const runtime = "edge";

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // Check FAL_KEY at runtime
    if (!process.env.FAL_KEY) {
      console.error('❌ [FAL Video Generate] FAL_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'FAL_KEY environment variable is not configured' },
        { status: 500 }
      );
    }
    console.log(`🎬 [FAL Video Generate] ===== VIDEO GENERATION REQUEST START [${requestId}] =====`);
    console.log(`🎬 [FAL Video Generate] Timestamp: ${new Date().toISOString()}`);
    
    const body = await request.json();
    console.log(`🎬 [FAL Video Generate] [${requestId}] Request received:`, {
      model: body.model,
      prompt: body.prompt?.substring(0, 100) + '...',
      hasImage: !!body.image_url,
      imageUrl: body.image_url,
      aspectRatio: body.aspect_ratio,
      stylePresetId: body.style_preset_id,
      styleReferenceUrl: body.style_reference_url,
      allKeys: Object.keys(body)
    });
    const {
      model,
      prompt,
      subject_reference_image_url,
      image_url,
      prompt_optimizer = true,
      aspect_ratio,
      style_preset_id,
      style_reference_url,
      style_strength = 0.8,
      ...otherParams
    } = body;

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check model style support
    const styleSupport = getModelStyleSupport(model);
    
    // Validate style parameters
    if (style_preset_id && !styleSupport.supportsStylePresets) {
      return NextResponse.json(
        { error: `Model ${model} does not support style presets` },
        { status: 400 }
      );
    }

    if (style_reference_url && !styleSupport.supportsStyleReference) {
      return NextResponse.json(
        { error: `Model ${model} does not support style reference images` },
        { status: 400 }
      );
    }

    if (style_strength > styleSupport.maxStyleStrength) {
      return NextResponse.json(
        { error: `Style strength must be between 0 and ${styleSupport.maxStyleStrength}` },
        { status: 400 }
      );
    }

    // Validate aspect ratio if provided
    if (aspect_ratio && !isAspectRatioSupported(model, aspect_ratio)) {
      return NextResponse.json(
        { error: `Aspect ratio ${aspect_ratio} is not supported by model ${model}` },
        { status: 400 }
      );
    }

    // Get dimensions for the aspect ratio if needed
    const dimensions = aspect_ratio ? getAspectRatioDimensions(aspect_ratio) : null;

    // Handle style parameters
    let enhancedPrompt = prompt;
    if (style_preset_id && styleSupport.supportsStylePresets) {
      const preset = STYLE_PRESETS.find((p) => p.id === style_preset_id);
      if (preset) {
        enhancedPrompt = `${prompt}, ${preset.prompt}`;
      }
    }

    // Prepare style reference object if needed
    const styleReference = style_reference_url && styleSupport.supportsStyleReference
      ? {
          style_reference: {
            url: style_reference_url,
            weight: style_strength
          }
        }
      : {};

    if (model === "fal-ai/hunyuan-video") {
      const input = {
        prompt: enhancedPrompt,
        aspect_ratio,
        style_strength,
        ...styleReference,
        ...otherParams
      };

      console.log(`🎬 [FAL Video Generate] [${requestId}] Calling Hunyuan model with input:`, input);
      
      const result = await subscribeToModel("hunyuan", {
        input,
        logs: true,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [FAL Video Generate] [${requestId}] Hunyuan generation successful`);
      console.log(`✅ [FAL Video Generate] [${requestId}] Total duration: ${duration}ms`);
      console.log(`🎬 [FAL Video Generate] [${requestId}] ===== VIDEO GENERATION REQUEST COMPLETED =====`);
      
      return NextResponse.json({
        ...result,
        requestId: requestId,
        duration: duration
      });
    }

    if (model === "fal-ai/minimax/video-01-live/image-to-video") {
      if (!image_url) {
        return NextResponse.json(
          { error: "Image URL is required for Minimax I2V" },
          { status: 400 }
        );
      }

      const input = {
        prompt: enhancedPrompt,
        image_url,
        prompt_optimizer,
        style_strength,
        ...styleReference,
        ...otherParams
      };

      console.log(`🎬 [FAL Video Generate] [${requestId}] Calling Minimax I2V model with input:`, input);
      
      const result = await subscribeToModel("minimax-i2v", {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log(`📊 [FAL Video Generate] [${requestId}] Minimax I2V progress:`, {
            status: update.status,
            logs: update.logs?.length || 0
          });
          if (update.status === "IN_PROGRESS") {
            update.logs?.forEach((log: any) => {
              console.log(`📊 [FAL Video Generate] [${requestId}] Progress log:`, log.message);
            });
          }
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [FAL Video Generate] [${requestId}] Minimax I2V generation successful`);
      console.log(`✅ [FAL Video Generate] [${requestId}] Total duration: ${duration}ms`);
      console.log(`🎬 [FAL Video Generate] [${requestId}] ===== VIDEO GENERATION REQUEST COMPLETED =====`);
      
      return NextResponse.json({
        ...result,
        requestId: requestId,
        duration: duration
      });
    }

    if (model === "fal-ai/minimax/video-01-subject-reference") {
      if (!subject_reference_image_url) {
        return NextResponse.json(
          { error: "Subject reference image is required" },
          { status: 400 }
        );
      }

      const input = {
        prompt: enhancedPrompt,
        subject_reference_image_url,
        prompt_optimizer,
        style_strength,
        ...styleReference,
        ...(dimensions && {
          width: dimensions.width,
          height: dimensions.height
        }),
        ...otherParams
      };

      console.log(`🎬 [FAL Video Generate] [${requestId}] Calling Minimax Subject model with input:`, input);
      
      const result = await subscribeToModel("minimax-subject", {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          console.log(`📊 [FAL Video Generate] [${requestId}] Minimax Subject progress:`, {
            status: update.status,
            logs: update.logs?.length || 0
          });
          if (update.status === "IN_PROGRESS") {
            update.logs?.forEach((log: any) => {
              console.log(`📊 [FAL Video Generate] [${requestId}] Progress log:`, log.message);
            });
          }
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ [FAL Video Generate] [${requestId}] Minimax Subject generation successful`);
      console.log(`✅ [FAL Video Generate] [${requestId}] Total duration: ${duration}ms`);
      console.log(`🎬 [FAL Video Generate] [${requestId}] ===== VIDEO GENERATION REQUEST COMPLETED =====`);
      
      return NextResponse.json({
        ...result,
        requestId: requestId,
        duration: duration
      });
    }

    console.log(`❌ [FAL Video Generate] [${requestId}] Unsupported model:`, model);
    return NextResponse.json(
      { error: "Unsupported model", requestId: requestId },
      { status: 400 }
    );
  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ [FAL Video Generate] [${requestId}] Error in video generation:`, {
      error: error.message,
      stack: error.stack,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🎬 [FAL Video Generate] [${requestId}] ===== VIDEO GENERATION REQUEST ERROR =====`);
    
    return NextResponse.json(
      { 
        error: "Failed to generate video", 
        requestId: requestId,
        duration: duration,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
