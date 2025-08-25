import { NextResponse } from "next/server";
import { fal } from "@/lib/fal.server";

export const runtime = "edge";

interface FalAudioInput {
  prompt: string;
  duration?: number;
  model?: string;
  num_steps?: number;
  cfg_strength?: number;
}

interface AudioGenerationResponse {
  id: string;
  generation_type: string;
  state: string;
  created_at: string;
  output_url?: string;
  prompt: string;
  model?: string;
}

export async function POST(req: Request) {
  try {
    const { prompt, num_steps, duration, cfg_strength, model } =
      await req.json() as FalAudioInput;

    // Log the request for debugging
    console.log("[API] Generating audio with params:", {
      prompt,
      num_steps,
      duration,
      cfg_strength,
      model,
    });

    // Call the fal.ai API
    const result = await fal.subscribe("fal-ai/musicgen", {
      input: {
        prompt,
        duration: duration || 8,
        model: model || "facebook/musicgen-small",
        num_steps: num_steps || 50,
        cfg_strength: cfg_strength || 7,
      },
    });

    // Log the result for debugging
    console.log("[API] Generation result:", result);

    const response: AudioGenerationResponse = {
      id: (result as any).requestId,
      generation_type: "audio",
      state: "completed",
      created_at: new Date().toISOString(),
      output_url: (result as any).outputUrl,
      prompt,
      model,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[API] Generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate audio",
      },
      { status: 500 },
    );
  }
}
