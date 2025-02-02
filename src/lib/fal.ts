"use client";

import { createFalClient } from "@fal-ai/client";

export const falClient = createFalClient({
  credentials: () => {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_FAL_KEY || "";
    }
    return localStorage?.getItem("falKey") || "";
  },
  proxyUrl: "/api/fal",
});

export type InputAsset =
  | "video"
  | "image"
  | "audio"
  | {
      type: "video" | "image" | "audio";
      key: string;
    };

export type ApiInfo = {
  endpointId: string;
  label: string;
  description: string;
  cost: string;
  inferenceTime?: string;
  inputMap?: Record<string, string>;
  inputAsset?: InputAsset[];
  initialInput?: Record<string, unknown>;
  category: "image" | "video" | "music" | "voiceover";
};

export const AVAILABLE_ENDPOINTS: ApiInfo[] = [
  {
    endpointId: "fal-ai/flux/dev",
    label: "Flux Dev",
    description: "FLUX.1 [dev], next generation text-to-image model",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/flux/schnell",
    label: "Flux Schnell",
    description: "FLUX.1 [schnell], turbo mode for next generation text-to-image model FLUX",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/flux-pro/v1.1-ultra",
    label: "Flux Pro 1.1 Ultra",
    description: "Generate high-quality images with advanced text-to-image model",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/stable-diffusion-v35-large",
    label: "Stable Diffusion 3.5 Large",
    description: "Image quality, typography, complex prompt understanding",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/minimax/video-01-live/image-to-video",
    label: "Minimax I2V Live",
    description: "Transform static art into dynamic masterpieces with enhanced smoothness and vivid motion",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/minimax/video-01-subject-reference",
    label: "Minimax Subject Reference",
    description: "Text-to-video generation with subject reference image for consistent character appearance",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/hunyuan-video",
    label: "Hunyuan",
    description: "High visual quality, motion diversity and text alignment",
    cost: "",
    category: "video",
  },
  {
    endpointId: "fal-ai/hunyuan-video-lora-training",
    label: "Hunyuan Video LoRA Training",
    description: "Fine-tune a LoRA model on a dataset of images for video generation",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/kling-video/v1.6/pro/image-to-video",
    label: "Kling 1.6 Pro",
    description: "Professional image to video conversion with high quality results",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/luma-dream-machine",
    label: "Luma Dream Machine 1.5",
    description: "High quality video generation",
    cost: "",
    category: "video",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/luma-dream-machine/ray-2",
    label: "Ray 2",
    description: "Large-scale video generative model capable of creating realistic visuals with natural, coherent motion",
    cost: "",
    category: "video",
  },
  {
    endpointId: "fal-ai/pixverse/v3.5/text-to-video/fast",
    label: "Pixverse V3.5 Fast",
    description: "Fast text-to-video generation with high quality results",
    cost: "",
    category: "video",
  },
  {
    endpointId: "fal-ai/flux-lora-fast-training",
    label: "Flux LoRA Training",
    description: "Fine-tune a LoRA model on a dataset of images",
    cost: "",
    category: "image",
    inputAsset: ["image"],
  },
  {
    endpointId: "fal-ai/sync-lipsync",
    label: "Sync.so Lipsync",
    description: "Generate realistic lipsync animations from audio using advanced algorithms",
    cost: "",
    category: "video",
    inputAsset: ["video", "audio"],
  },
  {
    endpointId: "fal-ai/minimax-music",
    label: "Minimax Music",
    description: "Advanced AI techniques to create high-quality, diverse musical compositions",
    cost: "",
    category: "music",
    inputAsset: [
      {
        type: "audio",
        key: "reference_audio_url",
      },
    ],
  },
  {
    endpointId: "fal-ai/mmaudio-v2",
    label: "MMAudio V2",
    description: "Generate synchronized audio for videos with text inputs",
    cost: "",
    inputAsset: ["video"],
    category: "video",
  },
  {
    endpointId: "fal-ai/mmaudio-v2/text-to-audio",
    label: "MMAudio V2 Text-to-Audio",
    description: "Generate audio from text descriptions",
    cost: "",
    category: "music",
  },
  {
    endpointId: "fal-ai/recraft-20b",
    label: "Recraft 20B",
    description: "State of the art Recraft 20B model for high-quality image generation",
    cost: "",
    category: "image",
  },
  {
    endpointId: "fal-ai/stable-audio",
    label: "Stable Audio",
    description: "Stable Diffusion music creation with high-quality tracks",
    cost: "",
    category: "music",
  },
  {
    endpointId: "fal-ai/playht/tts/v3",
    label: "PlayHT TTS v3",
    description: "Fluent and faithful speech with flow matching",
    cost: "",
    category: "voiceover",
    initialInput: {
      voice: "Dexter (English (US)/American)",
    },
  },
  {
    endpointId: "fal-ai/playai/tts/dialog",
    label: "PlayAI Text-to-Speech Dialog",
    description: "Generate natural-sounding multi-speaker dialogues",
    cost: "",
    category: "voiceover",
    inputMap: {
      prompt: "input",
    },
    initialInput: {
      voices: [
        {
          voice: "Jennifer (English (US)/American)",
          turn_prefix: "Speaker 1: ",
        },
        {
          voice: "Furio (English (IT)/Italian)",
          turn_prefix: "Speaker 2: ",
        },
      ],
    },
  },
  {
    endpointId: "fal-ai/f5-tts",
    label: "F5 TTS",
    description: "Fluent and faithful speech with flow matching",
    cost: "",
    category: "voiceover",
    initialInput: {
      ref_audio_url:
        "https://github.com/SWivid/F5-TTS/raw/21900ba97d5020a5a70bcc9a0575dc7dec5021cb/tests/ref_audio/test_en_1_ref_short.wav",
      ref_text: "Some call me nature, others call me mother nature.",
      model_type: "F5-TTS",
      remove_silence: true,
    },
  },
];
