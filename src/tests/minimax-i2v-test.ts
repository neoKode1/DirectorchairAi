import { fal, QueueStatus } from "@fal-ai/client";

// Interface based on the API documentation
interface MinimaxI2VInput {
  prompt: string;
  image_url: string;
  prompt_optimizer?: boolean;
}

interface MinimaxI2VOutput {
  video: {
    url: string;
  };
}

async function testMinimaxI2V() {
  try {
    console.log("Starting Minimax I2V test...");

    // Test with minimum required parameters
    const result = await fal.subscribe("fal-ai/minimax/video-01-live/image-to-video", {
      input: {
        prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage",
        image_url: "https://example.com/input_image.jpg",
        prompt_optimizer: true
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log: { message: string }) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Minimax I2V generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);

    // Test queue submission
    const queueResult = await fal.queue.submit("fal-ai/minimax/video-01-live/image-to-video", {
      input: {
        prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage",
        image_url: "https://example.com/input_image.jpg",
        prompt_optimizer: true
      }
    });

    console.log("Queue submission completed!");
    console.log("Request ID:", queueResult.request_id);

    // Test queue status check
    const status = await fal.queue.status("fal-ai/minimax/video-01-live/image-to-video", {
      requestId: queueResult.request_id,
      logs: true
    });

    console.log("Queue status:", status);

  } catch (error) {
    console.error("Error in Minimax I2V:", error);
  }
}

// Run the test
testMinimaxI2V();
