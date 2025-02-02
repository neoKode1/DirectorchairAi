import { fal } from "@fal-ai/client";
import type { HunyuanVideoInput } from "@/components/model-inputs/hunyuan-video-interface";

async function testHunyuanVideo() {
  try {
    console.log("Starting Hunyuan Video test...");
    
    const input: HunyuanVideoInput = {
      prompt: "A serene lake surrounded by mountains at sunset",
      num_inference_steps: 30,
      aspect_ratio: "16:9",
      resolution: "720p",
      num_frames: 129,
      enable_safety_checker: true,
      pro_mode: false
    };
    
    const result = await fal.subscribe("fal-ai/hunyuan-video", {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Hunyuan Video generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Hunyuan Video:", error);
  }
}

async function testKlingVideo() {
  try {
    console.log("Starting Kling Video test...");
    
    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon",
        image_url: "https://example.com/input_image.jpg",
        duration: "5",
        aspect_ratio: "16:9"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Kling Video generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Kling Video:", error);
  }
}

async function testMinimaxSubjectRef() {
  try {
    console.log("Starting Minimax Subject Reference test...");
    
    const result = await fal.subscribe("fal-ai/minimax/video-01-subject-reference", {
      input: {
        prompt: "A person walking through a beautiful garden",
        subject_reference_image_url: "https://example.com/reference.jpg",
        prompt_optimizer: true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Minimax Subject Reference generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Minimax Subject Reference:", error);
  }
}

async function testMinimaxLive() {
  try {
    console.log("Starting Minimax Live I2V test...");
    
    const result = await fal.subscribe("fal-ai/minimax/video-01-live/image-to-video", {
      input: {
        prompt: "A person dancing in a vibrant disco",
        image_url: "https://example.com/input_image.jpg",
        prompt_optimizer: true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Minimax Live I2V generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Minimax Live I2V:", error);
  }
}

async function testPixverse() {
  try {
    console.log("Starting Pixverse test...");
    
    const result = await fal.subscribe("fal-ai/pixverse/v3.5/text-to-video", {
      input: {
        prompt: "A butterfly landing on a flower in slow motion",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Pixverse generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Pixverse:", error);
  }
}

// Run all tests
async function runVideoTests() {
  await testHunyuanVideo();
  await testKlingVideo();
  await testMinimaxSubjectRef();
  await testMinimaxLive();
  await testPixverse();
}

runVideoTests(); 