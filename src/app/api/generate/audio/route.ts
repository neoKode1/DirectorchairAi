import { NextResponse } from "next/server";
import { fal } from "@/lib/fal-server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, num_steps, duration, cfg_strength, model } = await req.json();

    // Log the request for debugging
    console.log("[API] Generating audio with params:", {
      prompt,
      num_steps,
      duration,
      cfg_strength,
      model,
    });

    // Call the fal.ai API
    const result = await fal.subscribe("fal-ai/mmaudio-v2/text-to-audio", {
      input: {
        prompt,
        num_steps,
        duration,
        cfg_strength,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[API] Generation status:", update.logs.map(log => log.message));
        }
      },
    });

    // Log the result for debugging
    console.log("[API] Generation result:", result);

    return NextResponse.json({
      id: result.requestId,
      generation_type: "audio",
      state: "completed",
      created_at: new Date().toISOString(),
      audio: result.data.audio,
      prompt,
      model,
    });
  } catch (error: any) {
    console.error("[API] Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate audio" },
      { status: 500 }
    );
  }
} 