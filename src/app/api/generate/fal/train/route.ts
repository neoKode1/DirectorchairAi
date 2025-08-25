import { NextResponse } from "next/server";
import { createFalClient } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY environment variable is not set");
}

const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: Request) {
  try {
    const {
      images_data_url,
      steps,
      trigger_word,
      create_masks,
      is_style,
      is_input_format_already_preprocessed,
      model,
    } = await request.json();

    if (model !== "fal-ai/flux-lora-training") {
      return NextResponse.json(
        { error: "Unsupported model for this endpoint" },
        { status: 400 },
      );
    }

    const result = await fal.subscribe("fal-ai/flux-lora-training", {
      input: {
        images_data_url,
        steps,
        trigger_word,
        create_masks,
        is_style,
        is_input_format_already_preprocessed,
      },
      pollInterval: 5000,
      logs: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in FLUX LoRA training:", error);
    return NextResponse.json(
      { error: "Failed to process FLUX LoRA training request" },
      { status: 500 },
    );
  }
}
