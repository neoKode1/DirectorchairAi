# AI Model Configuration Guide

> **Last Updated**: October 20, 2025  
> **Application**: All Models AI  
> **Total Models**: 80+ models across 12 categories  
> **Test Coverage**: 77% passing (23/30 tested models)

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Model Categories](#model-categories)
4. [Parameter Reference](#parameter-reference)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Testing Results](#testing-results)

---

## Overview

This application integrates with **FAL AI** to provide access to 80+ state-of-the-art AI models across multiple categories. All models use the **FAL Proxy Server** at `/api/fal/proxy` for authentication and request handling.

### Key Features
- ✅ Server-side API key management (FAL_KEY in environment variables)
- ✅ Queue management for long-running requests
- ✅ Automatic parameter sanitization for model-specific requirements
- ✅ Support for multiple file formats (images, videos, audio)
- ✅ Comprehensive error handling and logging

---

## API Endpoints

### Primary Endpoints

| Endpoint | Purpose | Models Supported |
|----------|---------|------------------|
| `/api/fal/proxy` | FAL AI Proxy Server | All FAL AI models |
| `/api/fal` | Direct FAL Client | Legacy support |
| `/api/generate/reve-remix` | Reve Remix Specific | `fal-ai/reve/remix` |
| `/api/generate/flux-pro` | Flux Pro Specific | Flux Pro models |
| `/api/generate/elevenlabs-tts` | ElevenLabs TTS | TTS models |

### Required Headers for Proxy

```javascript
{
  'Content-Type': 'application/json',
  'x-fal-target-url': 'https://fal.run/{model-id}'
}
```

---

## Model Categories

### 📸 Text-to-Image Models (23 models)

#### Reve Models (Strong Text Rendering)
- **`fal-ai/reve/text-to-image`** - Text-to-image with accurate text rendering
  - Parameters: `prompt`, `aspect_ratio`, `num_images`, `output_format`, `sync_mode`
  - Aspect Ratios: `16:9`, `9:16`, `3:2`, `2:3`, `4:3`, `3:4`, `1:1`
  - Default aspect_ratio: `3:2`
  - Output formats: `png`, `jpeg`, `webp`

- **`fal-ai/reve/edit`** - Image transformation via text prompts
  - Parameters: `prompt`, `image_url` (required), `num_images`, `output_format`, `sync_mode`
  - Same aspect ratios and formats as text-to-image

- **`fal-ai/reve/remix`** - Multi-image combination (1-4 images)
  - Parameters: `prompt`, `image_urls` (array, required), `aspect_ratio`, `output_format`, `sync_mode`
  - Max 4 reference images
  - Endpoint: `/api/generate/reve-remix`

#### Flux Models (High Quality Generation)
- **`fal-ai/flux-pro/v1.1-ultra`** - Ultra high quality
  - Parameters: `prompt`, `aspect_ratio`, `num_images`, `output_format`
  - Aspect Ratios: `21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21`

- **`fal-ai/flux-krea-lora/stream`** - Fast streaming generation
  - ⚠️ **Streaming model** - Requires `fal.stream()` instead of `fal.subscribe()`
  - Parameters: `prompt`, `num_inference_steps`, `guidance_scale`

- **`fal-ai/flux-kontext-lora`** - Context-aware image editing
  - Parameters: `image_url` (required), `prompt`, `num_images`, `output_format`
  - Use case: Edit images while maintaining context

- **`fal-ai/flux-kontext-lora/text-to-image`** - Context-aware T2I
  - Parameters: `prompt`, `aspect_ratio`, `num_images`, `output_format`

- **`fal-ai/flux-kontext-lora/inpaint`** - Context-aware inpainting
  - Parameters: `image_url`, `reference_image_url`, `mask_url`, `prompt`
  - All three image inputs are required

- **`fal-ai/flux-pro/kontext/text-to-image`** - Pro version context-aware T2I
  - Parameters: `prompt`, `aspect_ratio`, `num_images`

- **`fal-ai/flux-pro/kontext/max`** - Maximum performance editing
  - Parameters: `prompt`, `image_url` (required)
  - Use case: Complex editing tasks

- **`fal-ai/flux-pro/kontext/max/multi`** - Multi-image editing
  - Parameters: `prompt`, `image_urls` (array, required)
  - Supports 2+ images

- **`fal-ai/flux-pro/kontext/multi`** - Multi-image variations
  - Parameters: `prompt`, `image_urls` (array), `num_images`
  - Generates multiple variations

#### Wan Models (Alibaba - High Quality)
- **`fal-ai/wan-25-preview/text-to-image`** - Enhanced quality T2I
  - Parameters: `prompt`, `aspect_ratio`, `num_images`, `output_format`

- **`fal-ai/wan-25-preview/image-to-image`** - Multi-reference fusion
  - Parameters: `prompt`, `image_urls` (array, 1-2 images), `num_images`
  - ⚠️ **Must use `image_urls` array, not `image_url`**

#### Google Models
- **`fal-ai/imagen4/preview`** - Google's highest quality
  - Parameters: `prompt`, `aspect_ratio`, `num_images`, `output_format`

#### Other Image Models
- **`fal-ai/recraft/v3/text-to-image`** - SOTA with vector art support
- **`fal-ai/hidream-i1-full`** - Dream-like artistic generation
- **`fal-ai/qwen-image-edit/image-to-image`** - Superior text editing
- **`fal-ai/nano-banana/edit`** - Gemini-based multi-image editing
  - ⚠️ **Requires `image_urls` array (1-10 images)**
- **`fal-ai/bytedance/seedream/v4/edit`** - Professional multi-image editing
  - ⚠️ **Requires `image_urls` array (up to 10 images)**
- **`fal-ai/dreamomni2/edit`** - Text & image guided editing
  - ⚠️ **Requires exactly 2 images in `image_urls` array**
- **`fal-ai/luma-photon/flash/reframe`** - Intelligent content expansion

---

### 🎬 Text-to-Video Models (16 models)

#### Veo 3.1 (Google DeepMind - State-of-the-Art)
- **`fal-ai/veo3.1`** - Standard version with audio
  - Parameters: `prompt`, `duration`, `aspect_ratio`, `resolution`, `generate_audio`
  - Duration: `'4s'`, `'6s'`, `'8s'` (string with 's' suffix)
  - Resolution: `'720p'`, `'1080p'`
  - Aspect Ratios: `'16:9'`, `'9:16'`, `'1:1'`

- **`fal-ai/veo3.1/fast`** - Faster, more cost-effective
  - Duration: **Only `'4s'`, `'6s'`, `'8s'` allowed**
  - Default duration: `'8s'`

#### Sora 2 (OpenAI - With Audio)
- **`fal-ai/sora-2/text-to-video`** - Standard version
  - Parameters: `prompt`, `duration`, `resolution`, `aspect_ratio`
  - Duration: `4`, `6`, `8`, `10`, `12`, `14`, `16`, `20` (plain numbers, no 's')
  - Resolution: `'360p'`, `'480p'`, `'720p'`, `'1080p'`, `'auto'`
  - Aspect Ratios: `'16:9'`, `'9:16'`, `'1:1'`, `'21:9'`, `'9:21'`, `'auto'`

- **`fal-ai/sora-2/text-to-video/pro`** - Professional version
  - Higher quality, longer processing time
  - Same parameters as standard

#### Kling Models (ByteDance - Cinematic Quality)
- **`fal-ai/kling-video/v2.1/master/text-to-video`** - Premium endpoint
  - Duration: `'5'`, `'10'` (string numbers, no 's' suffix)
  - Aspect Ratios: `'16:9'`, `'9:16'`, `'1:1'`

- **`fal-ai/kling-video/v2.5-turbo/pro/text-to-video`** - Faster turbo version
  - Duration: `'5'`, `'10'` (string numbers, no 's' suffix)

#### Wan Models (Alibaba)
- **`fal-ai/wan-25-preview/text-to-video`** - Best visual quality
  - Duration: `'5'`, `'10'` (string numbers, no 's' suffix)
  - Resolution: `'480p'`, `'720p'`, `'1080p'`

#### Luma Dream Machine (Realistic Motion)
- **`fal-ai/luma-dream-machine`** - Original version
  - Duration: `'5s'`, `'9s'` (with 's' suffix)

- **`fal-ai/luma-dream-machine/ray-2`** - Enhanced Ray 2
  - Duration: `'5s'`, `'9s'` (with 's' suffix)
  - Resolution: `'540p'`, `'720p'`, `'1080p'`

- **`fal-ai/luma-dream-machine/ray-2-flash`** - Fast version
  - Duration: `'5s'`, `'9s'` (with 's' suffix)

#### Other T2V Models
- **`fal-ai/hunyuan-video`** - Hunyuan video generation
- **`fal-ai/wan/v2.2-a14b/text-to-video`** - 14B parameter model
- **`fal-ai/ovi`** - Audio-video with synchronized sound
- **`fal-ai/kandinsky5/text-to-video`** - Artistic motion
- **`fal-ai/wan-alpha`** - Transparent background videos

---

### 🖼️ Image-to-Video Models (30 models)

#### Veo 3.1 Image-to-Video Variants

1. **`fal-ai/veo3.1/image-to-video`** - Standard I2V
   - Parameters: `prompt`, `image_url`, `duration`, `resolution`
   - Duration: `'8s'` (with 's' suffix)

2. **`fal-ai/veo3.1/fast/image-to-video`** - Fast I2V
   - Duration: **Only `'8s'` allowed** (fixed value)

3. **`fal-ai/veo3.1/first-last-frame-to-video`** - Interpolation
   - Parameters: `prompt`, `first_frame_url`, `last_frame_url`, `duration`
   - Duration: `'8s'`

4. **`fal-ai/veo3.1/fast/first-last-frame-to-video`** - Fast interpolation
   - Duration: **Only `'8s'` allowed**

5. **`fal-ai/veo3.1/reference-to-video`** - Multi-reference generation
   - Parameters: `image_urls` (array), `prompt`, `duration`
   - ⚠️ **Requires `image_urls` array (multiple reference images)**

#### Sora 2 Image-to-Video

- **`fal-ai/sora-2/image-to-video`** - Standard version
  - Duration: `4`, `6`, `8`, `10`, `12`, `14`, `16`, `20` (plain numbers)
  - Resolution: `'auto'`, `'360p'`, `'480p'`, `'720p'`, `'1080p'`

- **`fal-ai/sora-2/image-to-video/pro`** - Professional version
  - Higher quality output
  - ⚠️ **Sensitive content filter - avoid certain words**

#### Kling Image-to-Video

- **`fal-ai/kling-video/v2.1/master/image-to-video`**
  - Duration: `'5'`, `'10'` (string numbers, no 's')

- **`fal-ai/kling-video/v2.5-turbo/pro/image-to-video`**
  - Duration: `'5'`, `'10'` (string numbers, no 's')

#### Minimax (Hailuo)

- **`fal-ai/minimax/hailuo-02/standard/image-to-video`**
  - Duration: `'6'`, `'10'` (string numbers, no 's')
  - Resolution: `'512P'`, `'768P'`
  - Parameter: `prompt_optimizer` (boolean)

#### Wan Image-to-Video

- **`fal-ai/wan-25-preview/image-to-video`**
  - Duration: `'5'`, `'10'` (string numbers, no 's')
  - Resolution: `'480p'`, `'720p'`, `'1080p'`

- **`fal-ai/wan/v2.2-a14b/image-to-video`**
  - Duration: `'8'` (string number)

- **`fal-ai/wan/v2.2-a14b/image-to-video/lora`** - With LoRA support
  - Supports custom LoRA weights

#### Luma Dream Machine I2V

- **`fal-ai/luma-dream-machine/ray-2/image-to-video`**
  - Duration: `'5s'`, `'9s'` (with 's' suffix)

- **`fal-ai/luma-dream-machine/image-to-video`** - Original version

- **`fal-ai/luma-dream-machine/ray-2-flash/image-to-video`** - Fast version

#### Other I2V Models

- **`fal-ai/ovi/image-to-video`** - With synchronized audio
- **`fal-ai/ltxv-13b-098-distilled/image-to-video`** - Distilled model
- **`decart/lucy-14b/image-to-video`** - Lightning fast
- **`fal-ai/pixverse/v5/image-to-video`** - Advanced motion

---

### 🎭 Video-to-Video Models (6 models)

#### Sora 2 Video Remix
- **`fal-ai/sora-2/video-to-video/remix`**
  - Parameters: `video_id` (required), `prompt`
  - ⚠️ **`video_id` must be from a previous Sora generation, not uploaded video**
  - Use case: Remix existing Sora-generated videos

#### Luma Ray 2 Modification Models

- **`fal-ai/luma-dream-machine/ray-2/modify`** - Standard modify
  - Parameters: `video_url`, `prompt`, `mode`
  - Mode: `'adhere_1'` to `'reimagine_3'`
  - ✅ **Passing** - Works with valid Luma video URLs

- **`fal-ai/luma-dream-machine/ray-2-flash/modify`** - Fast modify
  - Same parameters as standard

#### Luma Ray 2 Reframe Models

- **`fal-ai/luma-dream-machine/ray-2/reframe`** - Aspect ratio adjustment
  - Parameters: `video_url`, `aspect_ratio`
  - Aspect Ratios: `'1:1'`, `'16:9'`, `'9:16'`, `'4:3'`, `'3:4'`, `'21:9'`, `'9:21'`
  - ✅ **Passing**

- **`fal-ai/luma-dream-machine/ray-2-flash/reframe`** - Fast reframe
  - ✅ **Passing**

---

### 🔊 Audio / Music Models (2 models)

#### MiniMax Music

- **`fal-ai/minimax-music/v1.5`** - Latest version
  - Parameters: `prompt`, `lyrics_prompt`, `duration`
  - Duration: `'30'` (string number, in seconds)
  - ✅ **Passing**

- **`fal-ai/minimax-music`** - Original version
  - Parameters: `prompt`, `reference_audio_url` (required)
  - ⚠️ **Reference audio must be at least 10 seconds long**
  - ❌ **Failing** - Need longer reference audio

---

### 🎭 Avatar / Lipsync Models (4 models)

#### OmniHuman (ByteDance)
- **`fal-ai/bytedance/omnihuman`**
  - Parameters: `image_url`, `audio_url` (both required)
  - ⚠️ **Image must contain a clearly visible human face**
  - Audio max: 30 seconds
  - ❌ **Failing** - Need image with face

#### Kling AI Avatar
- **`fal-ai/kling-video/v1/pro/ai-avatar`**
  - Parameters: `image_url`, `audio_url`, `prompt` (optional)
  - ⚠️ **Requires valid avatar image and audio**
  - ❌ **Failing** - Downstream service error

#### Lipsync Models

- **`fal-ai/sync-lipsync/v2`**
  - Parameters: `model`, `video_url`, `audio_url`, `sync_mode`
  - ⚠️ **Model parameter must be `'lipsync-2'` or `'lipsync-2-pro'`, NOT full path**
  - Sync modes: `'cut_off'`, `'loop'`, `'bounce'`, `'silence'`, `'remap'`
  - ❌ **Failing** - JSON parsing issue

- **`veed/lipsync`**
  - Parameters: `video_url`, `audio_url`
  - Simple lipsync without model parameter
  - ✅ **Passing**

---

### 🧊 3D Models (1 model)

- **`fal-ai/meshy/v5/multi-image-to-3d`**
  - Parameters: `prompt`, `image_urls` (array), `quality`
  - ✅ **Passing**

---

### 👁️ Vision / Detection Models (1 model)

- **`fal-ai/moondream3-preview/detect`**
  - Parameters: `prompt`, `image_url`
  - Use case: Object detection and analysis
  - ✅ **Passing**

---

## Parameter Reference

### Duration Formats by Model Family

| Model Family | Duration Format | Example | Valid Values |
|--------------|----------------|---------|--------------|
| Veo 3.1 | String with 's' | `'8s'` | `'4s'`, `'6s'`, `'8s'` |
| Veo 3.1 Fast | String with 's' | `'8s'` | `'4s'`, `'6s'`, `'8s'` |
| Veo 3.1 Fast I2V | String with 's' | `'8s'` | **Only `'8s'`** |
| Sora 2 | Plain number | `4` | `4`, `6`, `8`, `10`, `12`, `14`, `16`, `20` |
| Kling (all) | String number | `'5'` | `'5'`, `'10'` |
| Wan 2.5 | String number | `'5'` | `'5'`, `'10'` |
| Luma Ray 2 | String with 's' | `'5s'` | `'5s'`, `'9s'` |
| Pixverse | String number | `'5'` | `'5'`, `'8'` |
| Minimax | String number | `'6'` | `'6'`, `'10'` |
| Hunyuan | String number | `'8'` | Various |

### Image URL Parameters

| Parameter Type | Models | Format | Notes |
|----------------|--------|--------|-------|
| `image_url` | Most single-image models | String | Single image URL or Data URI |
| `image_urls` | Multi-image models | Array | Array of image URLs |
| `first_frame_url` | Frame interpolation | String | First frame for animation |
| `last_frame_url` | Frame interpolation | String | Last frame for animation |
| `reference_image_url` | Inpainting, Reference | String | Reference for style/content |
| `mask_url` | Inpainting | String | Mask for inpainting area |

### Common Optional Parameters

```typescript
{
  aspect_ratio?: string;        // '16:9', '9:16', '1:1', etc.
  num_images?: number;          // Default: 1
  output_format?: string;       // 'jpeg', 'png', 'webp'
  sync_mode?: boolean;          // Return as data URI
  enable_safety_checker?: boolean; // Default: true
  seed?: number;                // For reproducibility
  resolution?: string;          // '720p', '1080p', etc.
  negative_prompt?: string;     // Content to avoid
  prompt_optimizer?: boolean;   // Auto-enhance prompts
}
```

---

## Common Issues & Solutions

### Issue 1: Duration Format Errors

**Error**: `unexpected value; permitted: '5', '10'`

**Solution**: Check the duration format for your specific model:
- Veo models: Use `'8s'` (with 's')
- Kling models: Use `'5'` (string without 's')
- Sora models: Use `4` (plain number)

### Issue 2: Missing image_urls Array

**Error**: `field required: image_urls`

**Models affected**: 
- `wan-25-preview/image-to-image`
- `nano-banana/edit`
- `bytedance/seedream/v4/edit`
- `dreamomni2/edit`
- `flux-pro/kontext/max/multi`
- `flux-pro/kontext/multi`
- `veo3.1/reference-to-video`

**Solution**: Use `image_urls` array instead of single `image_url`:
```javascript
// ❌ Wrong
{ image_url: 'https://example.com/image.jpg' }

// ✅ Correct
{ image_urls: ['https://example.com/image.jpg'] }
```

### Issue 3: Content Policy Violations

**Error**: `content_policy_violation`

**Models affected**: Sora 2, Luma models

**Solution**: 
- Avoid words like "professional", "action", "dramatic breakup"
- Use descriptive, neutral prompts
- Examples of safe prompts:
  - ✅ "Wild horses galloping across desert plains"
  - ✅ "Animate this image with cinematic movement"
  - ❌ "Fast-paced action sequence"
  - ❌ "Create a professional video"

### Issue 4: Required Audio for Avatar Models

**Error**: `field required: audio_url`

**Models**: `bytedance/omnihuman`, `kling-video/v1/pro/ai-avatar`

**Solution**: Always provide audio_url for avatar/lipsync models
```javascript
{
  image_url: 'https://example.com/face.jpg',
  audio_url: 'https://example.com/speech.mp3' // Required
}
```

### Issue 5: Streaming Models

**Error**: `Unexpected token 'd', "data: {"im"... is not valid JSON`

**Model**: `fal-ai/flux-krea-lora/stream`

**Solution**: Use `fal.stream()` instead of `fal.subscribe()`:
```javascript
// ❌ Wrong
await fal.subscribe("fal-ai/flux-krea-lora/stream", {...})

// ✅ Correct
const stream = await fal.stream("fal-ai/flux-krea-lora/stream", {...})
for await (const event of stream) {
  console.log(event);
}
```

### Issue 6: Lipsync Model Name

**Error**: `unexpected value; permitted: 'lipsync-2', 'lipsync-2-pro'`

**Model**: `fal-ai/sync-lipsync/v2`

**Solution**: Use short model name in body, not full path:
```javascript
{
  model: 'lipsync-2', // Not 'fal-ai/sync-lipsync/v2'
  video_url: '...',
  audio_url: '...'
}
```

### Issue 7: DreamOmni2 Requires Exactly 2 Images

**Error**: `You can only use 2 images. Please use 2 images.`

**Model**: `fal-ai/dreamomni2/edit`

**Solution**: Always provide exactly 2 images:
```javascript
{
  image_urls: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  prompt: 'Make the first image match the style of the second'
}
```

---

## Testing Results

### Test Summary (Latest Run)

**First Round (30 previously failing models)**:
- **Passed**: 23 models ✅
- **Failed**: 7 models ❌
- **Success Rate**: 77%
- **Total Test Time**: 27 minutes

**Second Round (7 remaining failures - with fixes)**:
- **Passed**: 4 models ✅
- **Failed**: 2 models ❌
- **Success Rate**: 67%

**Overall Progress**:
- **Total Fixed**: 27 out of 30 models (90%)
- **Remaining Issues**: 2 models only

### ✅ Fixed & Passing (23 models)

1. ✅ `fal-ai/wan-25-preview/image-to-image` - Fixed: Added `image_urls` array
2. ✅ `fal-ai/nano-banana/edit` - Fixed: Added `image_urls` array
3. ✅ `fal-ai/bytedance/seedream/v4/edit` - Fixed: Added `image_urls` array
4. ✅ `fal-ai/flux-kontext-lora` - Fixed: Added required `image_url`
5. ✅ `fal-ai/flux-kontext-lora/inpaint` - Fixed: Added `reference_image_url` and `mask_url`
6. ✅ `fal-ai/flux-pro/kontext/max` - Fixed: Added required `image_url`
7. ✅ `fal-ai/flux-pro/kontext/max/multi` - Fixed: Added `image_urls` array
8. ✅ `fal-ai/flux-pro/kontext/multi` - Fixed: Added `image_urls` array
9. ✅ `fal-ai/veo3.1/fast` - Fixed: Duration to `'8s'`
10. ✅ `fal-ai/veo3.1/fast/image-to-video` - Fixed: Duration to `'8s'`
11. ✅ `fal-ai/veo3.1/fast/first-last-frame-to-video` - Fixed: Duration to `'8s'`
12. ✅ `fal-ai/kling-video/v2.5-turbo/pro/text-to-video` - Fixed: Duration to `'5'`
13. ✅ `fal-ai/kling-video/v2.1/master/image-to-video` - Fixed: Duration to `'5'`
14. ✅ `fal-ai/wan-25-preview/text-to-video` - Fixed: Duration to `'5'`
15. ✅ `fal-ai/wan-25-preview/image-to-video` - Fixed: Duration to `'5'`
16. ✅ `fal-ai/minimax/hailuo-02/standard/image-to-video` - Fixed: Duration to `'6'`
17. ✅ `fal-ai/luma-dream-machine/ray-2-flash` - Fixed: Safe prompt
18. ✅ `fal-ai/sora-2/image-to-video/pro` - Fixed: Safe prompt
19. ✅ `fal-ai/luma-dream-machine/ray-2/modify` - Working with valid video URL
20. ✅ `fal-ai/luma-dream-machine/ray-2-flash/modify` - Working
21. ✅ `fal-ai/luma-dream-machine/ray-2/reframe` - Working
22. ✅ `fal-ai/luma-dream-machine/ray-2-flash/reframe` - Working
23. ✅ `veed/lipsync` - Working

### ✅ Additionally Fixed (4 more models)

24. ✅ `fal-ai/dreamomni2/edit` - Fixed: Provided exactly 2 images
25. ✅ `fal-ai/veo3.1/reference-to-video` - Fixed: Used safe, descriptive prompt
26. ✅ `fal-ai/bytedance/omnihuman` - Fixed: Used image with visible face
27. ✅ `fal-ai/minimax-music` - Fixed: Used reference audio >10 seconds

### ❌ Final 2 Remaining Issues

1. ❌ **`fal-ai/kling-video/v1/pro/ai-avatar`**
   - Error: "Proxy request failed - fetch failed"
   - Status: Upstream service connectivity issue
   - **Action**: May be temporary FAL service issue or model deprecation
   - **Workaround**: Retry later or use alternative avatar model

2. ❌ **`fal-ai/sync-lipsync/v2`**
   - Error: "404: Not Found"
   - Status: Proxy routing issue
   - **Action**: Model parameter handling needs investigation
   - **Workaround**: Use `veed/lipsync` instead (working)

### ⚠️ Models Not Testable

- **`fal-ai/sora-2/video-to-video/remix`** - Requires `video_id` from previous Sora generation (cannot test in isolation)
- **Training Models** (`wan-trainer/*`) - Require actual training datasets
- **`fal-ai/flux-krea-lora/stream`** - Streaming model, requires different API pattern

### 🔬 Models Not Tested (Special Cases)

- **Training Models** (`wan-trainer/*`) - Require training datasets, not suitable for quick testing
- **Streaming Models** (`flux-krea-lora/stream`) - Require different API call pattern
- **Hunyuan Video** - Network connectivity issues

---

## API Route Sanitization Logic

The `/api/fal/route.ts` includes automatic parameter sanitization:

### Duration Handling

```typescript
// Models requiring plain duration (no 's' suffix)
const modelsNeedingPlainDuration = [
  'minimax', 'pixverse', 'kling', 'hunyuan', 
  'wan', 'ovi', 'kandinsky', 'ltxv', 'lucy', 'omnihuman'
];

// Models requiring duration WITH 's' suffix
const modelsNeedingSDuration = ['veo3', 'luma-dream-machine'];
```

### Multi-Image Model Handling

```typescript
if (model.includes('reve/remix')) {
  // Convert single image_url to image_urls array
  if (sanitized.image_url && !sanitized.image_urls) {
    sanitized.image_urls = [sanitized.image_url];
    delete sanitized.image_url;
  }
}
```

### MiniMax Music Special Handling

```typescript
if (model.includes('minimax-music')) {
  // Set lyrics_prompt if only prompt provided
  if (sanitized.prompt && !sanitized.lyrics_prompt) {
    sanitized.lyrics_prompt = sanitized.prompt;
  }
}
```

---

## Usage Examples

### Text-to-Image (Reve)

```javascript
const response = await fetch('/api/fal/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-fal-target-url': 'https://fal.run/fal-ai/reve/text-to-image'
  },
  body: JSON.stringify({
    model: 'fal-ai/reve/text-to-image',
    prompt: 'A beautiful sunset over mountains',
    aspect_ratio: '16:9',
    num_images: 1,
    output_format: 'png'
  })
});
```

### Text-to-Video (Veo 3.1)

```javascript
const response = await fetch('/api/fal/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-fal-target-url': 'https://fal.run/fal-ai/veo3.1'
  },
  body: JSON.stringify({
    model: 'fal-ai/veo3.1',
    prompt: 'A cat playing with a ball of yarn',
    duration: '8s', // Note: String with 's' suffix
    aspect_ratio: '16:9',
    resolution: '720p'
  })
});
```

### Image-to-Video (Kling)

```javascript
const response = await fetch('/api/fal/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-fal-target-url': 'https://fal.run/fal-ai/kling-video/v2.1/master/image-to-video'
  },
  body: JSON.stringify({
    model: 'fal-ai/kling-video/v2.1/master/image-to-video',
    prompt: 'Add smooth motion to this image',
    image_url: 'https://example.com/image.jpg',
    duration: '5', // Note: String without 's' suffix
    aspect_ratio: '16:9'
  })
});
```

### Multi-Image Editing (Wan 2.5)

```javascript
const response = await fetch('/api/fal/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-fal-target-url': 'https://fal.run/fal-ai/wan-25-preview/image-to-image'
  },
  body: JSON.stringify({
    model: 'fal-ai/wan-25-preview/image-to-image',
    prompt: 'Transform into a dramatic nighttime scene',
    image_urls: ['https://example.com/image.jpg'], // Must be array
    num_images: 1
  })
});
```

---

## Next Steps

### High Priority Fixes Needed

1. **DreamOmni2** - Update to use exactly 2 images
2. **Sync Lipsync v2** - Fix JSON parsing issue in proxy
3. **OmniHuman** - Use test image with visible face
4. **MiniMax Music** - Use longer reference audio (≥10s)
5. **Veo 3.1 Reference** - Use safe prompt for content filter

### Future Additions

- Add remaining 40+ models from MODEL_ENDPOINTS.md
- Implement streaming support for appropriate models
- Add training model support
- Expand test coverage to 100%

---

## Resources

- [FAL AI Documentation](https://docs.fal.ai/)
- [FAL AI Model Explorer](https://fal.ai/models)
- [Error Codes Reference](https://docs.fal.ai/errors)

---

**Generated**: October 20, 2025  
**Maintained by**: AI Development Team

