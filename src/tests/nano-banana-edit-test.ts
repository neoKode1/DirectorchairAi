import { fal } from "@fal-ai/client";
import type { Result } from "@fal-ai/client";

// Test configuration
fal.config({
  credentials: process.env.FAL_KEY || 'your-fal-key-here',
});

interface NanoBananaEditResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

/**
 * Test the fal-ai/nano-banana/edit model
 * This model is designed for image-to-image editing with high fidelity
 */
async function testNanoBananaEdit() {
  console.log('🧪 Testing fal-ai/nano-banana/edit model...');

  try {
    // Test with a sample image URL (you would replace this with an actual image)
    const testImageUrl = "https://example.com/test-image.jpg";
    
                    const result: Result<NanoBananaEditResult> = await fal.subscribe("fal-ai/nano-banana/edit", {
                  input: {
                    prompt: "Edit this image to add a beautiful sunset background - make dramatic and noticeable changes",
                    image_urls: [testImageUrl],
                    num_images: 1,
                    output_format: "jpeg",
                    strength: 0.9,
                    guidance_scale: 7.5
                  },
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 Queue update:', update.status);
        if (update.status === "IN_PROGRESS" && update.logs) {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ Nano Banana Edit test successful!');
    console.log('📦 Result:', result);
    
    if (result.data && result.data.images) {
      console.log('🖼️ Generated images:');
      result.data.images.forEach((image, index) => {
        console.log(`  Image ${index + 1}: ${image.url} (${image.width}x${image.height})`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Nano Banana Edit test failed:', error);
    throw error;
  }
}

/**
 * Test the model with different editing prompts
 */
async function testNanoBananaEditVariations() {
  console.log('🧪 Testing nano-banana/edit with different prompts...');

  const testCases = [
    {
      prompt: "Transform this into a watercolor painting style",
      description: "Watercolor style transformation"
    },
    {
      prompt: "Add a vintage film grain effect",
      description: "Vintage film effect"
    },
    {
      prompt: "Change the background to a futuristic cityscape",
      description: "Background replacement"
    },
    {
      prompt: "Enhance the lighting to create a dramatic mood",
      description: "Lighting enhancement"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🎨 Testing: ${testCase.description}`);
    try {
                        const result = await fal.subscribe("fal-ai/nano-banana/edit", {
                    input: {
                      prompt: `${testCase.prompt} - make dramatic and noticeable changes`,
                      image_urls: ["https://example.com/test-image.jpg"],
                      num_images: 1,
                      output_format: "jpeg",
                      strength: 0.9,
                      guidance_scale: 7.5
                    },
        logs: false
      });
      
      console.log(`✅ ${testCase.description} - Success`);
      if (result.data?.images?.[0]) {
        console.log(`   Output: ${result.data.images[0].url}`);
      }
    } catch (error) {
      console.error(`❌ ${testCase.description} - Failed:`, error);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await testNanoBananaEdit();
      await testNanoBananaEditVariations();
      console.log('\n🎉 All nano-banana/edit tests completed!');
    } catch (error) {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    }
  })();
}

export { testNanoBananaEdit, testNanoBananaEditVariations };
