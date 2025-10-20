#!/usr/bin/env node

/**
 * Comprehensive API Model Testing Script
 * Tests ALL models in the application systematically
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.FAL_KEY;

// Comprehensive model test configurations - ALL MODELS
const MODEL_TESTS = {
  // 📸 Text-to-Image Models (23 models)
  'fal-ai/reve/text-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/reve/text-to-image',
      prompt: 'A beautiful sunset over mountains',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png',
      sync_mode: false
    },
    expectedStatus: 200,
    description: 'Reve Text-to-Image generation'
  },
  
  'fal-ai/reve/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/reve/edit',
      prompt: 'Make the sky more dramatic',
      image_url: 'https://picsum.photos/512/512',
      num_images: 1,
      output_format: 'png',
      sync_mode: false
    },
    expectedStatus: 200,
    description: 'Reve Edit image transformation'
  },

  'fal-ai/reve/remix': {
    endpoint: '/api/generate/reve-remix',
    method: 'POST',
    body: {
      prompt: 'Combine these images into a beautiful scene',
      image_urls: [
        'https://picsum.photos/512/512',
        'https://picsum.photos/512/512'
      ],
      aspect_ratio: '16:9',
      output_format: 'jpeg',
      sync_mode: false
    },
    expectedStatus: 200,
    description: 'Reve Remix multi-image combination'
  },

  'fal-ai/flux-pro/v1.1-ultra': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/v1.1-ultra',
      prompt: 'A futuristic cityscape at night',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'jpeg'
    },
    expectedStatus: 200,
    description: 'Flux Pro Ultra image generation'
  },

  'fal-ai/wan-25-preview/text-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/text-to-image',
      prompt: 'A serene mountain landscape',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 Text-to-Image'
  },

  'fal-ai/imagen4/preview': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/imagen4/preview',
      prompt: 'A professional headshot of a business person',
      aspect_ratio: '1:1',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Google Imagen 4 Preview'
  },

  'fal-ai/recraft/v3/text-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/recraft/v3/text-to-image',
      prompt: 'A modern logo design for a tech company',
      aspect_ratio: '1:1',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Recraft V3 Text-to-Image'
  },

  'fal-ai/hidream-i1-full': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/hidream-i1-full',
      prompt: 'A dreamy fantasy landscape with floating islands',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'HiDream-I1 Full'
  },

  'fal-ai/flux-krea-lora/stream': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-krea-lora/stream',
      prompt: 'A cyberpunk city at night with neon lights',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Krea LoRA Stream'
  },

  'fal-ai/qwen-image-edit/image-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/qwen-image-edit/image-to-image',
      prompt: 'Add a beautiful sunset background',
      image_url: 'https://picsum.photos/512/512',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Qwen Image Edit'
  },

  'fal-ai/wan-25-preview/image-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/image-to-image',
      prompt: 'Transform this into a watercolor painting',
      image_url: 'https://picsum.photos/512/512',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 Image-to-Image'
  },

  'fal-ai/nano-banana/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/nano-banana/edit',
      prompt: 'Make this image more vibrant and colorful',
      image_url: 'https://picsum.photos/512/512',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Nano Banana Edit'
  },

  'fal-ai/bytedance/seedream/v4/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/bytedance/seedream/v4/edit',
      prompt: 'Add dramatic lighting to this scene',
      image_url: 'https://picsum.photos/512/512',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Seedream 4.0 Edit'
  },

  'fal-ai/dreamomni2/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/dreamomni2/edit',
      prompt: 'Transform this into a fantasy artwork',
      image_url: 'https://picsum.photos/512/512',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'DreamOmni2 Edit'
  },

  'fal-ai/luma-photon/flash/reframe': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-photon/flash/reframe',
      prompt: 'Reframe this image to focus on the center subject',
      image_url: 'https://picsum.photos/512/512',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Luma Photon Flash Reframe'
  },

  'fal-ai/flux-kontext-lora': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-kontext-lora',
      prompt: 'A detailed architectural drawing of a modern building',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Kontext LoRA'
  },

  'fal-ai/flux-kontext-lora/text-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-kontext-lora/text-to-image',
      prompt: 'A vintage poster design with retro aesthetics',
      aspect_ratio: '3:4',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Kontext LoRA Text-to-Image'
  },

  'fal-ai/flux-kontext-lora/inpaint': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-kontext-lora/inpaint',
      prompt: 'Fill this area with a beautiful garden',
      image_url: 'https://picsum.photos/512/512',
      mask_url: 'https://picsum.photos/256/256',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Kontext LoRA Inpaint'
  },

  'fal-ai/flux-pro/kontext/text-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/text-to-image',
      prompt: 'A professional product photography setup',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Text-to-Image'
  },

  'fal-ai/flux-pro/kontext/max': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/max',
      prompt: 'A cinematic movie poster with dramatic lighting',
      aspect_ratio: '2:3',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Max'
  },

  'fal-ai/flux-pro/kontext/max/multi': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/max/multi',
      prompt: 'A series of connected scenes showing a story progression',
      aspect_ratio: '16:9',
      num_images: 3,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Max Multi'
  },

  'fal-ai/flux-pro/kontext/multi': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/multi',
      prompt: 'Multiple variations of a modern logo design',
      aspect_ratio: '1:1',
      num_images: 2,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Multi'
  },

  // 🎬 Text-to-Video Models (16 models)
  'fal-ai/veo3.1': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1',
      prompt: 'A cat playing with a ball of yarn',
      duration: '8s',
      aspect_ratio: '16:9',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 text-to-video'
  },

  'fal-ai/veo3.1/fast': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/fast',
      prompt: 'A bird flying over a forest',
      duration: '5s',
      aspect_ratio: '16:9',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Fast'
  },

  'fal-ai/sora-2/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/text-to-video',
      prompt: 'Ocean waves crashing on rocks',
      duration: 4,
      resolution: '720p',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Sora 2 text-to-video'
  },

  'fal-ai/sora-2/text-to-video/pro': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/text-to-video/pro',
      prompt: 'A dramatic Hollywood breakup scene at dusk',
      duration: 4,
      resolution: '1080p',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Sora 2 Pro text-to-video'
  },

  'fal-ai/kling-video/v2.1/master/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.1/master/text-to-video',
      prompt: 'A dog running through a field',
      duration: '5',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.1 Master text-to-video'
  },

  'fal-ai/kling-video/v2.5-turbo/pro/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
      prompt: 'A professional dance performance',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.5 Turbo Pro text-to-video'
  },

  'fal-ai/wan-25-preview/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/text-to-video',
      prompt: 'A time-lapse of a city from day to night',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 Text-to-Video'
  },

  'fal-ai/luma-dream-machine': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine',
      prompt: 'A magical forest with glowing mushrooms',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Dream Machine'
  },

  'fal-ai/luma-dream-machine/ray-2': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2',
      prompt: 'A cinematic car chase through city streets',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2'
  },

  'fal-ai/luma-dream-machine/ray-2-flash': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash',
      prompt: 'A fast-paced action sequence',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash'
  },

  'fal-ai/hunyuan-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/hunyuan-video',
      prompt: 'A peaceful lake with gentle ripples',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Hunyuan Video'
  },

  'fal-ai/wan/v2.2-a14b/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan/v2.2-a14b/text-to-video',
      prompt: 'A futuristic city with flying cars',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Wan v2.2-A14B Text-to-Video'
  },

  'fal-ai/ovi': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/ovi',
      prompt: 'A musical performance with synchronized audio',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Ovi Audio-Video'
  },

  'fal-ai/kandinsky5/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kandinsky5/text-to-video',
      prompt: 'An artistic interpretation of a storm',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kandinsky 5 Text-to-Video'
  },

  'fal-ai/wan-alpha': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-alpha',
      prompt: 'A transparent glass object with light refraction',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Wan Alpha (Transparent Background)'
  },

  // 🖼️ Image-to-Video Models (30 models)
  'fal-ai/veo3.1/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/image-to-video',
      prompt: 'Animate this image with gentle movement',
      image_url: 'https://picsum.photos/512/512',
      duration: '8s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 image-to-video'
  },

  'fal-ai/veo3.1/fast/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/fast/image-to-video',
      prompt: 'Add smooth camera movement to this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Fast image-to-video'
  },

  'fal-ai/veo3.1/first-last-frame-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/first-last-frame-to-video',
      prompt: 'Create a smooth transition between these frames',
      first_frame_url: 'https://picsum.photos/512/512',
      last_frame_url: 'https://picsum.photos/512/512',
      duration: '8s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 First-Last Frame to Video'
  },

  'fal-ai/veo3.1/fast/first-last-frame-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/fast/first-last-frame-to-video',
      prompt: 'Generate a quick transition between frames',
      first_frame_url: 'https://picsum.photos/512/512',
      last_frame_url: 'https://picsum.photos/512/512',
      duration: '5s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Fast First-Last Frame to Video'
  },

  'fal-ai/veo3.1/reference-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/reference-to-video',
      prompt: 'Create a video using this reference image',
      reference_image_url: 'https://picsum.photos/512/512',
      duration: '8s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Reference to Video'
  },

  'fal-ai/sora-2/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/image-to-video',
      prompt: 'Animate this image with gentle movement',
      image_url: 'https://picsum.photos/512/512',
      duration: 4,
      resolution: 'auto',
      aspect_ratio: 'auto'
    },
    expectedStatus: 200,
    description: 'Sora 2 image-to-video'
  },

  'fal-ai/sora-2/image-to-video/pro': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/image-to-video/pro',
      prompt: 'Create a professional video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: 4,
      resolution: '1080p',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Sora 2 Pro image-to-video'
  },

  'fal-ai/kling-video/v2.1/master/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.1/master/image-to-video',
      prompt: 'Add smooth motion to this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.1 Master image-to-video'
  },

  'fal-ai/kling-video/v2.5-turbo/pro/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
      prompt: 'Create a fast-paced video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.5 Turbo Pro image-to-video'
  },

  'fal-ai/minimax/hailuo-02/standard/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
      prompt: 'Animate this image with professional quality',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Minimax Hailuo 02 Standard image-to-video'
  },

  'fal-ai/wan-25-preview/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/image-to-video',
      prompt: 'Create smooth motion from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 image-to-video'
  },

  'fal-ai/wan/v2.2-a14b/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan/v2.2-a14b/image-to-video',
      prompt: 'Generate advanced video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Wan v2.2-A14B image-to-video'
  },

  'fal-ai/wan/v2.2-a14b/image-to-video/lora': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan/v2.2-a14b/image-to-video/lora',
      prompt: 'Create a customized video with LoRA weights',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Wan v2.2-A14B image-to-video with LoRA'
  },

  'fal-ai/ovi/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/ovi/image-to-video',
      prompt: 'Add synchronized audio to this video',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Ovi image-to-video with audio'
  },

  'fal-ai/luma-dream-machine/ray-2/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2/image-to-video',
      prompt: 'Add cinematic movement to this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 image-to-video'
  },

  'fal-ai/luma-dream-machine/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/image-to-video',
      prompt: 'Create a dream-like video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Dream Machine image-to-video'
  },

  'fal-ai/luma-dream-machine/ray-2-flash/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash/image-to-video',
      prompt: 'Generate a fast video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash image-to-video'
  },

  'fal-ai/ltxv-13b-098-distilled/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/ltxv-13b-098-distilled/image-to-video',
      prompt: 'Create a distilled video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'LTX Video 0.9.8 13B Distilled image-to-video'
  },

  'decart/lucy-14b/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'decart/lucy-14b/image-to-video',
      prompt: 'Generate a lightning-fast video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Lucy-14B lightning fast image-to-video'
  },

  'fal-ai/bytedance/omnihuman': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/bytedance/omnihuman',
      prompt: 'Create a human-focused video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'ByteDance OmniHuman'
  },

  'fal-ai/kling-video/v1/pro/ai-avatar': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v1/pro/ai-avatar',
      prompt: 'Generate an AI avatar video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '8',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling AI Avatar Pro'
  },

  'fal-ai/pixverse/v5/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/pixverse/v5/image-to-video',
      prompt: 'pan right',
      image_url: 'https://picsum.photos/512/512',
      duration: '5'
    },
    expectedStatus: 200,
    description: 'Pixverse v5 image-to-video'
  },

  // 🎭 Video-to-Video Models (5 models)
  'fal-ai/sora-2/video-to-video/remix': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/video-to-video/remix',
      prompt: 'Transform this video with a new artistic style',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      duration: 4,
      resolution: '720p',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Sora 2 Video Remix'
  },

  'fal-ai/luma-dream-machine/ray-2/modify': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2/modify',
      prompt: 'Modify this video with enhanced colors',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Modify'
  },

  'fal-ai/luma-dream-machine/ray-2-flash/modify': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash/modify',
      prompt: 'Quickly modify this video with new effects',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash Modify'
  },

  'fal-ai/luma-dream-machine/ray-2/reframe': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2/reframe',
      prompt: 'Reframe this video to focus on the main subject',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Reframe'
  },

  'fal-ai/luma-dream-machine/ray-2-flash/reframe': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash/reframe',
      prompt: 'Quickly reframe this video with new composition',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      duration: '5s',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash Reframe'
  },

  // 🔊 Audio / Music Models (2 models)
  'fal-ai/minimax-music/v1.5': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax-music/v1.5',
      prompt: 'Create upbeat electronic music',
      lyrics_prompt: 'Create upbeat electronic music',
      duration: '30'
    },
    expectedStatus: 200,
    description: 'MiniMax Music v1.5'
  },

  'fal-ai/minimax-music': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax-music',
      prompt: 'Generate relaxing ambient music',
      lyrics_prompt: 'Generate relaxing ambient music',
      duration: '30'
    },
    expectedStatus: 200,
    description: 'MiniMax Music'
  },

  // 🧊 3D Models (1 model)
  'fal-ai/meshy/v5/multi-image-to-3d': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/meshy/v5/multi-image-to-3d',
      prompt: 'Create a 3D model from these images',
      image_urls: [
        'https://picsum.photos/512/512',
        'https://picsum.photos/512/512'
      ],
      quality: 'high'
    },
    expectedStatus: 200,
    description: 'Meshy V5 Multi-Image-to-3D'
  },

  // 🎭 Avatar / Lipsync Models (4 models)
  'fal-ai/sync-lipsync/v2': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sync-lipsync/v2',
      prompt: 'Sync lip movement to this audio',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    expectedStatus: 200,
    description: 'Sync Lipsync v2'
  },

  'veed/lipsync': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'veed/lipsync',
      prompt: 'Professional lip synchronization',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    expectedStatus: 200,
    description: 'VEED Lipsync'
  },

  // 🛠️ Utility Models
  'fal-ai/moondream3-preview/detect': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/moondream3-preview/detect',
      prompt: 'Detect objects in this image',
      image_url: 'https://picsum.photos/512/512'
    },
    expectedStatus: 200,
    description: 'MoonDream 3 Detection'
  },

  // 🎓 Training Models
  'fal-ai/wan-trainer/t2v-14b': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-trainer/t2v-14b',
      prompt: 'Train a text-to-video model with 14B parameters',
      training_data: 'sample_training_data',
      epochs: 10
    },
    expectedStatus: 200,
    description: 'Wan Trainer T2V 14B'
  },

  'fal-ai/wan-trainer/t2v': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-trainer/t2v',
      prompt: 'Train a text-to-video model',
      training_data: 'sample_training_data',
      epochs: 5
    },
    expectedStatus: 200,
    description: 'Wan Trainer T2V'
  },

  'fal-ai/wan-trainer/i2v-720p': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-trainer/i2v-720p',
      prompt: 'Train an image-to-video model at 720p',
      training_data: 'sample_training_data',
      resolution: '720p',
      epochs: 5
    },
    expectedStatus: 200,
    description: 'Wan Trainer I2V 720p'
  }
};

async function testModel(modelName, config) {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Testing: ${modelName}`);
    console.log(`📝 ${config.description}`);
    
    const response = await fetch(`${BASE_URL}${config.endpoint}`, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        'x-fal-target-url': `https://fal.run/${config.body.model}`,
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
      },
      body: JSON.stringify(config.body)
    });
    
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    if (response.status === config.expectedStatus) {
      console.log(`✅ PASS - Status: ${response.status} (${responseTime}ms)`);
      if (data && Object.keys(data).length > 0) {
        console.log(`📊 Data received: ${JSON.stringify(data).substring(0, 100)}...`);
      }
      return {
        model: modelName,
        status: response.status,
        expectedStatus: config.expectedStatus,
        success: true,
        responseTime,
        hasData: data && Object.keys(data).length > 0,
        error: null,
        timestamp: new Date().toISOString()
      };
    } else {
      console.log(`❌ FAIL - Expected: ${config.expectedStatus}, Got: ${response.status}`);
      console.log(`🔴 Error: ${data.error || 'Unknown error'}`);
      console.log(`📋 Full Response: ${JSON.stringify(data, null, 2)}`);
      return {
        model: modelName,
        status: response.status,
        expectedStatus: config.expectedStatus,
        success: false,
        responseTime,
        hasData: false,
        error: data.error || 'Unknown error',
        fullResponse: data,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ ERROR - ${error.message}`);
    return {
      model: modelName,
      status: 0,
      expectedStatus: config.expectedStatus,
      success: false,
      responseTime,
      hasData: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive test for ALL models...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY ? 'Present' : 'Missing'}`);
  console.log(`📊 Total models to test: ${Object.keys(MODEL_TESTS).length}`);
  console.log('');

  const results = [];
  const startTime = Date.now();

  for (const [modelName, config] of Object.entries(MODEL_TESTS)) {
    const result = await testModel(modelName, config);
    results.push(result);
    console.log(''); // Add spacing between tests
  }

  const totalTime = Date.now() - startTime;
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  // Save results to file
  const summary = {
    total: results.length,
    passed,
    failed,
    successRate: Math.round((passed / results.length) * 100),
    totalTime
  };

  const output = {
    summary,
    results
  };

  const outputPath = path.join(__dirname, 'comprehensive-test-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Results saved to: ${outputPath}`);

  if (failed > 0) {
    console.log('\n🔍 Failed Models:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.model}: ${result.error}`);
    });
  }
}

// Run the tests
runTests().catch(console.error);
