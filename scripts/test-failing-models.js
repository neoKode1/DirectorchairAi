#!/usr/bin/env node

/**
 * Quick Test Script for Failing Models Only
 * Tests only the models that are currently failing with 422 errors
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.FAL_KEY;

// Only failing models for quick debugging - Using FAL Proxy Server
const MODEL_TESTS = {
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
    description: 'Reve Text-to-Image generation (via FAL Proxy)'
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
    description: 'Reve Edit image transformation (via FAL Proxy)'
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
    description: 'Sora 2 text-to-video (via FAL Proxy)'
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
  console.log('🚀 Starting quick test for failing models only...');
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

  const outputPath = path.join(__dirname, 'failing-test-results.json');
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
