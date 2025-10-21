import { fal, QueueStatus } from "@fal-ai/client";

async function testHunyuanLoraTraining() {
  try {
    console.log("Starting Hunyuan LoRA Training test...");

    const result = await fal.subscribe("fal-ai/hunyuan-video-lora-training", {
      input: {
        images_data_url: "https://example.com/training_images.zip",
        steps: 1000,
        trigger_word: "custom_style",
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Hunyuan LoRA Training completed!");
    console.log("Result:", result);
    console.log("Output:", result.data);
  } catch (error) {
    console.error("Error in Hunyuan LoRA Training:", error);
  }
}

async function testFluxLoraTraining() {
  try {
    console.log("Starting FLUX LoRA Training test...");

    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: "https://example.com/training_images.zip",
        steps: 1000,
        trigger_word: "custom_style",
      },
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FLUX LoRA Training completed!");
    console.log("Result:", result);
    console.log("Output:", result.data);
  } catch (error) {
    console.error("Error in FLUX LoRA Training:", error);
  }
}

// Run all tests
async function runTrainingTests() {
  await testHunyuanLoraTraining();
  await testFluxLoraTraining();
}

runTrainingTests();
