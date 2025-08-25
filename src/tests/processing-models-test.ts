import { fal, QueueStatus } from "@fal-ai/client";

async function testLipsync() {
  try {
    console.log("Starting Lipsync test...");

    const result = await fal.subscribe("fal-ai/sync-lipsync", {
      input: {
        video_url: "https://your-sample-video.mp4",
        audio_url: "https://your-sample-audio.wav",
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Lipsync completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in Lipsync:", error);
  }
}

async function testMMAudio() {
  try {
    console.log("Starting MMAudio test...");

    const result = await fal.subscribe("fal-ai/mmaudio-v2/text-to-audio", {
      input: {
        prompt: "Indian holy music",
        num_steps: 25,
        duration: 8,
        cfg_strength: 4.5
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("MMAudio generation completed!");
    console.log("Result:", result);
    console.log("Audio URL:", result.data?.audio?.url);
  } catch (error) {
    console.error("Error in MMAudio:", error);
  }
}

async function testFFmpeg() {
  try {
    console.log("Starting FFmpeg test...");

    const result = await fal.subscribe("fal-ai/ffmpeg", {
      input: {
        video_url: "https://your-sample-video.mp4",
        command: "-i input.mp4 -vf scale=1280:720 output.mp4",
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FFmpeg processing completed!");
    console.log("Result:", result);
    console.log("Output video URL:", result.data?.video?.url);
  } catch (error) {
    console.error("Error in FFmpeg:", error);
  }
}

// Run all tests
async function runProcessingTests() {
  await testLipsync();
  await testMMAudio();
  await testFFmpeg();
}

runProcessingTests();
