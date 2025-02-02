import { fal } from "@fal-ai/client";

async function testFluxLoraTraining() {
  try {
    console.log("Starting FLUX LoRA training test...");
    
    // For testing purposes, we'll use a sample ZIP file URL
    // In practice, you would upload your own ZIP file with training images
    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: "https://your-sample-images.zip",
        create_masks: true,
        steps: 1000,
        trigger_word: "custom_style",
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

    console.log("Training completed!");
    console.log("Result:", result);
    console.log("LoRA weights URL:", result.data?.diffusers_lora_file?.url);
    console.log("Config file URL:", result.data?.config_file?.url);
  } catch (error) {
    console.error("Error in LoRA training:", error);
  }
}

testFluxLoraTraining(); 