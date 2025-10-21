import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

// Load environment variables from .env.test
dotenv.config({ path: ".env.test" });

async function testPixverseT2V() {
  console.log("Starting Pixverse Text-to-Video test...");
  
  // More detailed API key logging
  const apiKey = process.env.FAL_KEY;
  console.log("FAL_KEY status:", apiKey ? `Present (${apiKey.substring(0, 8)}...)` : "Missing");
  
  if (!apiKey) {
    console.error("ERROR: FAL_KEY environment variable is not set!");
    process.exit(1);
  }

  try {
    // Configure fal client explicitly
    fal.config({
      credentials: apiKey
    });

    const input = {
      prompt: "A serene lake surrounded by mountains at sunset, cinematic style",
      num_frames: 16,
      width: 1024,
      height: 576,
      num_inference_steps: 50,
      guidance_scale: 7.5,
    };

    console.log("Sending request with input:", JSON.stringify(input, null, 2));
    console.log("Using model: fal-ai/pixverse/v3.5/text-to-video");

    const result = await fal.subscribe("fal-ai/pixverse/v3.5/text-to-video", {
      input,
      logs: true,
      onQueueUpdate: (status: any) => {
        console.log("Queue status update:", status.status);
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.forEach((log: any) => console.log("Progress:", log.message));
        }
      }
    });

    console.log("Request completed!");
    console.log("Result:", JSON.stringify(result, null, 2));

    if (result.data?.video?.url) {
      console.log("Success! Video URL:", result.data.video.url);
    } else {
      console.log("No video URL in response");
      console.log("Full response data:", JSON.stringify(result.data, null, 2));
    }

  } catch (error: any) {
    console.error("\nError details:");
    console.error("- Type:", error.constructor.name);
    console.error("- Message:", error.message);
    console.error("- Status:", error.status);
    if (error.body) {
      console.error("- Response body:", JSON.stringify(error.body, null, 2));
    }
    if (error.stack) {
      console.error("- Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testPixverseT2V(); 