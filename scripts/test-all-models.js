#!/usr/bin/env node

/**
 * Comprehensive API Model Testing Script
 * Tests all models systematically to ensure they work with correct parameters
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.FAL_KEY;

// Model test configurations
const MODEL_TESTS = {
  // Text-to-Image Models
  'fal-ai/reve/text-to-image': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/reve/text-to-image',
      prompt: 'A beautiful sunset over mountains',
      aspect_ratio: '16:9',
      num_images: 1,
      output_format: 'png'
    },
    expectedStatus: 200,
    description: 'Reve Text-to-Image generation'
  },
  
  'fal-ai/reve/edit': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/reve/edit',
      prompt: 'Make the sky more dramatic',
      image_url: 'https://picsum.photos/512/512',
      num_images: 1,
      output_format: 'png'
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
      output_format: 'jpeg'
    },
    expectedStatus: 200,
    description: 'Reve Remix multi-image combination'
  },

  'fal-ai/flux-pro/v1.1-ultra': {
    endpoint: '/api/generate/flux-pro',
    method: 'POST',
    body: {
      prompt: 'A futuristic city at night',
      aspect_ratio: '16:9',
      output_format: 'jpeg',
      num_images: 1
    },
    expectedStatus: 200,
    description: 'Flux Pro Ultra image generation'
  },

  // Text-to-Video Models
  'fal-ai/veo3.1': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/veo3.1',
      prompt: 'A cat playing with a ball',
      duration: '8s',
      aspect_ratio: '16:9',
      resolution: '720p'
    },
    expectedStatus: 200,
    description: 'Veo 3.1 text-to-video'
  },

  'fal-ai/sora-2/text-to-video': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/sora-2/text-to-video',
      prompt: 'Ocean waves crashing on rocks',
      duration: 4,
      resolution: 'auto'
    },
    expectedStatus: 200,
    description: 'Sora 2 text-to-video'
  },

  'fal-ai/kling-video/v2.1/master/text-to-video': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/kling-video/v2.1/master/text-to-video',
      prompt: 'A bird flying over a forest',
      duration: '5',
      aspect_ratio: '16:9'
    },
    expectedStatus: 200,
    description: 'Kling 2.1 Master text-to-video'
  },

  // Image-to-Video Models
  'fal-ai/veo3.1/image-to-video': {
    endpoint: '/api/fal',
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

  'fal-ai/pixverse/v5/image-to-video': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/pixverse/v5/image-to-video',
      prompt: 'pan right',
      image_url: 'https://picsum.photos/512/512',
      duration: '5'
    },
    expectedStatus: 200,
    description: 'Pixverse v5 image-to-video (duration fix test)'
  },

  'fal-ai/luma-dream-machine/ray-2/image-to-video': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/luma-dream-machine/ray-2/image-to-video',
      prompt: 'Create a cinematic video from this image',
      image_url: 'https://picsum.photos/512/512',
      duration: '5s'
    },
    expectedStatus: 200,
    description: 'Luma Ray 2 image-to-video'
  },

  // Audio Models
  'fal-ai/minimax-music/v1.5': {
    endpoint: '/api/fal',
    method: 'POST',
    body: {
      model: 'fal-ai/minimax-music/v1.5',
      prompt: 'Create upbeat electronic music',
      duration: '30'
    },
    expectedStatus: 200,
    description: 'MiniMax Music v1.5 generation'
  },

  'fal-ai/elevenlabs-tts': {
    endpoint: '/api/generate/elevenlabs-tts',
    method: 'POST',
    body: {
      text: 'Hello, this is a test of the text-to-speech system.',
      voice: 'alloy'
    },
    expectedStatus: 200,
    description: 'ElevenLabs TTS generation'
  }
};

// Test runner
class APITester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async testModel(modelId, config) {
    const testStart = Date.now();
    console.log(`\n🧪 Testing: ${modelId}`);
    console.log(`📝 ${config.description}`);
    
    try {
      const response = await fetch(`${BASE_URL}${config.endpoint}`, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        },
        body: JSON.stringify(config.body)
      });

      const responseTime = Date.now() - testStart;
      const responseData = await response.json();

      const result = {
        model: modelId,
        status: response.status,
        expectedStatus: config.expectedStatus,
        success: response.status === config.expectedStatus,
        responseTime: responseTime,
        hasData: !!(responseData.data || responseData.images || responseData.videos),
        error: responseData.error || null,
        timestamp: new Date().toISOString()
      };

      if (result.success) {
        console.log(`✅ PASS - Status: ${response.status} (${responseTime}ms)`);
        if (result.hasData) {
          console.log(`📊 Data received: ${JSON.stringify(responseData).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ FAIL - Expected: ${config.expectedStatus}, Got: ${response.status}`);
        if (result.error) {
          console.log(`🔴 Error: ${result.error}`);
        }
      }

      this.results.push(result);
      return result;

    } catch (error) {
      const result = {
        model: modelId,
        status: 'ERROR',
        expectedStatus: config.expectedStatus,
        success: false,
        responseTime: Date.now() - testStart,
        hasData: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      console.log(`💥 EXCEPTION - ${error.message}`);
      this.results.push(result);
      return result;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive API model testing...');
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log(`🔑 API Key: ${API_KEY ? 'Present' : 'Missing'}`);
    console.log(`📊 Total models to test: ${Object.keys(MODEL_TESTS).length}`);

    for (const [modelId, config] of Object.entries(MODEL_TESTS)) {
      await this.testModel(modelId, config);
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.generateReport();
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const successRate = ((passed / this.results.length) * 100).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`⏱️  Total time: ${(totalTime / 1000).toFixed(1)}s`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success rate: ${successRate}%`);

    if (failed > 0) {
      console.log('\n🔴 FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  • ${result.model}: ${result.error || `Status ${result.status}`}`);
      });
    }

    // Save detailed report
    const reportPath = path.join(__dirname, 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        total: this.results.length,
        passed,
        failed,
        successRate: parseFloat(successRate),
        totalTime
      },
      results: this.results
    }, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run tests
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = { APITester, MODEL_TESTS };
