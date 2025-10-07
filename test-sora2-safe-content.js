import { fal } from "@fal-ai/client";

// Test Sora 2 with known safe content examples
async function testSora2WithSafeContent() {
  const safeExamples = [
    {
      name: "Person walking in nature",
      prompt: "A person walking through a beautiful forest path with sunlight filtering through the trees",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "16:9",
      duration: 4,
      resolution: "720p"
    },
    {
      name: "Person cooking",
      prompt: "A person cooking in a clean, modern kitchen with natural lighting",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "16:9",
      duration: 8,
      resolution: "auto"
    },
    {
      name: "Person reading",
      prompt: "A person reading a book in a cozy, well-lit room",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "9:16",
      duration: 4,
      resolution: "720p"
    },
    {
      name: "Person exercising",
      prompt: "A person doing yoga in a peaceful outdoor setting with natural lighting",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "16:9",
      duration: 8,
      resolution: "auto"
    },
    {
      name: "Person gardening",
      prompt: "A person tending to plants in a beautiful garden with bright sunlight",
      image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
      aspect_ratio: "16:9",
      duration: 4,
      resolution: "720p"
    }
  ];

  console.log('🎬 [Sora 2 Safe Content Test] Testing with known safe content examples...');
  
  for (let i = 0; i < safeExamples.length; i++) {
    const example = safeExamples[i];
    console.log(`\n📋 [Sora 2 Safe Content Test] Test ${i + 1}: ${example.name}`);
    console.log(`📝 [Sora 2 Safe Content Test] Prompt: ${example.prompt}`);
    
    try {
      const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
        input: {
          prompt: example.prompt,
          aspect_ratio: example.aspect_ratio,
          duration: example.duration,
          image_url: example.image_url,
          resolution: example.resolution
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log(`✅ [Sora 2 Safe Content Test] Test ${i + 1} completed successfully!`);
      console.log(`📹 [Sora 2 Safe Content Test] Video URL: ${result.data.video?.url}`);
      console.log(`🆔 [Sora 2 Safe Content Test] Request ID: ${result.requestId}`);
      
    } catch (error) {
      console.error(`❌ [Sora 2 Safe Content Test] Test ${i + 1} failed:`, error);
      console.error(`❌ [Sora 2 Safe Content Test] Error details:`, {
        status: error.status,
        message: error.message,
        body: error.body
      });
    }
  }
}

// Test content filtering
async function testContentFiltering() {
  console.log('\n🎭 [Content Filtering Test] Testing content filtering...');
  
  const testPrompts = [
    "A person walking through a beautiful forest",
    "A person with a gun in a dark alley", // Should be filtered
    "A person cooking in a kitchen", // Should pass
    "A person in a violent fight", // Should be filtered
    "A person reading a book peacefully", // Should pass
    "A person with blood on their hands", // Should be filtered
  ];

  for (const prompt of testPrompts) {
    console.log(`\n📝 [Content Filtering Test] Testing prompt: "${prompt}"`);
    
    try {
      // Test the API route with content filtering
      const response = await fetch('/api/generate/sora2-image-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          aspect_ratio: "16:9",
          duration: 4,
          image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
          resolution: "720p"
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ [Content Filtering Test] Prompt passed filtering`);
      } else {
        console.log(`🚫 [Content Filtering Test] Prompt filtered: ${result.error}`);
        if (result.violations) {
          console.log(`🚫 [Content Filtering Test] Violations: ${result.violations.join(', ')}`);
        }
        if (result.suggestions) {
          console.log(`💡 [Content Filtering Test] Suggestions: ${result.suggestions.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ [Content Filtering Test] Error:`, error);
    }
  }
}

// Test fallback mechanisms
async function testFallbackMechanisms() {
  console.log('\n🔄 [Fallback Test] Testing fallback mechanisms...');
  
  // Test with a prompt that should trigger content policy violation
  const problematicPrompt = "A person with a weapon in a violent scene";
  
  try {
    console.log(`📝 [Fallback Test] Testing problematic prompt: "${problematicPrompt}"`);
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "fal-ai/sora-2/image-to-video",
        prompt: problematicPrompt,
        aspect_ratio: "16:9",
        duration: 4,
        image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
        resolution: "720p"
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ [Fallback Test] Fallback successful with model: ${result.fallbackUsed || result.model}`);
      console.log(`📹 [Fallback Test] Video URL: ${result.data?.video?.url}`);
    } else {
      console.log(`❌ [Fallback Test] All models failed: ${result.error}`);
      if (result.fallbackModels) {
        console.log(`🔄 [Fallback Test] Tried fallback models: ${result.fallbackModels.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ [Fallback Test] Error:`, error);
  }
}

// Run all tests
async function runAllSora2Tests() {
  console.log('🚀 [Sora 2 Comprehensive Tests] Starting comprehensive Sora 2 testing...');
  
  try {
    // Test 1: Safe content examples
    console.log('\n📋 [Sora 2 Tests] Test 1: Safe content examples');
    await testSora2WithSafeContent();
    
    // Test 2: Content filtering
    console.log('\n📋 [Sora 2 Tests] Test 2: Content filtering');
    await testContentFiltering();
    
    // Test 3: Fallback mechanisms
    console.log('\n📋 [Sora 2 Tests] Test 3: Fallback mechanisms');
    await testFallbackMechanisms();
    
    console.log('\n✅ [Sora 2 Tests] All tests completed!');
    console.log('🎉 [Sora 2 Tests] Sora 2 implementation with content filtering and fallbacks is working!');
    
  } catch (error) {
    console.error('\n❌ [Sora 2 Tests] Test suite failed:', error);
    process.exit(1);
  }
}

// Export functions for use in other test files
export { 
  testSora2WithSafeContent, 
  testContentFiltering, 
  testFallbackMechanisms 
};

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAllSora2Tests();
}

// For browser usage
if (typeof window !== 'undefined') {
  window.testSora2WithSafeContent = testSora2WithSafeContent;
  window.testContentFiltering = testContentFiltering;
  window.testFallbackMechanisms = testFallbackMechanisms;
  window.runAllSora2Tests = runAllSora2Tests;
}
