import { fal } from "@fal-ai/client";
import type { Result } from "@fal-ai/client";
import { AudioModelInput, handleQueueUpdate } from "./types";

async function testLipSync() {
  try {
    console.log("Starting LipSync test...");

    const input: AudioModelInput = {
      prompt: "Sync the audio with the video",
      video_url: "https://example.com/image.jpg",
      audio_url: "https://example.com/audio.mp3",
      pollInterval: 1000
    };

    const result: Result<{ video: { url: string } }> = await fal.subscribe(
      "fal-ai/lipsync",
      {
        input,
        logs: true,
        onQueueUpdate: handleQueueUpdate
      }
    );

    console.log("LipSync completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data.video.url);

  } catch (error) {
    console.error("Error in LipSync:", error);
  }
}

// Run the test
testLipSync();
