import { NextResponse } from "next/server";
import { fal } from "@/lib/fal-server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Log the upload request
    console.log("[API] Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Upload to fal.ai storage
    const url = await fal.storage.upload(file);

    // Log the result
    console.log("[API] Upload complete:", { url });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[API] Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
} 