"use client";

import { createFalClient } from "@fal-ai/client";

// Create a client that uses our proxy for all FAL endpoints
export const falClient = createFalClient({
  proxyUrl: "/api/fal/proxy",  // Use our server proxy endpoint
});

// Configure the global FAL client to use our proxy
if (typeof window !== 'undefined') {
  // Client-side configuration
  import("@fal-ai/client").then(({ fal }) => {
    fal.config({
      proxyUrl: "/api/fal/proxy",
    });
  });
}

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
  category: "image" | "video" | "music" | "voiceover";
  inputAsset?: InputAsset[];
  initialInput?: Record<string, unknown>;
  inputMap?: Record<string, string>;
};

export const STYLE_PRESETS = [
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Professional movie-like style with dramatic lighting and composition",
    prompt: "cinematic style, dramatic lighting, professional cinematography, high production value",
    previewImageUrl: "/styles/cinematic.jpg"
  },
  {
    id: "anime",
    label: "Anime",
    description: "Japanese animation style with vibrant colors",
    prompt: "anime style, vibrant colors, cel shading, detailed anime drawing",
    previewImageUrl: "/styles/anime.jpg"
  },
  {
    id: "3d_animation",
    label: "3D Animation",
    description: "Modern 3D animated style with detailed textures",
    prompt: "3D animation style, detailed texturing, subsurface scattering, ambient occlusion",
    previewImageUrl: "/styles/3d.jpg"
  },
  {
    id: "photorealistic",
    label: "Photorealistic",
    description: "Ultra-realistic style with fine details",
    prompt: "photorealistic, highly detailed, 8k uhd, professional photography",
    previewImageUrl: "/styles/photorealistic.jpg"
  },
  {
    id: "watercolor",
    label: "Watercolor",
    description: "Traditional watercolor painting style",
    prompt: "watercolor painting style, artistic, traditional media, painterly",
    previewImageUrl: "/styles/watercolor.jpg"
  }
] as const;

export type StylePreset = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  previewImageUrl?: string;
};

export type StyleReference = {
  url: string;
  weight: number;
};

export type StyleConfig = {
  preset?: StylePreset;
  reference?: StyleReference;
  strength: number;
};

// Add model-specific style configurations
export const MODEL_STYLE_CONFIG = {
  "fal-ai/hunyuan-video": {
    supportsStyleReference: true,
    supportsStylePresets: true,
    maxStyleStrength: 1.0,
  },
  "fal-ai/minimax/video-01-live/image-to-video": {
    supportsStyleReference: true,
    supportsStylePresets: true,
    maxStyleStrength: 1.0,
  },
  "fal-ai/minimax/video-01-subject-reference": {
    supportsStyleReference: true,
    supportsStylePresets: true,
    maxStyleStrength: 1.0,
  },
  "fal-ai/flux-pro/v1.1-ultra": {
    supportsStyleReference: true,
    supportsStylePresets: true,
    maxStyleStrength: 1.0,
  },
  "fal-ai/flux-pro/kontext": {
    supportsStyleReference: true,
    supportsStylePresets: true,
    maxStyleStrength: 1.0,
  },
  "fal-ai/flux-krea-lora/image-to-image": {
    supportsStyleReference: true,
    supportsStylePresets: true,
    maxStyleStrength: 1.0,
  }
} as const;

// Helper function to check if a model supports style features
export function getModelStyleSupport(modelId: string) {
  return MODEL_STYLE_CONFIG[modelId as keyof typeof MODEL_STYLE_CONFIG] || {
    supportsStyleReference: false,
    supportsStylePresets: false,
    maxStyleStrength: 0,
  };
}

// Client-side endpoint information (no sensitive data)
export const AVAILABLE_ENDPOINTS: ApiInfo[] = [
  // Image Generation Models
  {
    endpointId: "fal-ai/imagen4/preview",
    label: "Google Imagen 4",
    description: "Google's highest quality image generation model with enhanced detail, richer lighting, and fewer artifacts",
    category: "image",
    initialInput: {
      prompt: "A beautiful landscape with mountains and sunset",
      aspect_ratio: "1:1",
      num_images: 1,
    },
  },
  {
    endpointId: "fal-ai/stable-diffusion-v35-large",
    label: "Stable Diffusion 3.5 Large",
    description: "Multimodal Diffusion Transformer with improved image quality, typography, complex prompt understanding, and resource-efficiency",
    category: "image",
    initialInput: {
      prompt: "A dreamlike Japanese garden in perpetual twilight, bathed in bioluminescent cherry blossoms",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
  },
  {
    endpointId: "fal-ai/bytedance/dreamina/v3.1/text-to-image",
    label: "Dreamina v3.1",
    description: "Superior picture effects with significant improvements in aesthetics, precise and diverse styles, and rich details",
    category: "image",
    initialInput: {
      prompt: "A 25-year-old korean woman selfie, front facing camera, lighting is soft and natural",
      image_size: {
        width: 2048,
        height: 1536,
      },
      enhance_prompt: true,
      num_images: 1,
    },
  },
  {
    endpointId: "fal-ai/flux-pro/v1.1-ultra",
    label: "Flux Pro 1.1 Ultra",
    description: "Professional-grade image generation with ultra quality and advanced features",
    category: "image",
    initialInput: {
      prompt: "A beautiful landscape with mountains and sunset",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      aspect_ratio: "1:1",
    },
  },
  {
    endpointId: "fal-ai/flux-pro/kontext",
    label: "Flux Pro Kontext",
    description: "Advanced image generation with context-aware editing and manipulation capabilities",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Put a donut next to the flour.",
      image_url: "",
      guidance_scale: 3.5,
      num_images: 1,
      output_format: "jpeg",
      safety_tolerance: "2",
      enhance_prompt: true,
    },
  },
  {
    endpointId: "fal-ai/flux-krea-lora/image-to-image",
    label: "FLUX LoRA Image-to-Image",
    description: "High-performance image-to-image transformation using FLUX models with LoRA adaptations for rapid style transfer and artistic variations",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Transform this image with a new style",
      image_url: "",
      strength: 0.85,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
  },

  // Video Generation Models
  {
    endpointId: "fal-ai/veo3/fast",
    label: "Google Veo3 Fast",
    description: "Google's latest video generation model with exceptional quality and realism",
    category: "video",
    inputAsset: ["image"], // Support both text-to-video and image-to-video
    initialInput: {
      prompt: "A cinematic scene with smooth camera movement",
      aspect_ratio: "16:9",
      duration: "8s",
      enhance_prompt: true,
      auto_fix: true,
      resolution: "720p",
      generate_audio: true,
    },
  },
  {
    endpointId: "fal-ai/veo3/standard",
    label: "Google Veo3 Standard",
    description: "Google Veo3 standard model for high-quality video generation",
    category: "video",
    inputAsset: ["image"], // Support both text-to-video and image-to-video
    initialInput: {
      prompt: "A professional video with natural motion",
      aspect_ratio: "16:9",
      duration: "8s",
      resolution: "1080p",
    },
  },
  {
    endpointId: "fal-ai/kling-video/v2.1/master/image-to-video",
    label: "Kling v2.1 Master (I2V)",
    description: "Latest Kling video generation with enhanced quality and motion realism",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Animate this image with realistic motion",
      duration: "5",
      negative_prompt: "blur, distort, and low quality",
      cfg_scale: 0.5,
    },
  },
  {
    endpointId: "fal-ai/kling-video/v2.1/master/text-to-video",
    label: "Kling v2.1 Master (T2V)",
    description: "Text-to-video generation with Kling v2.1 Master model",
    category: "video",
    initialInput: {
      prompt: "A cinematic scene with professional quality",
      duration: "5",
      negative_prompt: "blur, distort, and low quality",
      cfg_scale: 0.5,
    },
  },

  {
    endpointId: "fal-ai/luma-dream-machine/ray-2",
    label: "Luma Ray 2",
    description: "Large-scale video generative model capable of creating realistic visuals with natural, coherent motion",
    category: "video",
    inputAsset: ["image"], // Support both text-to-video and image-to-video
    initialInput: {
      prompt: "A cinematic scene with professional quality",
      aspect_ratio: "16:9",
      duration: "5",
      loop: false,
    },
  },
  {
    endpointId: "fal-ai/luma-dream-machine/ray-2-flash/image-to-video",
    label: "Luma Ray 2 Flash (I2V)",
    description: "Fast image-to-video generation with Luma's latest Ray 2 Flash model",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Animate this image with smooth motion",
      aspect_ratio: "16:9",
      duration: "5",
      resolution: "540p",
      loop: false,
    },
  },
  {
    endpointId: "fal-ai/minimax/hailuo-02/standard/image-to-video",
    label: "Minimax Hailuo 02 Standard (I2V)",
    description: "Latest Minimax Hailuo 02 model for high-quality image-to-video generation",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Animate this image with cinematic motion",
      duration: "6",
      prompt_optimizer: true,
      resolution: "768P",
    },
  },
  {
    endpointId: "fal-ai/minimax/hailuo-02/standard/text-to-video",
    label: "Minimax Hailuo 02 Standard (T2V)",
    description: "Text-to-video generation with Minimax Hailuo 02 model",
    category: "video",
    initialInput: {
      prompt: "A cinematic scene with professional quality",
      duration: "6",
      prompt_optimizer: true,
      resolution: "768P",
    },
  },
  {
    endpointId: "fal-ai/bytedance/seedance/v1/pro/image-to-video",
    label: "Seedance 1.0 Pro (I2V)",
    description: "High-quality image-to-video generation with multiple angle shot variations and advanced motion control",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Animate this image with cinematic motion and multiple camera angles",
      resolution: "1080p",
      duration: "5",
      camera_fixed: false,
      enable_safety_checker: true,
    },
  },
  {
    endpointId: "fal-ai/ideogram/character",
    label: "Ideogram Character",
    description: "Generate consistent character appearances across multiple images with maintained facial features, proportions, and distinctive traits for cohesive storytelling and branding",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Place the character in a new scene while maintaining their distinctive appearance and personality",
      reference_image_urls: [],
      image_size: "square_hd",
      style: "AUTO",
      rendering_speed: "BALANCED",
      expand_prompt: true,
      num_images: 1,
    },
  },
  {
    endpointId: "fal-ai/elevenlabs/tts/turbo-v2.5",
    label: "ElevenLabs TTS Turbo v2.5",
    description: "High-quality text-to-speech generation with natural voice synthesis and multiple voice options",
    category: "voiceover",
    initialInput: {
      text: "Hello, this is a sample text for speech synthesis.",
      voice_id: "pNInz6obpgDQGcFmaJgB", // Adam voice
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    },
  },
];
