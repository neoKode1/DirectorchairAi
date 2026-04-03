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
            'fal-ai/flux-2-flex',
            'fal-ai/flux-2-flex/edit',
            'fal-ai/qwen-image-edit',
            'xai/grok-imagine-image/edit'
          ]
        },
        aspect_ratio: {
          type: 'string',
          description: 'Aspect ratio for the image',
          enum: ['16:9', '9:16', '1:1', '4:3', '3:4']
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
            'fal-ai/kling-video/v3/pro/image-to-video',
            'fal-ai/kling-video/o3/standard/image-to-video',
            'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
            'fal-ai/kling-video/v2.1/master/image-to-video',
            'fal-ai/kling-video/v1/pro/ai-avatar',
            'fal-ai/minimax/hailuo-02/standard/image-to-video',
            'endframe/minimax-hailuo-02',
            'fal-ai/luma-dream-machine/ray-2/image-to-video',
            'fal-ai/wan-pro/image-to-video',
            'fal-ai/wan/v2.2-a14b/image-to-video',
            'fal-ai/wan-25-preview/image-to-video',
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
          enum: ['16:9', '9:16', '1:1']
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
  {
    name: 'enhance_prompt',
    description: 'Enhance a basic prompt with cinematic director-level detail. Use this to transform a simple user request into a professional-grade generation prompt before calling generate_image or generate_video.',
    input_schema: {
      type: 'object' as const,
      properties: {
        original_prompt: {
          type: 'string',
          description: 'The user\'s original prompt or description.'
        },
        content_type: {
          type: 'string',
          enum: ['image', 'video'],
          description: 'Whether this is for image or video generation.'
        },
        style_direction: {
          type: 'string',
          description: 'Optional style guidance (e.g., "noir", "Villeneuve-style sci-fi", "warm documentary")'
        }
      },
      required: ['original_prompt', 'content_type']
    }
  }
];

