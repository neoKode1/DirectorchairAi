import { fal } from '@fal-ai/client';

// Test Sora 2 Image-to-Video Model
async function testSora2ImageToVideo() {
  try {
    console.log('🎬 [Sora 2 Test] Starting Sora 2 image-to-video generation...');

    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input: {
        prompt: "A woman looks into the camera, breathes in, then exclaims energetically: 'This is amazing! I can't believe how realistic this looks!'",
        image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
        resolution: "auto",
        aspect_ratio: "auto",
        duration: 4,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('🎬 [Sora 2 Test] Progress:', update.logs?.map(log => log.message).join('\n'));
        }
      },
    });

    console.log('✅ [Sora 2 Test] Generation completed successfully!');
    console.log('📹 [Sora 2 Test] Video URL:', result.data.video?.url);
    console.log('🆔 [Sora 2 Test] Request ID:', result.requestId);
    
    return result;

  } catch (error: any) {
    console.error('❌ [Sora 2 Test] Error:', error);
    console.error('❌ [Sora 2 Test] Error details:', {
      status: error.status,
      message: error.message,
      body: error.body
    });
    throw error;
  }
}

// Test Sora 2 with different parameters
async function testSora2WithCustomParams() {
  try {
    console.log('🎬 [Sora 2 Custom Test] Testing with custom parameters...');

    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input: {
        prompt: "A cat sitting on a windowsill, then suddenly jumping down and running across the room",
        image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
        resolution: "720p",
        aspect_ratio: "16:9",
        duration: 8,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('🎬 [Sora 2 Custom Test] Progress:', update.logs?.map(log => log.message).join('\n'));
        }
      },
    });

    console.log('✅ [Sora 2 Custom Test] Generation completed successfully!');
    console.log('📹 [Sora 2 Custom Test] Video URL:', result.data.video?.url);
    console.log('🆔 [Sora 2 Custom Test] Request ID:', result.requestId);
    
    return result;

  } catch (error: any) {
    console.error('❌ [Sora 2 Custom Test] Error:', error);
    console.error('❌ [Sora 2 Custom Test] Error details:', {
      status: error.status,
      message: error.message,
      body: error.body
    });
    throw error;
  }
}

// Test Sora 2 with API key (if provided)
async function testSora2WithAPIKey() {
  try {
    console.log('🎬 [Sora 2 API Key Test] Testing with OpenAI API key...');

    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input: {
        prompt: "A person walking through a forest, with sunlight filtering through the trees",
        image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
        resolution: "auto",
        aspect_ratio: "auto",
        duration: 4,
        api_key: process.env.OPENAI_API_KEY, // Use your OpenAI API key if available
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log('🎬 [Sora 2 API Key Test] Progress:', update.logs?.map(log => log.message).join('\n'));
        }
      },
    });

    console.log('✅ [Sora 2 API Key Test] Generation completed successfully!');
    console.log('📹 [Sora 2 API Key Test] Video URL:', result.data.video?.url);
    console.log('🆔 [Sora 2 API Key Test] Request ID:', result.requestId);
    
    return result;

  } catch (error: any) {
    console.error('❌ [Sora 2 API Key Test] Error:', error);
    console.error('❌ [Sora 2 API Key Test] Error details:', {
      status: error.status,
      message: error.message,
      body: error.body
    });
    throw error;
  }
}

// Run all tests
async function runSora2Tests() {
  console.log('🚀 [Sora 2 Tests] Starting Sora 2 model tests...');
  
  try {
    // Test 1: Basic functionality
    console.log('\n📋 [Sora 2 Tests] Test 1: Basic Sora 2 generation');
    await testSora2ImageToVideo();
    
    // Test 2: Custom parameters
    console.log('\n📋 [Sora 2 Tests] Test 2: Custom parameters');
    await testSora2WithCustomParams();
    
    // Test 3: With API key (optional)
    if (process.env.OPENAI_API_KEY) {
      console.log('\n📋 [Sora 2 Tests] Test 3: With OpenAI API key');
      await testSora2WithAPIKey();
    } else {
      console.log('\n⚠️ [Sora 2 Tests] Test 3: Skipped (no OpenAI API key provided)');
    }
    
    console.log('\n✅ [Sora 2 Tests] All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ [Sora 2 Tests] Test suite failed:', error);
    process.exit(1);
  }
}

// Export for use in other test files
export { testSora2ImageToVideo, testSora2WithCustomParams, testSora2WithAPIKey };

// Run tests if this file is executed directly
if (require.main === module) {
  runSora2Tests();
}
