#!/usr/bin/env node

/**
 * Test Script for Failing Models Only - With Corrected Parameters
 * Based on official FAL AI documentation
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.FAL_KEY;

// Only failing models with CORRECTED parameters from official docs
const MODEL_TESTS = {
  // CATEGORY: Multi-Image Models (require image_urls array)
  'fal-ai/wan-25-preview/image-to-image': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/image-to-image',
      prompt: 'Transform this into a dramatic nighttime scene',
      image_urls: ['https://picsum.photos/512/512'], // REQUIRED: Must be array
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 Image-to-Image (multi-image fusion)'
  },

  'fal-ai/nano-banana/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/nano-banana/edit',
      prompt: 'Make this image more vibrant',
      image_urls: ['https://picsum.photos/512/512'], // REQUIRED: Must be array
      num_images: 1,
      output_format: 'jpeg'
    },
    expectedStatus: 200,
    description: 'Nano Banana Edit (Gemini multi-image)'
  },

  'fal-ai/bytedance/seedream/v4/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/bytedance/seedream/v4/edit',
      prompt: 'Add dramatic lighting',
      image_urls: ['https://picsum.photos/512/512'], // REQUIRED: Must be array
      num_images: 1,
      enable_safety_checker: true
    },
    expectedStatus: 200,
    description: 'Seedream 4.0 Edit (multi-image editing)'
  },

  'fal-ai/dreamomni2/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/dreamomni2/edit',
      image_urls: ['https://picsum.photos/512/512'], // REQUIRED: Must be array
      prompt: 'Transform this image with fantasy elements'
    },
    expectedStatus: 200,
    description: 'DreamOmni2 Edit (multi-image guided editing)'
  },

  // CATEGORY: Image Editing Models (require image_url)
  'fal-ai/flux-kontext-lora': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-kontext-lora',
      image_url: 'https://picsum.photos/512/512', // REQUIRED for editing
      prompt: 'Change to daytime with people walking',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Kontext LoRA (image editing)'
  },

  'fal-ai/flux-kontext-lora/inpaint': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-kontext-lora/inpaint',
      image_url: 'https://picsum.photos/512/512',
      reference_image_url: 'https://picsum.photos/256/256', // REQUIRED for inpaint
      mask_url: 'https://picsum.photos/256/256', // REQUIRED for inpaint
      prompt: 'Fill with a beautiful garden',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Kontext LoRA Inpaint'
  },

  'fal-ai/flux-pro/kontext/max': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/max',
      prompt: 'Put a donut next to the flour',
      image_url: 'https://picsum.photos/512/512', // REQUIRED for Kontext Max
      num_images: 1,
      output_format: 'jpeg'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Max (image editing)'
  },

  'fal-ai/flux-pro/kontext/max/multi': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/max/multi',
      prompt: 'Combine these elements into one scene',
      image_urls: ['https://picsum.photos/512/512', 'https://picsum.photos/512/512'], // REQUIRED: Multi-image
      num_images: 1,
      output_format: 'jpeg'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Max Multi (multi-image editing)'
  },

  'fal-ai/flux-pro/kontext/multi': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/flux-pro/kontext/multi',
      prompt: 'Create variations combining these images',
      image_urls: ['https://picsum.photos/512/512'], // REQUIRED: Multi-image
      num_images: 2,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Flux Pro Kontext Multi (multi-image variations)'
  },

  // CATEGORY: Duration Format Errors
  'fal-ai/veo3.1/fast': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/fast',
      prompt: 'A bird flying over a forest',
      duration: '8s', // FIXED: Only '4s', '6s', '8s' allowed for Veo3.1 Fast
      aspect_ratio: '16:9',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Fast (corrected duration)'
  },

  'fal-ai/veo3.1/fast/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/fast/image-to-video',
      prompt: 'Animate with smooth camera movement',
      image_url: 'https://picsum.photos/512/512',
      duration: '8s', // FIXED: Only '8s' allowed for Veo3.1 Fast I2V
      aspect_ratio: '16:9',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Fast image-to-video (corrected duration)'
  },

  'fal-ai/veo3.1/fast/first-last-frame-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/fast/first-last-frame-to-video',
      prompt: 'Create smooth transition between frames',
      first_frame_url: 'https://picsum.photos/512/512',
      last_frame_url: 'https://picsum.photos/512/512',
      duration: '8s', // FIXED: Only '8s' allowed
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Fast First-Last Frame (corrected duration)'
  },

  'fal-ai/veo3.1/reference-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/reference-to-video',
      image_urls: ['https://picsum.photos/512/512', 'https://picsum.photos/512/512'], // REQUIRED: Multi-image reference
      prompt: 'Create a video using these reference images',
      duration: '8s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Reference to Video (multi-image)'
  },

  'fal-ai/kling-video/v2.5-turbo/pro/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
      prompt: 'A professional dance performance',
      duration: '5', // FIXED: Only '5' or '10' allowed (no 's')
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.5 Turbo Pro T2V (corrected duration)'
  },

  'fal-ai/kling-video/v2.1/master/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.1/master/image-to-video',
      prompt: 'Add smooth motion to this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5', // FIXED: Only '5' or '10' allowed (no 's')
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.1 Master I2V (corrected duration)'
  },

  'fal-ai/wan-25-preview/text-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/text-to-video',
      prompt: 'A warrior standing with determination',
      duration: '5', // FIXED: Only '5' or '10' allowed (string without 's')
      aspect_ratio: '16:9',
      resolution: '1080p'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 Text-to-Video (corrected duration)'
  },

  'fal-ai/wan-25-preview/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/wan-25-preview/image-to-video',
      prompt: 'Create smooth motion from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5', // FIXED: Only '5' or '10' allowed (string without 's')
      resolution: '1080p'
    },
    expectedStatus: 200,
    description: 'Wan 2.5 I2V (corrected duration)'
  },

  'fal-ai/minimax/hailuo-02/standard/image-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
      prompt: 'Animate with professional quality',
      image_url: 'https://picsum.photos/512/512',
      duration: '6', // FIXED: Only '6' or '10' allowed (string without 's')
      prompt_optimizer: true,
      resolution: '768P'
    },
    expectedStatus: 200,
    description: 'Minimax Hailuo 02 Standard I2V (corrected duration)'
  },

  // CATEGORY: Content Policy / Prompt Issues
  'fal-ai/luma-dream-machine/ray-2-flash': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash',
      prompt: 'Wild horses galloping across desert plains', // FIXED: Changed from "fast-paced action"
      aspect_ratio: '16:9',
      duration: '5s'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash T2V (safe prompt)'
  },

  'fal-ai/sora-2/image-to-video/pro': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/image-to-video/pro',
      prompt: 'Animate this image with cinematic movement', // FIXED: Changed from "professional video"
      image_url: 'https://picsum.photos/512/512',
      duration: 4,
      resolution: '1080p',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Sora 2 Pro I2V (safe prompt)'
  },

  // CATEGORY: Required Audio URL
  'fal-ai/bytedance/omnihuman': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/bytedance/omnihuman',
      image_url: 'https://picsum.photos/512/512',
      audio_url: 'https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3' // REQUIRED
    },
    expectedStatus: 200,
    description: 'ByteDance OmniHuman (with audio)'
  },

  'fal-ai/kling-video/v1/pro/ai-avatar': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v1/pro/ai-avatar',
      image_url: 'https://picsum.photos/512/512',
      audio_url: 'https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3', // REQUIRED
      prompt: ''
    },
    expectedStatus: 200,
    description: 'Kling AI Avatar Pro (with audio)'
  },

  // CATEGORY: Video-to-Video (different requirements)
  'fal-ai/sora-2/video-to-video/remix': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/video-to-video/remix',
      video_id: 'video_test_placeholder', // REQUIRED: Must be from previous Sora generation
      prompt: 'Transform the video with new artistic style'
    },
    expectedStatus: 200,
    description: 'Sora 2 Video Remix (requires video_id from Sora)'
  },

  'fal-ai/luma-dream-machine/ray-2/modify': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2/modify',
      video_url: 'https://v3.fal.media/files/zebra/9aDde3Te2kuJYHdR0Kz8R_output.mp4', // Must be valid Luma video
      prompt: 'Enhance colors and add vibrance',
      mode: 'flex_1'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Modify (with valid video URL)'
  },

  'fal-ai/luma-dream-machine/ray-2-flash/modify': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash/modify',
      video_url: 'https://v3.fal.media/files/zebra/9aDde3Te2kuJYHdR0Kz8R_output.mp4',
      prompt: 'Apply artistic style transformation',
      mode: 'flex_1'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash Modify'
  },

  'fal-ai/luma-dream-machine/ray-2/reframe': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2/reframe',
      video_url: 'https://v3.fal.media/files/zebra/9aDde3Te2kuJYHdR0Kz8R_output.mp4',
      aspect_ratio: '9:16' // REQUIRED: Target aspect ratio
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Reframe'
  },

  'fal-ai/luma-dream-machine/ray-2-flash/reframe': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2-flash/reframe',
      video_url: 'https://v3.fal.media/files/zebra/9aDde3Te2kuJYHdR0Kz8R_output.mp4',
      aspect_ratio: '9:16'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 Flash Reframe'
  },

  // CATEGORY: Audio Models (different requirements)
  'fal-ai/minimax-music': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax-music',
      prompt: 'Upbeat electronic music with strong rhythm',
      reference_audio_url: 'https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3' // REQUIRED: Reference audio
    },
    expectedStatus: 200,
    description: 'MiniMax Music (with reference audio)'
  },

  // CATEGORY: Lipsync Models (special model parameter)
  'fal-ai/sync-lipsync/v2': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'lipsync-2', // FIXED: Use 'lipsync-2' or 'lipsync-2-pro', not full path
      video_url: 'https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4',
      audio_url: 'https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3',
      sync_mode: 'cut_off'
    },
    expectedStatus: 200,
    description: 'Sync Lipsync v2 (corrected model name)'
  },

  'veed/lipsync': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'veed/lipsync',
      video_url: 'https://v3.fal.media/files/monkey/q1fDPhrpfjfsaRmbhTed4_influencer.mp4', // Must be valid accessible URL
      audio_url: 'https://v3.fal.media/files/rabbit/Ql3ade3wEKlZXRQLRbhxm_tts.mp3'
    },
    expectedStatus: 200,
    description: 'VEED Lipsync (with valid URLs)'
  },

  // CATEGORY: Training Models (require training_data_url) - SKIP TESTING
  // These require actual training data and are long-running processes
  // Commenting out for now as they need special setup

  // CATEGORY: Streaming Models (require different handling)
  // 'fal-ai/flux-krea-lora/stream' - This is a STREAMING model, requires different API call
};

async function testModel(modelName, config) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Testing: ${modelName}`);
    console.log(`📝 ${config.description}`);
    console.log(`📋 Input: ${JSON.stringify(config.body, null, 2)}`);
    
    const response = await fetch(`${BASE_URL}${config.endpoint}`, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        'x-fal-target-url': `https://fal.run/${config.body.model || modelName}`,
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
      },
      body: JSON.stringify(config.body)
    });
    
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    if (response.status === config.expectedStatus) {
      console.log(`✅ PASS - Status: ${response.status} (${responseTime}ms)`);
      if (data && Object.keys(data).length > 0) {
        console.log(`📊 Response: ${JSON.stringify(data).substring(0, 150)}...`);
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
      console.log(`🔴 Full Response: ${JSON.stringify(data, null, 2)}`);
      return {
        model: modelName,
        status: response.status,
        expectedStatus: config.expectedStatus,
        success: false,
        responseTime,
        hasData: false,
        error: data.error || data.detail || 'Unknown error',
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
  console.log('🚀 Testing ONLY Previously Failed Models (with corrections)...\n');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY ? 'Present' : 'Missing'}`);
  console.log(`📊 Total models to test: ${Object.keys(MODEL_TESTS).length}\n`);
  console.log('⏰ This will take several minutes as video models are slow...\n');

  const results = [];
  const startTime = Date.now();

  for (const [modelName, config] of Object.entries(MODEL_TESTS)) {
    const result = await testModel(modelName, config);
    results.push(result);
  }

  const totalTime = Date.now() - startTime;
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n\n📊 ========== TEST SUMMARY ==========');
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000)}s (${Math.round(totalTime / 60000)} minutes)`);
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
    results,
    timestamp: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, 'failing-models-fixed-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Results saved to: ${outputPath}`);

  if (failed > 0) {
    console.log('\n🔍 Still Failing Models:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.model}: ${result.error}`);
    });
  }

  if (passed === results.length) {
    console.log('\n🎉 ALL MODELS PASSED! 🎉');
  }
}

// Run the tests
runTests().catch(console.error);

