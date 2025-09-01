import { NextResponse } from "next/server";
import { createFalClient } from "@fal-ai/client";

interface QueueUpdate {
  status: string;
  logs: Array<{ message: string }>;
}

// Only validate FAL_KEY at runtime, not during build
const getFalClient = () => {
  if (!process.env.FAL_KEY) {
    throw new Error("FAL_KEY environment variable not set");
  }
  return createFalClient({
    credentials: process.env.FAL_KEY,
  });
};

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const fal = getFalClient();
    const body = await req.json();
    const { prompt, image_size, style, colors, style_id } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const result = await fal.subscribe("fal-ai/recraft-20b", {
      input: {
        prompt,
        image_size,
        style,
        colors,
        style_id,
      },
      logs: true,
      onQueueUpdate: (update: QueueUpdate) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in Recraft generation:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
