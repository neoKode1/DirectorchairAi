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
    const { image_url, audio_url, model } = await request.json();

    if (model !== "fal-ai/wav2lip") {
      return NextResponse.json(
        { error: "Unsupported model for this endpoint" },
        { status: 400 },
      );
    }

    const result = await fal.subscribe("fal-ai/wav2lip", {
      input: {
        image_url,
        audio_url,
      },
      pollInterval: 5000,
      logs: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in wav2lip:", error);
    return NextResponse.json(
      { error: "Failed to process wav2lip request" },
      { status: 500 },
    );
  }
}
