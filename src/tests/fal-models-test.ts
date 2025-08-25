import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import type { QueueStatus } from "@fal-ai/client";

// Load environment variables from .env.test
dotenv.config({ path: ".env.test" });

// Utility function for logging queue updates
const handleQueueUpdate = (modelName: string) => (status: QueueStatus) => {
  console.log(`[${modelName}] Queue status:`, status.status);
  if (status.status === "IN_PROGRESS" && status.logs) {
    status.logs.forEach((log) => console.log(`[${modelName}] Progress:`, log.message));
  }
};

// Base test function
async function testModel(
  modelName: string,
  endpointId: string,
  input: Record<string, any>
) {
  console.log(`\n=== Testing ${modelName} ===`);
  console.log("Input:", JSON.stringify(input, null, 2));
  
  try {
    const result = await fal.subscribe(endpointId, {
      input,
      logs: true,
      onQueueUpdate: handleQueueUpdate(modelName)
    });

    console.log(`[${modelName}] Success!`);
    console.log("Result:", JSON.stringify(result.data, null, 2));
    return result;
  } catch (error: any) {
    console.error(`\n[${modelName}] Error:`);
    console.error("- Type:", error.constructor.name);
    console.error("- Message:", error.message);
    console.error("- Status:", error.status);
    if (error.body) {
      console.error("- Response body:", JSON.stringify(error.body, null, 2));
    }
    return null;
  }
}

// Test Pixverse Text-to-Video
async function testPixverseT2V() {
  return testModel(
    "Pixverse T2V",
    "fal-ai/pixverse/v3.5/text-to-video",
    {
      prompt: "A serene lake surrounded by mountains at sunset, cinematic style",
      num_frames: 16,
      width: 1024,
      height: 576,
      num_inference_steps: 50,
      guidance_scale: 7.5,
    }
  );
}

// Test FLUX Pro Ultra
async function testFluxProUltra() {
  return testModel(
    "FLUX Pro Ultra",
    "fal-ai/flux/pro/1.1/ultra",
    {
      prompt: "A majestic tiger in a mystical forest, highly detailed digital art",
      num_images: 1,
      enable_safety_checker: true,
      safety_tolerance: "2",
      output_format: "jpeg",
      aspect_ratio: "16:9",
    }
  );
}

// Test Hunyuan Video
async function testHunyuanVideo() {
  return testModel(
    "Hunyuan Video",
    "fal-ai/hunyuan-video",
    {
      prompt: "A butterfly landing on a flower in slow motion",
      num_inference_steps: 30,
      aspect_ratio: "16:9",
      resolution: "720p",
      num_frames: "129",
      enable_safety_checker: true,
      pro_mode: false,
    }
  );
}

// Test MMAudio
async function testMMAudio() {
  return testModel(
    "MMAudio",
    "fal-ai/mmaudio-v2/text-to-audio",
    {
      prompt: "Peaceful nature sounds with gentle piano",
      num_steps: 25,
      duration: 8,
      cfg_strength: 4.5
    }
  );
}

// Main test runner
async function runTests() {
  console.log("Starting FAL AI model tests...");
  
  // Verify API key
  const apiKey = process.env.FAL_KEY;
  console.log("FAL_KEY status:", apiKey ? `Present (${apiKey.substring(0, 8)}...)` : "Missing");
  
  if (!apiKey) {
    console.error("ERROR: FAL_KEY environment variable is not set!");
    process.exit(1);
  }

  // Configure fal client
  fal.config({
    credentials: apiKey
  });

  // Run tests sequentially
  const results = {
    pixverse: await testPixverseT2V(),
    fluxProUltra: await testFluxProUltra(),
    hunyuanVideo: await testHunyuanVideo(),
    mmAudio: await testMMAudio()
  };

  // Print summary
  console.log("\n=== Test Summary ===");
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}: ${result ? "✅ Success" : "❌ Failed"}`);
  });
}

// Run all tests
runTests(); 