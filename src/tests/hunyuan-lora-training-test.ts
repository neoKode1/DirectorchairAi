import { fal, QueueStatus, RequestLog } from "@fal-ai/client";

interface HunyuanVideoLoraTrainingInput {
  images_data_url: string | Blob | File;
  steps: number;
  trigger_word: string;
  learning_rate?: number;
  do_caption?: boolean;
  create_masks?: boolean;
  is_style?: boolean;
  is_input_format_already_preprocessed?: boolean;
}

async function testHunyuanLoraTraining() {
  try {
    console.log("Starting Hunyuan LoRA training test...");

    const input: HunyuanVideoLoraTrainingInput = {
      images_data_url: "https://example.com/training-images.zip",
      steps: 100,
      trigger_word: "test_style",
      learning_rate: 0.0001,
      do_caption: true,
      create_masks: true,
      is_style: true,
      is_input_format_already_preprocessed: false,
    };

    const result = await fal.subscribe("fal-ai/hunyuan-video-lora-training", {
      input,
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log: RequestLog) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Hunyuan LoRA training completed!");
    console.log("Result:", result);
    console.log("LoRA file URL:", result.data.diffusers_lora_file?.url);
    console.log("Config file URL:", result.data.config_file?.url);
  } catch (error) {
    console.error("Error in Hunyuan LoRA training:", error);
  }
}

// Run the test
testHunyuanLoraTraining();
