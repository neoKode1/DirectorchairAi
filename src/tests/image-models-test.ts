import { fal } from "@fal-ai/client";
import type { Result, QueueStatus, RequestLog } from "@fal-ai/client";
import type { ImageSize, ImageData, ImageResult, FluxOutput } from "@/lib/types/fal-types";

interface FluxProV11UltraInput {
  prompt: string;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: "1" | "2" | "3";
  output_format?: "jpeg" | "png";
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

interface FluxProV11UltraOutput {
  images: Array<{
    url: string;
    seed?: number;
    nsfw_content_detected?: boolean;
  }>;
  status: string;
}

interface FluxProV11UltraFinetunedInput extends FluxProV11UltraInput {
  finetune_id: string;
  finetune_strength: number;
}

interface FluxSchnellInput {
  prompt: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_images?: number;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

interface FluxSchnellOutput {
  images: Array<{
    url: string;
    seed?: number;
    nsfw_content_detected?: boolean;
  }>;
  status: string;
}

interface RecraftInput {
  prompt: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  style?: string;
  colors?: string[];
}

interface RecraftOutput {
  images: Array<{
    url: string;
    seed?: number;
  }>;
  status: string;
}

async function testFluxProUltra() {
  try {
    console.log("Starting FLUX Pro Ultra test...");

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        num_images: 1,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg",
        aspect_ratio: "16:9",
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    }) as Result<ImageResult>;

    console.log("FLUX Pro Ultra generation completed!");
    console.log("Result:", result);
    console.log(
      "Image URLs:",
      result.data.images.map((img: ImageData) => img.url),
    );
  } catch (error) {
    console.error("Error in FLUX Pro Ultra:", error);
  }
}

async function testFluxProUltraFinetuned() {
  try {
    console.log("Starting FLUX Pro Ultra Finetuned test...");

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra-finetuned", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        finetune_id: "your-finetune-id",
        finetune_strength: 0.8,
        num_images: 1,
        enable_safety_checker: true,
        safety_tolerance: "2",
        output_format: "jpeg",
        aspect_ratio: "16:9",
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FLUX Pro Ultra Finetuned generation completed!");
    console.log("Result:", result);
    console.log(
      "Image URLs:",
      result.data.images.map((img: ImageData) => img.url),
    );
  } catch (error) {
    console.error("Error in FLUX Pro Ultra Finetuned:", error);
  }
}

async function testFluxSchnell() {
  try {
    console.log("Starting FLUX Schnell test...");

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "A beautiful sunset over a mountain landscape",
        image_size: "landscape_4_3" as ImageSize,
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    }) as Result<ImageResult>;

    console.log("FLUX Schnell generation completed!");
    console.log("Result:", result);
    console.log(
      "Image URLs:",
      result.data.images.map((img: ImageData) => img.url),
    );
  } catch (error) {
    console.error("Error in FLUX Schnell:", error);
  }
}

async function testRecraft() {
  try {
    console.log("Starting Recraft test...");

    const result = await fal.subscribe("fal-ai/recraft", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        image_size: "landscape_4_3",
        style: "realistic_image",
        colors: [],
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Recraft generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Recraft:", error);
  }
}

async function testPhoton() {
  try {
    console.log("Starting Photon test...");

    // Using fetch for Luma API since it doesn't use the fal client
    const response = await fetch(
      "https://api.lumalabs.ai/dream-machine/v1/generations/image",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${process.env.LUMA_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prompt: "A majestic tiger in a mystical forest",
          aspect_ratio: "16:9",
          model: "photon-1",
        }),
      },
    );

    const result = await response.json();
    console.log("Photon generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Photon:", error);
  }
}

// Run all tests
async function runImageTests() {
  await testFluxProUltra();
  await testFluxProUltraFinetuned();
  await testFluxSchnell();
  await testRecraft();
  await testPhoton();
}

runImageTests();
