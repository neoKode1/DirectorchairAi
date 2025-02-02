import { NextResponse } from "next/server";

interface PhotonRequestBody {
  prompt: string;
  generation_type: "image";
  model: "photon-1" | "photon-flash-1" | string;
  aspect_ratio?: string;
  negative_prompt?: string;
  seed?: number;
  num_steps?: number;
  guidance_scale?: number;
  image_url?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PhotonRequestBody;
    console.log("[PHOTON] Received request:", body);

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Normalize model value
    const model = (body.model === "photon" || !body.model) ? "photon-1" : body.model;

    // Construct the payload for Luma API
    const payload = {
      prompt: body.prompt,
      generation_type: "image",
      model,
      aspect_ratio: body.aspect_ratio || "1:1",
      negative_prompt: body.negative_prompt,
      seed: body.seed,
      num_steps: body.num_steps || 50,
      guidance_scale: body.guidance_scale || 7.5,
      image_url: body.image_url,
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    console.log("[PHOTON] Sending to Luma API:", payload);

    // Make request to Luma API
    const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.LUMA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[PHOTON] Luma API error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to generate image" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[PHOTON] Luma API response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTON] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${id}`,
      {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.LUMA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || "Failed to fetch generation status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PHOTON] Error fetching generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 