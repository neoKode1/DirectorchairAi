import { fal } from "@fal-ai/client";
import type { QueueStatus, RequestLog } from "@fal-ai/client";
import { ImageGenerationInput, ImageGenerationOutput, handleQueueUpdate } from "./types";

interface ImageData {
  url: string;
  seed?: number;
  nsfw_content_detected?: boolean;
}

interface FluxResponse {
  data: {
    images: ImageData[];
  };
}

async function testImageGeneration() {
  try {
    console.log("Starting Image Generation test...");

    // Test basic image generation
    const input: ImageGenerationInput = {
      prompt: "a face of a cute puppy, in the style of pixar animation",
      num_inference_steps: 50,
      guidance_scale: 7.5,
      enable_safety_checker: true,
    };

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input,
      logs: true,
      onQueueUpdate: handleQueueUpdate
    }) as FluxResponse;

    console.log("Basic image generation completed!");
    console.log("Result:", result);
    console.log("Image URLs:", result.data.images.map((img: ImageData) => img.url));

    // Test queue management
    console.log("Testing queue management...");
    const { request_id } = await fal.queue.submit("fal-ai/flux/dev", {
      input: {
        prompt: "a cat in a garden",
        seed: 6252023,
        image_size: "landscape_4_3",
        num_images: 4,
      } as ImageGenerationInput
    });

    console.log("Request submitted with ID:", request_id);

    // Check status
    const status = await fal.queue.status("fal-ai/flux/dev", {
      requestId: request_id,
      logs: true
    });

    console.log("Request status:", status);

    // Get result
    const queueResult = await fal.queue.result("fal-ai/flux/dev", {
      requestId: request_id
    });

    console.log("Queue result:", queueResult);

    // Test streaming
    console.log("Testing streaming...");
    const stream = await fal.stream("fal-ai/flux/dev", {
      input: {
        prompt: "a sunset over mountains",
        seed: 12345,
        image_size: "landscape_4_3",
        num_images: 2,
      } as ImageGenerationInput
    });

    for await (const event of stream) {
      console.log("Stream event:", event);
    }

    const streamResult = await stream.done();
    console.log("Stream completed:", streamResult);

  } catch (error) {
    console.error("Error in Image Generation:", error);
  }
}

// Run the test
testImageGeneration(); 