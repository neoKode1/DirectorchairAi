import { NextRequest, NextResponse } from "next/server";
import { falClient } from "@/lib/fal.client";
import { FAL_ENDPOINTS } from "@/lib/fal.server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, video_url, num_steps, duration, cfg_strength } = body;

    if (model === "mmaudio") {
      const input = {
        prompt,
        num_steps: num_steps || 50,
        duration: duration || 5,
        cfg_strength: cfg_strength || 7.5,
        ...(video_url && { video_url })
      };

      const result = await falClient.subscribe(FAL_ENDPOINTS["mmaudio-v2"], {
        input,
        logs: true
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in audio generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate audio" },
      { status: error.status || 500 },
    );
  }
}
