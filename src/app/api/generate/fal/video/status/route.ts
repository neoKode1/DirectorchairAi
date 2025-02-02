import { NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { model, request_id } = await request.json();

    if (!model || !request_id) {
      return NextResponse.json(
        { error: "Model and request_id are required" },
        { status: 400 }
      );
    }

    const result = await fal.queue.result(model, {
      requestId: request_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking video status:", error);
    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 }
    );
  }
} 