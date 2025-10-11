"use client";

import { fal } from "@fal-ai/client";

// Configure the global FAL client using the latest recommended pattern
fal.config({
  proxyUrl: "/api/fal/proxy",
});

// Create a client using the standard configuration (for legacy compatibility)
export const falClient = fal;

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
  category: "image" | "video" | "music" | "voiceover" | "lipsync";
  inputAsset?: InputAsset[];
  initialInput?: Record<string, unknown>;
  inputMap?: Record<string, string>;
  supportsMultipleImages?: boolean; // New property to track multi-image capability
  maxImages?: number; // Maximum number of images supported
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
  },
  "fal-ai/qwen-image-edit": {
    supportsStyleReference: false,
    supportsStylePresets: false,
    maxStyleStrength: 0,
  },
  "fal-ai/ffmpeg-api/extract-frame": {
    supportsStyleReference: false,
    supportsStylePresets: false,
    maxStyleStrength: 0,
  },
      "fal-ai/sora-2/image-to-video": {
        supportsStyleReference: false,
        supportsStylePresets: true,
        maxStyleStrength: 0,
      },
      "fal-ai/sora-2/image-to-video/pro": {
        supportsStyleReference: false,
        supportsStylePresets: true,
        maxStyleStrength: 0,
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
      seed: undefined, // Optional seed for reproducibility
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
    endpointId: "fal-ai/bytedance/seedream/v4/edit",
    label: "Seedream 4.0 Edit",
    description: "New-generation image creation model by ByteDance that integrates image generation and image editing capabilities into a single, unified architecture",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Dress the model in the clothes and hat. Add a cat to the scene and change the background to a Victorian era building.",
      num_images: 1,
      max_images: 1,
      enable_safety_checker: true,
      image_size: "auto", // Seedream uses image_size, not aspect_ratio. "auto" maintains input aspect ratio
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
      num_images: 1,
      output_format: "jpeg",
      enhance_prompt: true,
      raw: false,
      safety_tolerance: "2",
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
      num_inference_steps: 28,
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
  {
    endpointId: "fal-ai/nano-banana/edit",
    label: "Nano Banana Edit (Advanced Controls)",
    description: "Advanced image editing with fine-grained controls (strength, guidance scale) for precise modifications. Perfect for users who want detailed control over editing parameters and artistic style adjustments.",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Edit this image with creative modifications",
      image_urls: [],
      num_images: 1,
      output_format: "jpeg",
      strength: 0.9,
      guidance_scale: 7.5,
    },
  },
  {
    endpointId: "fal-ai/gemini-25-flash-image/edit",
    label: "Gemini 2.5 Flash (Multi-Image Optimized)",
    description: "Google's latest multi-image editing model optimized for blending multiple reference images. Streamlined API with powerful multi-image capabilities. Best for combining and blending multiple photos into cohesive edits. Can work with single images but designed for multiple image scenarios.",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true, // Enable multi-image support
    maxImages: 5, // Support up to 5 images
    initialInput: {
      prompt: "Edit this image with creative modifications",
      image_urls: ["https://example.com/sample-image.jpg"], // Single image example
      num_images: 1,
    },
  },
  {
    endpointId: "fal-ai/qwen-image-edit",
    label: "Qwen Image Edit",
    description: "Qwen's Image Editing model with superior text editing capabilities for precise image modifications",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Edit this image with creative modifications",
      image_url: "",
      num_inference_steps: 30,
      guidance_scale: 4,
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
      negative_prompt: "blurry, ugly, low quality",
      acceleration: "regular",
      sync_mode: false,
    },
  },

      // Video Generation Models
      {
        endpointId: "fal-ai/sora-2/image-to-video",
        label: "Sora 2 (Image-to-Video)",
        description: "OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from images and natural language prompts",
        category: "video",
        inputAsset: ["image"], // Image-to-video only
        supportsMultipleImages: false,
        maxImages: 1,
        initialInput: {
          prompt: "A woman looks into the camera, breathes in, then exclaims energetically",
          image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
          resolution: "auto",
          aspect_ratio: "auto",
          duration: 4,
        },
      },
      {
        endpointId: "fal-ai/sora-2/image-to-video/pro",
        label: "Sora 2 Pro (Image-to-Video)",
        description: "OpenAI's premium state-of-the-art video model with enhanced quality, higher resolution support (up to 1080p), and superior detail generation",
        category: "video",
        inputAsset: ["image"], // Image-to-video only
        supportsMultipleImages: false,
        maxImages: 1,
        initialInput: {
          prompt: "Front-facing 'invisible' action-cam on a skydiver in freefall above bright clouds; camera locked on his face. He speaks over the wind with clear lipsync: 'This is insanely fun! You've got to try it—book a tandem and go!' Natural wind roar, voice close-mic'd and slightly compressed so it's intelligible. Midday sun, goggles and jumpsuit flutter, altimeter visible, parachute rig on shoulders. Energetic but stable framing with subtle shake; brief horizon roll. End on first tug of canopy and wind noise dropping.",
          image_url: "https://storage.googleapis.com/falserverless/example_inputs/sora-2-i2v-input.png",
          resolution: "auto",
          aspect_ratio: "auto", 
          duration: 4,
        },
      },
  {
    endpointId: "fal-ai/veo3/image-to-video",
    label: "Veo 3",
    description: "Google DeepMind's latest state-of-the-art video generation model for animating images",
    category: "video",
    inputAsset: ["image"], // Image-to-video only
    supportsMultipleImages: false,
    maxImages: 1,
    initialInput: {
      prompt: "A woman looks into the camera, breathes in, then exclaims energetically",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "16:9",
      duration: "8s",
      generate_audio: true,
      resolution: "720p",
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
    endpointId: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    label: "Kling V2.5 Turbo Pro (I2V)",
    description: "Top-tier image-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "A stark starting line divides two powerful cars, engines revving for the challenge ahead. They surge forward in the heat of competition, a blur of speed and chrome. The finish line looms as they vie for victory.",
      image_url: "https://v3.fal.media/files/panda/HnY2yf-BbzlrVQxR-qP6m_9912d0932988453aadf3912fc1901f52.jpg",
      duration: "5",
      negative_prompt: "blur, distort, and low quality",
      cfg_scale: 0.5,
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
    endpointId: "fal-ai/hunyuan-video",
    label: "Hunyuan Video",
    description: "Tencent's advanced video generation model with high-quality motion and detail",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Animate this image with smooth, realistic motion",
      duration: 4,
      aspect_ratio: "16:9",
      resolution: "720p",
    },
  },
  {
    endpointId: "fal-ai/wan-pro/image-to-video",
    label: "Wan Pro (Image-to-Video)",
    description: "Wan-2.1 Pro is a premium image-to-video model that generates high-quality 1080p videos at 30fps with up to 6 seconds duration, delivering exceptional visual quality and motion diversity from images",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
      image_url: "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg",
      enable_safety_checker: true,
    },
  },
  {
    endpointId: "fal-ai/wan/v2.2-a14b/image-to-video",
    label: "Wan v2.2-A14B (Image-to-Video)",
    description: "Wan v2.2-A14B generates high-quality videos from images with extensive customization options including resolution (480p/580p/720p), aspect ratio, frame interpolation, and video quality settings",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      image_url: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
      prompt: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
      num_frames: 81,
      frames_per_second: 16,
      resolution: "720p",
      aspect_ratio: "auto",
      num_inference_steps: 27,
      enable_safety_checker: true,
      enable_output_safety_checker: false,
      enable_prompt_expansion: false,
      acceleration: "regular",
      guidance_scale: 3.5,
      guidance_scale_2: 3.5,
      shift: 5,
      interpolator_model: "film",
      num_interpolated_frames: 1,
      adjust_fps_for_interpolation: true,
      video_quality: "high",
      video_write_mode: "balanced",
      negative_prompt: "",
    },
  },
  {
    endpointId: "fal-ai/ovi/image-to-video",
    label: "Ovi (Image-to-Video with Audio)",
    description: "Ovi can generate videos with audio from image and text inputs. Creates immersive video content with synchronized audio generation",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "An intimate close-up of a European woman with long dark hair as she gently brushes her hair in a softly lit bedroom, her delicate hand moving in the foreground. She looks directly into the camera with calm, focused eyes, a faint serene smile glowing in the warm lamp light. She says, <S>[soft whisper] I am an artificial intelligence.<E>.<AUDCAP>Soft whispering female voice, ASMR tone with gentle breaths, cozy room acoustics, subtle emphasis on \"I am an artificial intelligence\".<ENDAUDCAP>",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/ovi_i2v_input.png",
      negative_prompt: "jitter, bad hands, blur, distortion",
      num_inference_steps: 30,
      audio_negative_prompt: "robotic, muffled, echo, distorted",
      resolution: "992x512", // Ovi requires specific resolution format
    },
  },
  {
    endpointId: "fal-ai/luma-dream-machine/ray-2/image-to-video",
    label: "Luma Ray 2 (Image-to-Video)",
    description: "Ray2 is Luma's state-of-the-art large-scale video generative model capable of creating realistic visuals with natural, coherent motion. Supports multiple resolutions (540p/720p/1080p) and durations (5s/9s)",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage.",
      image_url: "https://fal.media/files/elephant/8kkhB12hEZI2kkbU8pZPA_test.jpeg",
      aspect_ratio: "16:9",
      resolution: "540p",
      duration: "5s",
      loop: false,
    },
  },
  {
    endpointId: "fal-ai/wan-25-preview/image-to-video",
    label: "Wan 2.5 Preview (Image-to-Video)",
    description: "Wan 2.5 is an advanced image-to-video model featuring motion generation based on text prompts, 480p/720p/1080p resolutions, 5 or 10-second video generation, and optional audio integration. Processing time: 1-3 minutes",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
      image_url: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
      resolution: "1080p",
      duration: "5",
      negative_prompt: "low resolution, error, worst quality, low quality, defects",
      enable_prompt_expansion: true,
    },
  },
  {
    endpointId: "fal-ai/kling-video/v1/pro/ai-avatar",
    label: "Kling AI Avatar Pro",
    description: "Create avatar videos with realistic humans, animals, cartoons, or stylized characters. Requires both an image and audio file for lip-sync generation",
    category: "video",
    inputAsset: ["image", "audio"],
    initialInput: {
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/kling_ai_avatar_input.jpg",
      audio_url: "https://v3.fal.media/files/rabbit/9_0ZG_geiWjZOmn9yscO6_output.mp3",
      prompt: "",
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
  {
    endpointId: "fal-ai/minimax/preview/speech-2.5-hd",
    label: "MiniMax Speech 2.5 HD",
    description: "High-quality text-to-speech with advanced AI techniques and multiple voice options",
    category: "voiceover",
    initialInput: {
      text: "Hello, this is a test of the MiniMax Speech 2.5 HD system.",
      voice_setting: {
        voice_id: "Wise_Woman",
        speed: 1,
        vol: 1,
        pitch: 0,
        english_normalization: false
      },
      audio_setting: {
        sample_rate: "32000",
        bitrate: "128000",
        format: "mp3",
        channel: "1"
      },
      output_format: "url"
    },
  },
  {
    endpointId: "fal-ai/minimax/voice-clone",
    label: "MiniMax Voice Clone",
    description: "Clone custom voices from audio samples and generate personalized TTS",
    category: "voiceover",
    initialInput: {
      audio_url: "",
      text: "Hello, this is a preview of your cloned voice! I hope you like it!",
      model: "speech-02-hd",
      noise_reduction: true,
      need_volume_normalization: true,
      accuracy: 0.8
    },
  },
  {
    endpointId: "fal-ai/sync-lipsync",
    label: "Sync LipSync",
    description: "Advanced lip sync with multiple sync modes and model versions",
    category: "lipsync",
    inputAsset: ["video", "audio"],
    initialInput: {
      model: "lipsync-1.9.0-beta",
      video_url: "",
      audio_url: "",
      sync_mode: "cut_off"
    },
  },
  {
    endpointId: "fal-ai/ffmpeg-api/extract-frame",
    label: "FFmpeg Extract Frame",
    description: "Extract first, middle, or last frame from videos using FFmpeg. Supports frame_type: 'first', 'middle', 'last'. Note: Time-based extraction (e.g., 'at 4 seconds') is not supported - only predefined frame positions.",
    category: "image",
    inputAsset: ["video"],
    initialInput: {
      video_url: "",
      frame_type: "first", // "first", "middle", or "last"
    },
  },
  {
    endpointId: "endframe/minimax-hailuo-02",
    label: "EndFrame (Minimax)",
    description: "Create smooth video transitions between two images using Minimax's EndFrame technology. Upload a start frame and end frame, then describe the transition",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      firstImage: "",
      secondImage: "",
      prompt: "Describe the transition between your start and end frames",
      model: "MiniMax-Hailuo-02"
    },
  },
];
