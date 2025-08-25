import { NextResponse } from "next/server";
import { fal, subscribeToModel } from "@/lib/fal.server";
import { getAspectRatioDimensions, isAspectRatioSupported } from "@/lib/utils";
import { STYLE_PRESETS, getModelStyleSupport } from "@/lib/fal";

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY environment variable is not set");
}

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

      const result = await subscribeToModel("hunyuan", {
        input,
        logs: true,
      });

      return NextResponse.json(result);
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

      const result = await subscribeToModel("minimax-i2v", {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs);
          }
        },
      });

      return NextResponse.json(result);
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

      const result = await subscribeToModel("minimax-subject", {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs);
          }
        },
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Unsupported model" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in video generation:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
