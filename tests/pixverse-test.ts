import { fal } from "@fal-ai/client";

// Configure fal client with API key
fal.config({
  credentials: process.env.FAL_KEY,
});

interface ApiError {
  status: number;
  body: {
    detail: any[];
  };
  message: string;
}

async function testPixverseTextToVideo() {
  try {
    console.log("Starting Pixverse Text-to-Video test...");
    
    if (!process.env.FAL_KEY) {
      throw new Error("FAL_KEY environment variable is not set");
    }
    
    const result = await fal.subscribe("fal-ai/pixverse/v3.5/text-to-video/fast", {
      input: {
        prompt: "A butterfly landing on a flower in slow motion, cinematic lighting, high quality, detailed",
        negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded",
        num_frames: 16,
        width: 576,
        height: 320,
        num_inference_steps: 30,
        guidance_scale: 12.5,
        fps: 8
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Pixverse Text-to-Video generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Pixverse Text-to-Video:", error);
    if ((error as ApiError).body?.detail) {
      console.error("Validation details:", JSON.stringify((error as ApiError).body.detail, null, 2));
    }
  }
}

async function testPixverseImageToVideo() {
  try {
    console.log("Starting Pixverse Image-to-Video test...");
    
    if (!process.env.FAL_KEY) {
      throw new Error("FAL_KEY environment variable is not set");
    }
    
    const result = await fal.subscribe("fal-ai/pixverse/v3.5/image-to-video/fast", {
      input: {
        prompt: "A serene lake with mountains in the background, gentle ripples in the water, cinematic",
        image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=576&h=320",
        negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded",
        num_frames: 16,
        width: 576,
        height: 320,
        num_inference_steps: 30,
        guidance_scale: 12.5,
        fps: 8,
        motion_bucket_id: 127
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Pixverse Image-to-Video generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Pixverse Image-to-Video:", error);
    if ((error as ApiError).body?.detail) {
      console.error("Validation details:", JSON.stringify((error as ApiError).body.detail, null, 2));
    }
  }
}

// Run all Pixverse tests
async function runPixverseTests() {
  console.log("Starting Pixverse endpoint tests...");
  
  // Test Text-to-Video
  await testPixverseTextToVideo();
  
  // Test Image-to-Video
  await testPixverseImageToVideo();
  
  console.log("All Pixverse tests completed!");
}

// Run the tests
runPixverseTests(); 