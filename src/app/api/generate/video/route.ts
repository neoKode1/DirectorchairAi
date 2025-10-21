import { NextResponse } from "next/server";
// Placeholder function for Luma video generation
const luma = {
  generate: async (params: any) => {
    throw new Error("Luma video generation not implemented");
  },
  generateVideo: async (params: any) => {
    return {
      id: "placeholder",
      state: "completed",
      output: { url: "placeholder" }
    };
  },
  getGeneration: async (id: string) => {
    return {
      id,
      state: "completed",
      output: { url: "placeholder" },
      failure_reason: undefined
    };
  }
};

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, image_url, aspect_ratio, duration, callback_url } =
      await req.json();

    // Log the request for debugging
    console.log("[API] Generating video with params:", {
      prompt,
      image_url,
      aspect_ratio,
      duration,
      callback_url,
    });

    // Prepare the request for Luma
    const request = {
      prompt,
      model: "ray-2",
      resolution: "720p",
      aspect_ratio,
      duration,
      loop: true,
      callback_url,
      ...(image_url && {
        keyframes: {
          frame0: {
            type: "image" as const,
            url: image_url,
          },
        },
      }),
    };

    // Call the Luma API
    let result = await luma.generateVideo(request);
    console.log("[API] Initial generation response:", result);

    // If no callback URL is provided, poll for updates
    if (!callback_url && result.state !== "completed") {
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes maximum (with 5s intervals)

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        const updatedResult = await luma.getGeneration(result.id);
        console.log(
          `[API] Generation status (attempt ${attempts + 1}):`,
          updatedResult.state,
        );

        if (updatedResult.state === "completed") {
          result = updatedResult;
          break;
        }

        if (updatedResult.state === "failed") {
          throw new Error(updatedResult.failure_reason || "Generation failed");
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error("Generation timed out after 5 minutes");
      }
    }

    // Log the result for debugging
    console.log("[API] Generation result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate video",
      },
      { status: 500 },
    );
  }
}
