#!/usr/bin/env node

/**
 * Final 7 Failing Models - With Targeted Fixes
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.FAL_KEY;

// The 7 remaining failures with targeted fixes
const MODEL_TESTS = {
  'fal-ai/dreamomni2/edit': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/dreamomni2/edit',
      image_urls: [
        'https://picsum.photos/512/512',
        'https://picsum.photos/id/237/512/512' // FIXED: Exactly 2 different images
      ],
      prompt: 'Make the first image match the style of the second image'
    },
    expectedStatus: 200,
    description: 'DreamOmni2 Edit (exactly 2 images required)'
  },

  'fal-ai/veo3.1/reference-to-video': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1/reference-to-video',
      image_urls: [
        'https://picsum.photos/512/512',
        'https://picsum.photos/id/237/512/512',
        'https://picsum.photos/id/238/512/512'
      ],
      prompt: 'A ballerina dancing gracefully in a meadow with wildflowers', // FIXED: Safe, descriptive prompt
      duration: '8s',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 Reference to Video (safe prompt)'
  },

  'fal-ai/bytedance/omnihuman': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/bytedance/omnihuman',
      image_url: 'https://storage.googleapis.com/falserverless/example_inputs/omnihuman.png', // FIXED: Use known face image
      audio_url: 'https://storage.googleapis.com/falserverless/example_inputs/omnihuman_audio.mp3'
    },
    expectedStatus: 200,
    description: 'ByteDance OmniHuman (with face image)'
  },

  'fal-ai/kling-video/v1/pro/ai-avatar': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v1/pro/ai-avatar',
      image_url: 'https://storage.googleapis.com/falserverless/example_inputs/kling_ai_avatar_input.jpg', // FIXED: Use known avatar image
      audio_url: 'https://v3.fal.media/files/rabbit/9_0ZG_geiWjZOmn9yscO6_output.mp3',
      prompt: ''
    },
    expectedStatus: 200,
    description: 'Kling AI Avatar Pro (with proper avatar image)'
  },

  'fal-ai/minimax-music': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax-music',
      prompt: 'Fast and limitless music with strong rhythm',
      reference_audio_url: 'https://fal.media/files/lion/OOTBTSlxKMH_E8H6hoSlb.mpga' // FIXED: Use longer reference (>10s)
    },
    expectedStatus: 200,
    description: 'MiniMax Music (with long reference audio)'
  },

  'fal-ai/sync-lipsync/v2': {
    endpoint: '/api/fal/proxy',
    method: 'POST',
    body: {
      model: 'lipsync-2', // FIXED: Use short name, not full path
      video_url: 'https://v3.fal.media/files/tiger/IugLCDJRIoGqvqTa-EJTr_3wg74vCqyNuQ-IiBd77MM_output.mp4',
      audio_url: 'https://fal.media/files/lion/vyFWygmZsIZlUO4s0nr2n.wav',
      sync_mode: 'cut_off'
    },
    expectedStatus: 200,
    description: 'Sync Lipsync v2 (with correct model parameter)'
  },

  // NOTE: Sora 2 Video Remix cannot be tested without first generating a Sora video
  // Skipping this test as it requires a valid video_id from a previous generation
};

async function testModel(modelName, config) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Testing: ${modelName}`);
    console.log(`📝 ${config.description}`);
    
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
    
    // Handle potential streaming responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('text/plain')) {
      const text = await response.text();
      console.log(`⚠️  Received streaming/text response: ${text.substring(0, 100)}...`);
      data = { streaming: true, preview: text.substring(0, 200) };
    } else {
      data = await response.json();
    }
    
    if (response.status === config.expectedStatus) {
      console.log(`✅ PASS - Status: ${response.status} (${responseTime}ms)`);
      return {
        model: modelName,
        status: response.status,
        success: true,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } else {
      console.log(`❌ FAIL - Expected: ${config.expectedStatus}, Got: ${response.status}`);
      console.log(`🔴 Error: ${JSON.stringify(data, null, 2)}`);
      return {
        model: modelName,
        status: response.status,
        success: false,
        responseTime,
        error: data,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ ERROR - ${error.message}`);
    return {
      model: modelName,
      status: 0,
      success: false,
      responseTime,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function runTests() {
  console.log('🔬 Testing Final 7 Failing Models (with targeted fixes)...\n');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📊 Total models to test: ${Object.keys(MODEL_TESTS).length}\n`);

  const results = [];
  const startTime = Date.now();

  for (const [modelName, config] of Object.entries(MODEL_TESTS)) {
    const result = await testModel(modelName, config);
    results.push(result);
  }

  const totalTime = Date.now() - startTime;
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n\n📊 ========== FINAL TEST SUMMARY ==========');
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000)}s`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  const output = {
    summary: {
      total: results.length,
      passed,
      failed,
      successRate: Math.round((passed / results.length) * 100),
      totalTime
    },
    results,
    timestamp: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, 'final-7-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Results saved to: ${outputPath}`);

  if (failed > 0) {
    console.log('\n🔍 Still Failing:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.model}`);
    });
  }

  if (passed === results.length) {
    console.log('\n🎉 ALL FINAL MODELS PASSED! 🎉');
  }
}

runTests().catch(console.error);

