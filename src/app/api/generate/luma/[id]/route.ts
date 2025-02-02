import { NextResponse } from "next/server";
import { LumaAI } from "lumaai";

if (!process.env.LUMAAI_API_KEY) {
  throw new Error("LUMAAI_API_KEY environment variable is not set");
}

// Initialize Luma client
const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY });

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 }
      );
    }

    const generation = await client.generations.get(id);
    return NextResponse.json(generation);
  } catch (error: any) {
    console.error("Error fetching Luma generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch generation status" },
      { status: error.status || 500 }
    );
  }
} 