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
      images_data_url,
      steps,
      learning_rate,
      do_caption,
      trigger_word,
      model,
    } = body;

    if (model === "fal-ai/hunyuan-video-lora-training") {
      const result = await fal.subscribe("fal-ai/hunyuan-video-lora-training", {
        input: {
          images_data_url,
          steps,
          learning_rate,
          do_caption,
          trigger_word,
        },
        logs: true,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
  } catch (error) {
    console.error("Error in LoRA training:", error);
    return NextResponse.json(
      { error: "Failed to train LoRA model" },
      { status: 500 }
    );
  }
} 