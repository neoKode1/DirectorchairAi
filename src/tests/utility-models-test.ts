import { fal, QueueStatus, RequestLog, Result } from "@fal-ai/client";

interface Ray2Input {
  prompt: string;
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
}

interface Ray2Output {
  images: Array<{
    url: string;
    seed?: number;
  }>;
  status: string;
}

interface MetadataInput {
  url: string;
}

interface MetadataOutput {
  format: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  size?: number;
  status: string;
}

// Test Ray2 model
async function testRay2() {
  try {
    console.log("Starting Ray2 test...");

    const input: Ray2Input = {
      prompt: "A beautiful sunset over mountains",
      negative_prompt: "blurry, low quality",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      width: 1024,
      height: 1024,
    };

    const result = await fal.subscribe("fal-ai/ray2", {
      input,
      logs: true,
      onQueueUpdate: (update: QueueStatus) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.forEach((log: RequestLog) => console.log(log.message));
        }
      },
    });

    console.log("Ray2 generation completed!");
    console.log("Result:", result);
    console.log("Output:", result.data);
  } catch (error) {
    console.error("Error in Ray2:", error);
  }
}

// Test Metadata model
async function testMetadata() {
  try {
    console.log("Starting Metadata extraction test...");

    const input: MetadataInput = {
      url: "https://example.com/sample-media.mp4",
    };

    const result = await fal.subscribe("fal-ai/metadata", {
      input,
      logs: true,
      onQueueUpdate: (update: QueueStatus) => {
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.forEach((log: RequestLog) => console.log(log.message));
        }
      },
    });

    console.log("Metadata extraction completed!");
    console.log("Result:", result);
    console.log("Metadata:", result.data);
  } catch (error) {
    console.error("Error in Metadata extraction:", error);
  }
}

// Run all tests
async function runUtilityTests() {
  await testRay2();
  await testMetadata();
}

runUtilityTests(); 