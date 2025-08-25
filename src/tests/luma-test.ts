import { LumaAI } from "lumaai";

// Check for environment variables
const API_KEY = process.env.LUMAAI_API_KEY;
if (!API_KEY) {
  throw new Error("LUMAAI_API_KEY environment variable is not set");
}

// Initialize Luma client
const client = new LumaAI({ authToken: API_KEY });

interface ApiError {
  message: string;
  details?: unknown;
}

interface LumaGeneration {
  id: string;
  state: "queued" | "dreaming" | "completed" | "failed";
  failure_reason?: string;
  assets?: {
    video?: string;
  };
}

describe("Luma API Tests", () => {
  jest.setTimeout(300000); // 5 minutes timeout for long-running tests

  test("Ray2 Text-to-Video Generation", async () => {
    console.log("\nTesting Ray2 Text-to-Video...");

    // Create generation
    const generation = (await client.generations.create({
      prompt: "A beautiful butterfly landing on a flower in a sunny garden",
      model: "ray-2",
    })) as LumaGeneration;

    expect(generation.id).toBeDefined();
    console.log("Generation started:", generation.id);

    // Poll for completion
    let completed = false;
    let finalGeneration = generation;

    while (!completed) {
      finalGeneration = (await client.generations.get(
        generation.id,
      )) as LumaGeneration;

      if (finalGeneration.state === "completed") {
        completed = true;
        console.log("Generation completed!");
        expect(finalGeneration.assets?.video).toBeDefined();
        console.log("Video URL:", finalGeneration.assets?.video);
      } else if (finalGeneration.state === "failed") {
        throw new Error(`Generation failed: ${finalGeneration.failure_reason}`);
      } else {
        console.log("Status:", finalGeneration.state);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    }

    // Final assertions
    expect(finalGeneration.state).toBe("completed");
    expect(finalGeneration.assets?.video).toMatch(
      /^https:\/\/storage\.cdn-luma\.com/,
    );
  });
});
