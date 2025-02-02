import { fal } from "@fal-ai/client";

async function testLipsync() {
  try {
    console.log("Starting Lipsync test...");
    
    const result = await fal.subscribe("fal-ai/sync-lipsync", {
      input: {
        model: "lipsync-1.9.0-beta",
        video_url: "https://example.com/input_video.mp4",
        audio_url: "https://example.com/input_audio.wav",
        sync_mode: "cut_off"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Lipsync completed!");
    console.log("Result:", result);
    console.log("Output video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Lipsync:", error);
  }
}

async function testMMAudio() {
  try {
    console.log("Starting MMAudio test...");
    
    const result = await fal.subscribe("fal-ai/mmaudio/v2", {
      input: {
        audio_url: "https://example.com/input_audio.wav",
        // Add any other required parameters based on the MMAudio API documentation
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("MMAudio processing completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in MMAudio:", error);
  }
}

// Run all tests
async function runProcessingTests() {
  await testLipsync();
  await testMMAudio();
}

runProcessingTests(); 