import { NextRequest, NextResponse } from "next/server";
import { LumaAI } from "lumaai";

if (!process.env.LUMAAI_API_KEY) {
  throw new Error("LUMAAI_API_KEY environment variable is not set");
}

// Initialize Luma client
const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY });

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 },
      );
    }

    const generation = await client.generations.get(id);
    return NextResponse.json(generation);
  } catch (error: any) {
    console.error("Error fetching Luma generation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch generation status" },
      { status: error.status || 500 },
    );
  }
}
