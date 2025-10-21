import { fal } from "@fal-ai/client";
import type { Result } from "@fal-ai/client";

// Base interfaces
interface BaseVideoInput {
  prompt: string;
  pollInterval?: number;
}

interface BaseVideoOutput {
  video: {
    url: string;
  };
}

// Hunyuan Video interfaces
interface HunyuanVideoInput extends BaseVideoInput {
  num_inference_steps?: number;
  seed?: number;
  pro_mode?: boolean;
  aspect_ratio?: "16:9" | "9:16";
  resolution?: "480p" | "580p" | "720p";
  num_frames?: "85" | "129";
  enable_safety_checker?: boolean;
}

// Kling Video interfaces
interface KlingVideoInput extends BaseVideoInput {
  image_url: string;
  duration?: "5" | "10";
  aspect_ratio?: "16:9" | "9:16" | "1:1";
}

// Minimax Video interfaces
interface MinimaxSubjectInput extends BaseVideoInput {
  subject_reference_image_url: string;
  prompt_optimizer?: boolean;
}

interface MinimaxLiveInput extends BaseVideoInput {
  image_url: string;
  prompt_optimizer?: boolean;
}

// Pixverse Video interfaces
interface PixverseInput extends BaseVideoInput {
  prompt_optimizer?: boolean;
}

type TestFunction = () => Promise<void>;

const handleQueueUpdate = (status: any) => {
  if (status.status === "IN_PROGRESS") {
    status.logs.forEach((log: any) => console.log(log.message));
  }
};

const testHunyuanVideo: TestFunction = async () => {
  try {
    console.log("Starting Hunyuan Video test...");

    const input: HunyuanVideoInput = {
      prompt: "A serene lake surrounded by mountains at sunset",
      num_inference_steps: 30,
      aspect_ratio: "16:9",
      resolution: "720p",
      num_frames: "129",
      enable_safety_checker: true,
      pro_mode: false,
    };

    const result = await fal.subscribe("fal-ai/hunyuan-video", {
      input,
      logs: true,
      onQueueUpdate: handleQueueUpdate
    });

    console.log("Hunyuan Video generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Hunyuan Video:", error);
  }
};

const testKlingVideo: TestFunction = async () => {
  try {
    console.log("Starting Kling Video test...");

    const input: KlingVideoInput = {
      prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon",
      image_url: "https://example.com/input_image.jpg",
      duration: "5",
      aspect_ratio: "16:9",
    };

    const result = await fal.subscribe(
      "fal-ai/kling-video/v1.6/pro/image-to-video",
      {
        input,
        logs: true,
        onQueueUpdate: handleQueueUpdate
      },
    );

    console.log("Kling Video generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data.video.url);
  } catch (error) {
    console.error("Error in Kling Video:", error);
  }
};

const testMinimaxSubjectRef: TestFunction = async () => {
  try {
    console.log("Starting Minimax Subject Reference test...");

    const input: MinimaxSubjectInput = {
      prompt: "A person walking through a beautiful garden",
      subject_reference_image_url: "https://example.com/reference.jpg",
      prompt_optimizer: true
    };

    const result = await fal.subscribe(
      "fal-ai/minimax/video-01-subject-reference",
      {
        input,
        logs: true,
        onQueueUpdate: handleQueueUpdate
      },
    );

    console.log("Minimax Subject Reference generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data.video.url);
  } catch (error) {
    console.error("Error in Minimax Subject Reference:", error);
  }
};

const testMinimaxLive: TestFunction = async () => {
  try {
    console.log("Starting Minimax Live I2V test...");

    const input: MinimaxLiveInput = {
      prompt: "A person dancing in a vibrant disco",
      image_url: "https://example.com/input_image.jpg",
      prompt_optimizer: true
    };

    const result = await fal.subscribe(
      "fal-ai/minimax/video-01-live/image-to-video",
      {
        input,
        logs: true,
        onQueueUpdate: handleQueueUpdate
      },
    );

    console.log("Minimax Live I2V generation completed!");
    console.log("Result:", result);
    console.log("Video URL:", result.data.video.url);
  } catch (error) {
    console.error("Error in Minimax Live I2V:", error);
  }
};

const testPixverse: TestFunction = async () => {
  try {
    console.log("Starting Pixverse test...");

    const input: PixverseInput = {
      prompt: "A butterfly landing on a flower in slow motion",
      prompt_optimizer: true
    };

    const result = await fal.subscribe(
      "fal-ai/pixverse/v3.5/text-to-video",
      {
        input,
        logs: true,
        onQueueUpdate: handleQueueUpdate
      },
    );

    console.log("Pixverse generation completed!");
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in Pixverse:", error);
  }
};

// Run all tests
const runVideoTests = async () => {
  await testHunyuanVideo();
  await testKlingVideo();
  await testMinimaxSubjectRef();
  await testMinimaxLive();
  await testPixverse();
};

runVideoTests();
