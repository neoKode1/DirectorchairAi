import Anthropic from '@anthropic-ai/sdk';

// Tool definitions for Claude's tool_use API
export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'generate_image',
    description: 'Generate an image using AI models. Use this when the user wants to create, edit, or transform images. Choose the best model based on the request.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: {
          type: 'string',
          description: 'Detailed cinematic prompt for image generation. Apply your director expertise to craft this.'
        },
        model: {
          type: 'string',
          description: 'The fal model ID to use.',
          enum: [
            'fal-ai/imagen4/preview',
            'fal-ai/stable-diffusion-v35-large',
            'fal-ai/bytedance/dreamina/v3.1/text-to-image',
            'fal-ai/flux-pro/v1.1-ultra',
            'fal-ai/flux-pro/kontext/max',
            'fal-ai/flux-krea-lora/image-to-image',
            'fal-ai/nano-banana/edit',
            'fal-ai/nano-banana-pro/edit',
            'fal-ai/gemini-25-flash-image/edit',
            'fal-ai/bytedance/seedream/v4/edit',
            'fal-ai/bytedance/seedream/v4.5/edit',
            'fal-ai/bytedance/seedream/v5/lite/edit',
            'fal-ai/bytedance/seedream/v5/lite/text-to-image',
            'fal-ai/flux-2-flex',
            'fal-ai/flux-2-flex/edit',
            'fal-ai/qwen-image-edit',
            'xai/grok-imagine-image/edit',
            'fal-ai/wan/v2.7/edit',
            'fal-ai/wan/v2.7/pro/edit',
            'fal-ai/wan/v2.7/pro/text-to-image'
          ]
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio for the image',
          enum: ['16:9', '9:16', '4:3', '3:4']
        },
        negative_prompt: {
          type: 'string',
          description: 'What NOT to generate. Reduces artifacts. Example: "blur, distort, low quality". Supported by SD 3.5, Flux, Seedream, and others.'
        },
        requires_reference_image: {
          type: 'boolean',
          description: 'Set to true if the chosen model requires a reference image (edit/i2i models) and no image has been provided yet.'
        }
      },
      required: ['prompt', 'model']
    }
  },
  {
    name: 'generate_video',
    description: 'Generate a video using AI models. Use this when the user wants to create animations, cinematic shots, or video content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: {
          type: 'string',
          description: 'Detailed cinematic prompt for video generation with camera movements, lighting, and mood.'
        },
        model: {
          type: 'string',
          description: 'The fal model ID for video generation.',
          enum: [
            'fal-ai/sora-2/image-to-video',
            'fal-ai/sora-2/image-to-video/pro',
            'fal-ai/sora-2/video-to-video/remix',
            'fal-ai/veo3.1/fast/image-to-video',
            'fal-ai/veo3.1/fast/first-last-frame-to-video',
            'fal-ai/kling-video/v2.6/pro/image-to-video',
            'fal-ai/kling-video/v2.6/standard/motion-control',
            'fal-ai/kling-video/v2.6/pro/motion-control',
            'fal-ai/kling-video/o1/video-to-video/edit',
            'fal-ai/kling-video/o3/standard/video-to-video/edit',
            'fal-ai/kling-video/o3/pro/video-to-video/edit',
            'fal-ai/kling-video/v3/pro/image-to-video',
            'fal-ai/kling-video/o3/standard/image-to-video',
            'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
            'fal-ai/kling-video/v2.1/master/image-to-video',
            'fal-ai/kling-video/v1/pro/ai-avatar',
            'fal-ai/minimax/hailuo-02/standard/image-to-video',
            'fal-ai/minimax/hailuo-2.3/standard/image-to-video',
            'endframe/minimax-hailuo-02',
            'fal-ai/luma-dream-machine/ray-2/image-to-video',
            'fal-ai/wan-pro/image-to-video',
            'fal-ai/wan/v2.2-a14b/image-to-video',
            'fal-ai/wan-25-preview/image-to-video',
            'fal-ai/pixverse/v6/image-to-video',
            'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
            'fal-ai/bytedance/seedance-2.0/fast/reference-to-video',
            'fal-ai/bytedance/seedance-2.0/fast/image-to-video',
            'fal-ai/hunyuan-video',
            'xai/grok-imagine-video/text-to-video',
            'xai/grok-imagine-video/image-to-video',
            'fal-ai/bytedance/dreamactor/v2',
            'fal-ai/ovi/image-to-video'
          ]
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio for the video',
          enum: ['16:9', '9:16']
        },
        duration: {
          type: 'string',
          description: 'Video duration. Veo 3.1: "4s","6s","8s". Kling v3/O3: "3"-"15". Sora 2: number 1-20. Others: "5" or "6".'
        },
        resolution: {
          type: 'string',
          description: 'Video resolution. Veo 3.1: "720p","1080p","4k". Minimax: "512P","768P". Others: "720p" or "1080p".'
        },
        generate_audio: {
          type: 'boolean',
          description: 'Enable native audio generation. Supported by Veo 3.1, Kling v3/O3. Defaults to true.'
        },
        end_image_url: {
          type: 'string',
          description: 'URL for the end frame image. Used by Kling v3/O3 for start→end frame video transitions. The start frame comes from the uploaded/generated image in context.'
        },
        first_frame_url: {
          type: 'string',
          description: 'URL for the first frame. Used ONLY by Veo 3.1 First/Last Frame model. If not set, the system uses the first image in context.'
        },
        last_frame_url: {
          type: 'string',
          description: 'URL for the last frame. Used ONLY by Veo 3.1 First/Last Frame model. If not set, the system uses the second image in context.'
        },
        video_url: {
          type: 'string',
          description: 'Source video URL for V2V (video-to-video) models: Sora 2 Remix, Kling O1/O3 Video Edit, Kling v2.6 Motion Control. Required for these models.'
        },
        character_orientation: {
          type: 'string',
          description: 'For Kling v2.6 Motion Control only. "video" = orientation matches reference video (max 30s). "image" = matches reference image (max 10s).',
          enum: ['video', 'image']
        },
        keep_audio: {
          type: 'boolean',
          description: 'Whether to keep original audio from reference video. Used by V2V edit models. Defaults to true.'
        },
        elements: {
          type: 'array',
          description: 'Character/object elements for Kling V2V edit models. Each element has frontal_image_url and reference_image_urls. Referenced in prompt as @Element1, @Element2.'
        },
        image_urls: {
          type: 'array',
          description: 'Multiple reference images for V2V edit models. Referenced in prompt as @Image1, @Image2. Max 4 total with elements.'
        },
        style: {
          type: 'string',
          description: 'Style preset for Pixverse V6 only. Options: "anime", "3d_animation", "clay", "comic", "cyberpunk".',
          enum: ['anime', '3d_animation', 'clay', 'comic', 'cyberpunk']
        },
        negative_prompt: {
          type: 'string',
          description: 'What NOT to generate. Reduces artifacts. Example: "blur, distort, low quality". Supported by Kling v3/O3 and other models.'
        },
        requires_reference_image: {
          type: 'boolean',
          description: 'Set to true if the model requires a reference/source image and none was provided.'
        }
      },
      required: ['prompt', 'model']
    }
  },
  {
    name: 'request_reference_image',
    description: 'Ask the user to upload a reference image. Use this when you need a character reference, style reference, or source image for image-to-image/image-to-video generation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Why you need the image — explain to the user what kind of image to upload (e.g., "I need a character reference photo to maintain consistency" or "Upload the image you want me to animate").'
        },
        purpose: {
          type: 'string',
          description: 'What you plan to do with the image once received.',
          enum: ['character_reference', 'style_reference', 'image_to_video', 'image_edit', 'image_to_image']
        }
      },
      required: ['reason', 'purpose']
    }
  },
];

