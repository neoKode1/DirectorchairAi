"use client";

import { fal } from "@fal-ai/client";

// Configure the global FAL client using the latest recommended pattern
fal.config({
  proxyUrl: "/api/fal/proxy",
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
  category: "image" | "video" | "music" | "voiceover" | "lipsync";
  inputAsset?: InputAsset[];
  initialInput?: Record<string, unknown>;
  inputMap?: Record<string, string>;
  supportsMultipleImages?: boolean;
  maxImages?: number;
};

export type StyleReference = {
  url: string;
  weight: number;
};

// Client-side endpoint catalog (no sensitive data)
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
    endpointId: "fal-ai/flux-2-flex",
    label: "FLUX 2 Flex",
    description: "Text-to-image generation with FLUX.2 [flex] from Black Forest Labs. Features adjustable inference steps and guidance scale for fine-tuned control. Enhanced typography and text rendering capabilities",
    category: "image",
    initialInput: {
      prompt: "A high-quality 3D render of a cute fluffy monster eating a giant donut; the fur simulation is incredibly detailed, the donut glaze is sticky and reflective, bright daylight lighting, shallow depth of field.",
      image_size: "landscape_4_3",
      enable_prompt_expansion: true,
      safety_tolerance: "2",
      enable_safety_checker: true,
      output_format: "jpeg",
      guidance_scale: 3.5,
      num_inference_steps: 28,
      sync_mode: false,
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
    endpointId: "fal-ai/bytedance/seedream/v4.5/edit",
    label: "SeeDream 4.5 Edit",
    description: "Latest generation image editing model by ByteDance with enhanced multi-image editing capabilities (up to 10 images) and improved quality",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 10,
    initialInput: {
      prompt: "Replace the product in Figure 1 with that in Figure 2. For the title copy the text in Figure 3 to the top of the screen, the title should have a clear contrast with the background but not be overly eye-catching.",
      image_urls: [],
      image_size: "auto_4K",
      num_images: 1,
      max_images: 1,
    },
  },
  {
    endpointId: "fal-ai/bytedance/seedream/v5/lite/text-to-image",
    label: "Seedream 5.0 Lite (T2I)",
    description: "Fast ByteDance Seedream 5.0 Lite text-to-image model with high-quality 2K generation at a cost-efficient price point",
    category: "image",
    initialInput: {
      prompt: "Realistic DSLR photograph of an anthropomorphic Pekingese dog enjoying a bowl of ramen on the Great Wall of China with readable text at the top.",
      image_size: "auto_2K",
      num_images: 1,
      max_images: 1,
      enable_safety_checker: true,
    },
  },
  {
    endpointId: "fal-ai/bytedance/seedream/v5/lite/edit",
    label: "Seedream 5.0 Lite Edit",
    description: "Fast ByteDance Seedream 5.0 Lite image editing model with multi-image input support and high quality intelligent edits",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 10,
    initialInput: {
      prompt: "Replace the product in Figure 1 with that in Figure 2 and seamlessly integrate the logo from Figure 3 into the design.",
      image_urls: [],
      image_size: "auto_2K",
      num_images: 1,
      max_images: 1,
      enable_safety_checker: true,
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
    endpointId: "fal-ai/flux-pro/kontext/max",
    label: "Flux Pro Kontext Max",
    description: "FLUX.1 Kontext [max] with greatly improved prompt adherence and typography generation for premium consistency in editing",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Put a donut next to the flour.",
      image_url: "",
      guidance_scale: 3.5,
      num_images: 1,
      output_format: "jpeg", // jpeg or png
      safety_tolerance: "2", // 1-6, default 2
      enhance_prompt: false,
      // aspect_ratio: "16:9", // Optional: 21:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:21
      // seed: undefined // Optional for reproducibility
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
    endpointId: "fal-ai/flux-2-flex/edit",
    label: "FLUX 2 Flex Edit",
    description: "Image editing with FLUX.2 [flex] from Black Forest Labs. Supports multi-reference editing with customizable inference steps and enhanced text rendering",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Change colors of the vase. In a cozy living room setting, visualize a gradient vase placed on a table, flowing from rich #6a0dad to soft #ff69b4. Add an artistic carving text with a big font on vase says \"FLEX\" in the middle.",
      image_urls: [],
      image_size: "auto",
      enable_prompt_expansion: true,
      safety_tolerance: "2",
      enable_safety_checker: true,
      output_format: "jpeg",
      guidance_scale: 3.5,
      num_inference_steps: 28,
    },
  },
  {
    endpointId: "fal-ai/nano-banana-pro/edit",
    label: "Nano Banana Pro",
    description: "Google's state-of-the-art image generation and editing model (Nano Banana 2) with multi-image support, web search, and 1K-4K resolution options",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "make a photo of the man driving the car down the california coastline",
      image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png", "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"],
      num_images: 1,
      aspect_ratio: "auto",
      output_format: "png",
      resolution: "1K",
      safety_tolerance: "4",
      sync_mode: false,
    },
  },
  {
    endpointId: "fal-ai/nano-banana/edit",
    label: "Nano Banana Edit",
    description: "Google's state-of-the-art image generation and editing model with multi-image support for precise modifications",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    initialInput: {
      prompt: "Edit this image with creative modifications",
      image_urls: [],
      num_images: 1,
      output_format: "jpeg", // jpeg, png, webp
      // aspect_ratio: "16:9", // Optional: 21:9, 1:1, 4:3, 3:2, 2:3, 5:4, 4:5, 3:4, 16:9, 9:16
      // sync_mode: false, // Optional: If True, media returned as data URI
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
  {
    endpointId: "xai/grok-imagine-image/edit",
    label: "Grok Imagine Image Edit",
    description: "xAI's Grok Imagine model for precise image editing with enhanced realism and style preservation. Supports 1-4 images per request",
    category: "image",
    inputAsset: ["image"],
    initialInput: {
      prompt: "Make this scene more realistic but still keep the game vibes",
      image_url: "",
      num_images: 1,
      output_format: "jpeg",
      sync_mode: false,
    },
  },
  {
    endpointId: "xai/grok-imagine-video/text-to-video",
    label: "Grok Imagine Video (T2V)",
    description: "Generate videos with audio from text using xAI's Grok Imagine Video. Supports 1-15s duration, multiple aspect ratios, and 480p/720p resolution",
    category: "video",
    initialInput: {
      prompt: "Anime schoolgirl bursting out of house door, cherry blossoms blowing, morning light, speed lines indicating rush, chibi-ready expressions, classic shojo aesthetic, vibrant colors",
      duration: 6,
      aspect_ratio: "16:9",
      resolution: "720p",
    },
  },
  {
    endpointId: "xai/grok-imagine-video/image-to-video",
    label: "Grok Imagine Video (I2V)",
    description: "Generate videos with audio from images using xAI's Grok Imagine Video. Supports 1-15s duration, auto/multiple aspect ratios, and 480p/720p resolution",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: false,
    maxImages: 1,
    initialInput: {
      prompt: "Medieval knight in ornate armor walking through a mystical forest, bioluminescent plants pulsing with light, ancient stone ruins overgrown with glowing vines, over-the-shoulder camera, dark fantasy aesthetic, volumetric fog and Lumen lighting",
      image_url: "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png",
      duration: 6,
      aspect_ratio: "auto",
      resolution: "720p",
    },
  },
  {
    endpointId: "xai/grok-imagine-video/v1.5/image-to-video",
    label: "Grok Imagine Video 1.5 (I2V)",
    description: "Premium xAI Grok Imagine Video 1.5 image-to-video model for higher-quality motion generation with audio, 1-15s duration, and 480p/720p outputs",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: false,
    maxImages: 1,
    initialInput: {
      prompt: "A cinematic portrait comes alive with subtle breathing, eye movement, soft wind through hair, shallow depth of field, and natural ambient sound.",
      image_url: "https://v3b.fal.media/files/b/0a8b90e0/BFLE9VDlZqsryU-UA3BoD_image_004.png",
      duration: 5,
      aspect_ratio: "auto",
      resolution: "720p",
    },
  },
  {
    endpointId: "fal-ai/wan-25-preview/image-to-image",
    label: "Wan 2.5 (Image-to-Image)",
    description: "Wan 2.5 image-to-image model for editing images using text prompts with subject-consistent editing, multi-image fusion, and resolution support from 384-5000 pixels",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    initialInput: {
      prompt: "Reimagine the scene under a raging thunderstorm at night",
      image_urls: [],
      image_size: "square", // Can be: square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9 or custom {width, height}
      num_images: 1, // 1-4 images
      negative_prompt: "low resolution, error, worst quality, low quality, defects",
      enable_safety_checker: true,
      // seed: undefined // Optional: for reproducibility
    },
  },
  {
    endpointId: "fal-ai/wan/v2.7/pro/text-to-image",
    label: "Wan 2.7 Pro (T2I)",
    description: "Enhanced WAN 2.7 Pro text-to-image model with superior detail, composition, and bilingual prompt support",
    category: "image",
    initialInput: {
      prompt: "An astronaut riding a horse in a photorealistic style.",
      image_size: "square_hd",
      num_images: 1,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
  },
  {
    endpointId: "fal-ai/wan/v2.7/edit",
    label: "Wan 2.7 Edit",
    description: "Cost-efficient WAN 2.7 image editing model for text-guided transformations with 1-4 reference images",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Turn image 1 into a watercolor painting.",
      image_urls: [],
      image_size: "square_hd",
      num_images: 1,
      enable_prompt_expansion: true,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
  },
  {
    endpointId: "fal-ai/wan/v2.7/pro/edit",
    label: "Wan 2.7 Pro Edit",
    description: "Professional WAN 2.7 image editing model for higher-detail text-guided transformations with reference images",
    category: "image",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Turn image 1 into a cinematic concept painting with rich atmosphere and refined detail.",
      image_urls: [],
      image_size: "square_hd",
      num_images: 1,
      enable_prompt_expansion: true,
      enable_safety_checker: true,
      output_format: "jpeg",
    },
  },
  {
    endpointId: "fal-ai/bytedance/omnihuman",
    label: "DreamOmni",
    description: "DreamOmni is a cutting-edge AI model that generates high-quality human images with exceptional detail and realism",
    category: "image",
    initialInput: {
      prompt: "A professional portrait of a person in a business setting",
      num_images: 1,
      output_format: "jpeg",
      enable_safety_checker: true,
    },
  },
  {
    endpointId: "fal-ai/bytedance/dreamactor/v2",
    label: "DreamActor v2",
    description: "Transfer motion from a video to characters in an image using DreamActor v2. Great performance for non-human and multiple characters. Supports full face and body driving with up to 30s video input",
    category: "video",
    inputAsset: ["image", "video"],
    supportsMultipleImages: false,
    maxImages: 1,
    initialInput: {
      image_url: "https://v3b.fal.media/files/b/0a8d6292/E9WNRJh8K8DF9lSV0bkXs_image.png",
      video_url: "https://v3b.fal.media/files/b/0a8d633f/u5Ye7jXL0Cfo0ijz5M6YY_input_example_dreamactor.mp4",
      trim_first_second: true,
    },
  },
  {
    endpointId: "bytedance/seedance-2.0/fast/text-to-video",
    label: "Seedance 2.0 Fast (T2V)",
    description: "ByteDance's advanced Seedance 2.0 Fast text-to-video model with cinematic output, synchronized audio, multi-shot behavior, and director-level camera control",
    category: "video",
    initialInput: {
      prompt: "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut to an octopus football game under the sea.",
      resolution: "720p",
      duration: "auto",
      aspect_ratio: "auto",
      generate_audio: true,
      bitrate_mode: "standard",
    },
  },
  {
    endpointId: "bytedance/seedance-2.0/fast/image-to-video",
    label: "Seedance 2.0 Fast (I2V)",
    description: "ByteDance Seedance 2.0 Fast image-to-video model with synchronized audio, start/end frame control, 4-15s durations, and 480p/720p outputs",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      prompt: "An octopus finds a football in the ocean and excitedly calls its octopus friends to come and play. Cut to an octopus football game under the sea.",
      image_url: "https://v3b.fal.media/files/b/0a8eba37/Cqg-4Uwzyz4DELfceT1CF_a17e588773ec45b1a9e6f100a787b80b.jpg",
      resolution: "720p",
      duration: "auto",
      aspect_ratio: "auto",
      generate_audio: true,
      bitrate_mode: "standard",
    },
  },
  {
    endpointId: "bytedance/seedance-2.0/fast/reference-to-video",
    label: "Seedance 2.0 Fast (Reference-to-Video)",
    description: "ByteDance Seedance 2.0 Fast reference-to-video model supporting up to 9 images, 3 videos, and 3 audio clips as references",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 9,
    initialInput: {
      prompt: "Create a cinematic scene using @Image1 as the main character reference with matching style, motion, and atmosphere.",
      image_urls: [],
      resolution: "720p",
      duration: "auto",
      aspect_ratio: "auto",
      generate_audio: true,
      bitrate_mode: "standard",
    },
  },
  {
    endpointId: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
    label: "Seedance 1.5 Pro (I2V)",
    description: "ByteDance Seedance 1.5 Pro image-to-video model with audio generation, optional end frame, 4-12s durations, and up to 1080p output",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      prompt: "A man is crying and says, I should not have done it. I regret everything.",
      image_url: "https://v3b.fal.media/files/b/0a8773cd/REzCWn1BKUVuMFTxR-R3W_image_317.png",
      aspect_ratio: "16:9",
      resolution: "720p",
      duration: "5",
      enable_safety_checker: true,
      generate_audio: true,
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
          delete_video: true, // Privacy setting - deletes video after generation
        },
      },
      {
        endpointId: "fal-ai/sora-2/video-to-video/remix",
        label: "Sora 2 (Video-to-Video Remix)",
        description: "Video-to-video remix endpoint for Sora 2, OpenAI's advanced model that transforms existing videos based on new text or image prompts allowing rich edits, style changes, and creative reinterpretations while preserving motion and structure",
        category: "video",
        inputAsset: ["video"],
        initialInput: {
          video_id: "video_123",
          prompt: "Change the cat's fur color to purple.",
        },
      },
  {
    endpointId: "fal-ai/veo3.1/fast/image-to-video",
    label: "Veo 3.1 Fast (I2V)",
    description: "Google's Veo 3.1 Fast model for generating videos from images with 720p/1080p support and optional audio generation",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: false,
    maxImages: 1,
    initialInput: {
      prompt: "A woman looks into the camera, breathes in, then exclaims energetically",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "16:9", // 9:16 or 16:9
      duration: "8s", // Only 8s supported
      generate_audio: true,
      resolution: "720p", // 720p or 1080p
    },
  },
  {
    endpointId: "fal-ai/veo3.1/fast/first-last-frame-to-video",
    label: "Veo 3.1 Fast First/Last Frame",
    description: "Animate between a starting and ending frame using Google Veo 3.1 Fast for natural motion and cinematic continuity",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      first_frame_url: "https://storage.googleapis.com/falserverless/example_inputs/veo31-flf2v-input-1.jpeg",
      last_frame_url: "https://storage.googleapis.com/falserverless/example_inputs/veo31-flf2v-input-2.jpeg",
      prompt: "Describe how the first frame transforms into the last frame with motion, style, camera notes, and ambiance",
      duration: "8s",
      aspect_ratio: "16:9",
      resolution: "1080p",
      generate_audio: true
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
    endpointId: "fal-ai/kling-video/v2.6/pro/image-to-video",
    label: "Kling v2.6 Pro (I2V)",
    description: "Kling 2.6 Pro image-to-video model with cinematic visuals, fluid motion, native audio generation, and optional end-frame control",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      prompt: "A king walks slowly and says, my people, here I am, I am here to save you all.",
      start_image_url: "https://v3b.fal.media/files/b/0a84ab29/BSJXz9Ht-jgRgMf4IGxLU_upscaled.png",
      end_image_url: "",
      duration: "5",
      negative_prompt: "blur, distort, and low quality",
      generate_audio: true,
    },
  },
  {
    endpointId: "fal-ai/kling-video/o3/standard/image-to-video",
    label: "Kling O3 (I2V) [Pro]",
    description: "Generate video by animating between start and end frames with text-driven style and scene guidance. Supports 3-15s duration with optional native audio generation",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      prompt: "The character walks forward slowly, with the camera following from behind.",
      image_url: "https://v3b.fal.media/files/b/0a8cfd5a/8ABMp4n9rh3kfD2Rq8fHd_start_frame.png",
      end_image_url: "",
      duration: "5",
      generate_audio: false,
    },
  },
  {
    endpointId: "fal-ai/kling-video/v3/pro/image-to-video",
    label: "Kling v3 Pro (I2V)",
    description: "Top-tier image-to-video with cinematic visuals, fluid motion, and native audio generation. Supports custom elements (characters/objects), voice control, multi-shot generation, and 3-15s duration",
    category: "video",
    inputAsset: ["image"],
    supportsMultipleImages: true,
    maxImages: 2,
    initialInput: {
      prompt: "The craftsman slowly examines the bowl, turning it gently in his weathered hands. His eyes reflect years of wisdom. Subtle smile forms on his face. Dust particles drift in warm light. Breathing motion, blinking eyes.",
      start_image_url: "https://storage.googleapis.com/falserverless/example_inputs/kling-v3/pro-i2v/start_image.png",
      end_image_url: "",
      duration: "5",
      generate_audio: true,
      aspect_ratio: "16:9",
      negative_prompt: "blur, distort, and low quality",
      cfg_scale: 0.5,
    },
  },
  {
    endpointId: "fal-ai/kling-video/o1/video-to-video/edit",
    label: "Kling O1 Pro (V2V Edit)",
    description: "Edit existing videos with natural-language instructions while retaining original motion structure and supporting reference images/elements",
    category: "video",
    inputAsset: ["video"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Replace the character in the video with @Element1, maintaining the same movements and camera angles. Transform the landscape into @Image1.",
      video_url: "",
      keep_audio: false,
      image_urls: [],
    },
  },
  {
    endpointId: "fal-ai/kling-video/o3/standard/video-to-video/edit",
    label: "Kling O3 Standard (V2V Edit)",
    description: "Budget Kling O3 video-to-video edit model for transforming videos with reference images while preserving motion",
    category: "video",
    inputAsset: ["video"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Use @Image1 as the new environment while preserving the original motion and camera path.",
      video_url: "",
      keep_audio: true,
      image_urls: [],
    },
  },
  {
    endpointId: "fal-ai/kling-video/o3/pro/video-to-video/edit",
    label: "Kling O3 Pro (V2V Edit)",
    description: "Premium Kling O3 video-to-video edit model with reference images/elements for subject, setting, and style transformations",
    category: "video",
    inputAsset: ["video"],
    supportsMultipleImages: true,
    maxImages: 4,
    initialInput: {
      prompt: "Replace the hero with @Element1 and transform the scene using @Image1 while preserving the movement.",
      video_url: "",
      keep_audio: true,
      image_urls: [],
    },
  },
  {
    endpointId: "fal-ai/kling-video/v2.6/standard/motion-control",
    label: "Kling v2.6 Standard Motion Control",
    description: "Transfer motion from a reference video to a character image using Kling 2.6 standard motion control",
    category: "video",
    inputAsset: ["image", "video"],
    initialInput: {
      prompt: "A character dances with expressive movement matching the reference video.",
      image_url: "",
      video_url: "",
      character_orientation: "video",
      keep_original_sound: true,
    },
  },
  {
    endpointId: "fal-ai/kling-video/v2.6/pro/motion-control",
    label: "Kling v2.6 Pro Motion Control",
    description: "Higher quality Kling 2.6 motion control for complex dance moves and gestures from a reference video to a character image",
    category: "video",
    inputAsset: ["image", "video"],
    initialInput: {
      prompt: "An African American woman dancing with confident choreography.",
      image_url: "",
      video_url: "",
      character_orientation: "video",
      keep_original_sound: true,
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
    endpointId: "fal-ai/minimax/hailuo-2.3/standard/image-to-video",
    label: "Minimax Hailuo 2.3 Standard (I2V)",
    description: "MiniMax Hailuo 2.3 Standard image-to-video model with 768p output and 6s/10s duration options",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "The space station slowly rotates in orbit while Earth turns majestically in the background.",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/hailuo23/standard_i2v_in.jpg",
      duration: "6",
      prompt_optimizer: true,
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
    endpointId: "fal-ai/pixverse/v6/image-to-video",
    label: "PixVerse V6 (I2V)",
    description: "PixVerse V6 image-to-video model with 1-15s generation, 360p-1080p resolution, optional audio, and style presets",
    category: "video",
    inputAsset: ["image"],
    initialInput: {
      prompt: "A woman warrior with her hammer walking with her glacier wolf.",
      image_url: "https://v3.fal.media/files/zebra/qL93Je8ezvzQgDOEzTjKF_KhGKZTEebZcDw6T5rwQPK_output.png",
      resolution: "720p",
      duration: 5,
      negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus",
      generate_audio_switch: false,
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
    endpointId: "fal-ai/sync-lipsync/v2",
    label: "Sync LipSync 2.0",
    description: "Generate realistic lipsync animations from audio using advanced algorithms. Supports lipsync-2 and lipsync-2-pro models with multiple sync modes",
    category: "lipsync",
    inputAsset: ["video", "audio"],
    initialInput: {
      model: "lipsync-2", // lipsync-2 or lipsync-2-pro (pro costs 1.67x more)
      video_url: "",
      audio_url: "",
      sync_mode: "cut_off" // cut_off, loop, bounce, silence, remap
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
  {
    endpointId: "fal-ai/metadata",
    label: "Metadata Extraction",
    description: "Extract metadata from media files including images, videos, and audio files",
    category: "image",
    inputAsset: ["image", "video", "audio"],
    initialInput: {
      file_url: "",
    },
  },
  {
    endpointId: "fal-ai/veed/lipsync",
    label: "VEED LipSync",
    description: "Advanced lip sync technology for creating realistic mouth movements synchronized with audio",
    category: "lipsync",
    inputAsset: ["video", "audio"],
    initialInput: {
      video_url: "",
      audio_url: "",
      sync_mode: "cut_off"
    },
  },
];
