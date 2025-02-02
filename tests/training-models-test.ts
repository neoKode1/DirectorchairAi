import { fal } from "@fal-ai/client";

async function testHunyuanLoraTraining() {
  try {
    console.log("Starting Hunyuan LoRA Training test...");
    
    const result = await fal.subscribe("fal-ai/hunyuan-video-lora-training", {
      input: {
        images_data_url: "https://example.com/training_images.zip",
        steps: 1000,
        trigger_word: "custom_style",
        create_masks: true,
        is_style: false,
        is_input_format_already_preprocessed: false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Hunyuan LoRA Training completed!");
    console.log("Result:", result);
    console.log("LoRA weights URL:", result.data?.lora_weights?.url);
    console.log("Config file URL:", result.data?.config_file?.url);
  } catch (error) {
    console.error("Error in Hunyuan LoRA Training:", error);
  }
}

async function testFluxLoraTraining() {
  try {
    console.log("Starting FLUX LoRA Training test...");
    
    const result = await fal.subscribe("fal-ai/flux-lora-training", {
      input: {
        images_data_url: "https://example.com/training_images.zip",
        steps: 1000,
        trigger_word: "custom_style",
        create_masks: true,
        is_style: false,
        is_input_format_already_preprocessed: false
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FLUX LoRA Training completed!");
    console.log("Result:", result);
    console.log("LoRA weights URL:", result.data?.diffusers_lora_file?.url);
    console.log("Config file URL:", result.data?.config_file?.url);
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