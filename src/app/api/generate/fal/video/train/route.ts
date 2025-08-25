import { NextResponse } from "next/server";
import { subscribeToModel } from "@/lib/fal.server";

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

    if (model === "hunyuan-lora") {
      const result = await subscribeToModel("hunyuan-lora", {
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
      { status: 500 },
    );
  }
}
