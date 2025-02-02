import { NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      model,
      video_url,
      num_steps,
      duration,
      cfg_strength,
    } = body;

    if (model === "fal-ai/mmaudio-v2/video-to-video" || model === "fal-ai/mmaudio-v2/text-to-video") {
      const input: any = {
        prompt,
        num_steps,
        duration,
        cfg_strength,
      };

      // Only include video_url for video-to-video variant
      if (model === "fal-ai/mmaudio-v2/video-to-video") {
        input.video_url = video_url;
      }

      const result = await fal.subscribe(model, {
        input,
        logs: true,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
  } catch (error) {
    console.error("Error in audio generation:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
} 