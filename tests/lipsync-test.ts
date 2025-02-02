import { fal } from "@fal-ai/client";

async function testLipsync() {
  try {
    console.log("Starting Lipsync test...");
    
    const result = await fal.subscribe("fal-ai/sync-lipsync", {
      input: {
        model: "lipsync-1.9.0-beta",
        video_url: "https://fal.media/files/koala/8teUPbRRMtAUTORDvqy0l.mp4",
        audio_url: "https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav",
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

testLipsync(); 