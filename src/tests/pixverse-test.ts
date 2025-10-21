import { fal, QueueStatus } from "@fal-ai/client";

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

async function testPixverse() {
  try {
    console.log("Starting Pixverse test...");

    // Test Text to Video
    console.log("Testing Text to Video...");
    const t2vResult = await fal.subscribe("fal-ai/pixverse/v3.5/text-to-video", {
      input: {
        prompt: "A majestic tiger walking through a mystical forest",
        num_frames: 16,
        width: 1024,
        height: 576,
        num_inference_steps: 50,
        guidance_scale: 7.5,
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Text to Video completed!");
    console.log("Result:", t2vResult);
    console.log("Video URL:", t2vResult.data?.video?.url);

    // Test Image to Video
    console.log("Testing Image to Video...");
    const i2vResult = await fal.subscribe("fal-ai/pixverse/v3.5-fast/image-to-video", {
      input: {
        image_url: "https://your-sample-image.jpg",
        prompt: "A majestic tiger walking through a mystical forest",
        num_frames: 16,
        width: 1024,
        height: 576,
        num_inference_steps: 50,
        guidance_scale: 7.5,
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Image to Video completed!");
    console.log("Result:", i2vResult);
    console.log("Video URL:", i2vResult.data?.video?.url);
  } catch (error) {
    console.error("Error in Pixverse:", error);
  }
}

testPixverse();
