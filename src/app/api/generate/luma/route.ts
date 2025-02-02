import { NextResponse } from "next/server";
import { LumaAI } from "lumaai";
import { LUMA_MODELS, validateLumaParams, type LumaModelParams } from "@/lib/lumaai";

if (!process.env.LUMAAI_API_KEY) {
  throw new Error("LUMAAI_API_KEY environment variable is not set");
}

// Initialize Luma client
const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure the model (default is "ray2") and the remaining parameters
    const { model = "ray2", ...params } = body;

    // Normalize the model identifier:
    // For "ray2" we need to send "ray-2". For other values (e.g. "ray1.6") we pass them as-is.
    const lumamodel = model === "ray2" ? "ray-2" : model;

    // Get the model configuration based on the normalized model
    const modelConfig = lumamodel === "ray-2" ? LUMA_MODELS.RAY2 : LUMA_MODELS.RAY1_6;

    // Validate parameters
    const validationError = validateLumaParams(params as LumaModelParams, modelConfig);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // Prepare keyframes if they exist and have valid URLs
    const keyframes: any = {};
    if (params.keyframes?.frame0?.url) {
      keyframes.frame0 = {
        type: "image",
        url: params.keyframes.frame0.url
      };
    }
    if (params.keyframes?.frame1?.url) {
      keyframes.frame1 = {
        type: "image",
        url: params.keyframes.frame1.url
      };
    }

    // Create generation with core parameters using the normalized model
    const generation = await client.generations.create({
      prompt: params.prompt,
      model: lumamodel,
      aspect_ratio: params.aspect_ratio,
      loop: params.loop,
      ...(Object.keys(keyframes).length > 0 ? { keyframes } : {})
    });

    // Poll for completion
    let completed = false;
    let finalGeneration = generation;

    while (!completed) {
      if (!finalGeneration.id) {
        throw new Error("No generation ID received");
      }

      finalGeneration = await client.generations.get(finalGeneration.id);

      if (finalGeneration.state === "completed") {
        completed = true;
      } else if (finalGeneration.state === "failed") {
        throw new Error(`Generation failed: ${finalGeneration.failure_reason}`);
      } else {
        // Wait 5 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return NextResponse.json(finalGeneration);
  } catch (error: any) {
    console.error("Error in Luma video generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate video" },
      { status: error.status || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      models: [
        {
          id: "ray2",
          name: LUMA_MODELS.RAY2.name,
          description: LUMA_MODELS.RAY2.description,
          category: LUMA_MODELS.RAY2.category,
        },
        {
          id: "ray1.6",
          name: LUMA_MODELS.RAY1_6.name,
          description: LUMA_MODELS.RAY1_6.description,
          category: LUMA_MODELS.RAY1_6.category,
        },
      ],
    },
    { status: 200 }
  );
} 