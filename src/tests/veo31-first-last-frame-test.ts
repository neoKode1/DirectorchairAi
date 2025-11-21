import { fal } from "@fal-ai/client";
import type { Result } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY || 'your-fal-key-here',
});

interface VeoFirstLastFrameResult {
  video: {
    url: string;
  };
}

export async function testVeo31FirstLastFrame() {
  console.log('🧪 Testing fal-ai/veo3.1/fast/first-last-frame-to-video...');

  try {
    const result: Result<VeoFirstLastFrameResult> = await fal.subscribe("fal-ai/veo3.1/fast/first-last-frame-to-video", {
      input: {
        first_frame_url: "https://storage.googleapis.com/falserverless/example_inputs/veo31-flf2v-input-1.jpeg",
        last_frame_url: "https://storage.googleapis.com/falserverless/example_inputs/veo31-flf2v-input-2.jpeg",
        prompt: "Camera holds on the subject as she inhales calmly, then transitions to an energized expression while stepping toward the lens with confidence.",
        duration: "8s",
        aspect_ratio: "16:9",
        resolution: "1080p",
        generate_audio: true
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 Veo 3.1 FLF queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log: any) => console.log(log.message));
        }
      },
    });

    console.log('✅ Veo 3.1 first/last frame test successful!');
    console.log('📦 Result:', result.data);

    return result;
  } catch (error) {
    console.error('❌ Veo 3.1 first/last frame test failed:', error);
    throw error;
  }
}

export async function testVeo31FirstLastFrameVariations() {
  console.log('🧪 Testing Veo 3.1 first/last frame variations...');

  const cases = [
    {
      prompt: "Describe the character settling confidently into the frame, then leaning closer as neon lights bloom in the background.",
      duration: "6s",
      aspect_ratio: "16:9",
      resolution: "720p",
      description: "Cinematic push-in transition"
    },
    {
      prompt: "Capture a contemplative opening pose, then animate a graceful turn toward the viewer amid warm studio lighting.",
      duration: "8s",
      aspect_ratio: "9:16",
      resolution: "1080p",
      description: "Portrait turn"
    }
  ];

  for (const testCase of cases) {
    console.log(`🎬 ${testCase.description}`);
    try {
      const result = await fal.subscribe("fal-ai/veo3.1/fast/first-last-frame-to-video", {
        input: {
          first_frame_url: "https://storage.googleapis.com/falserverless/example_inputs/veo31-flf2v-input-1.jpeg",
          last_frame_url: "https://storage.googleapis.com/falserverless/example_inputs/veo31-flf2v-input-2.jpeg",
          prompt: testCase.prompt,
          duration: testCase.duration,
          aspect_ratio: testCase.aspect_ratio,
          resolution: testCase.resolution,
          generate_audio: true
        },
        logs: false
      });
      console.log(`✅ ${testCase.description} success`, result.data?.video?.url);
    } catch (error) {
      console.error(`❌ ${testCase.description} failed`, error);
    }
  }
}

if (require.main === module) {
  (async () => {
    try {
      await testVeo31FirstLastFrame();
      await testVeo31FirstLastFrameVariations();
      console.log('\n🎉 All Veo 3.1 first/last frame tests completed!');
    } catch (error) {
      console.error('\n💥 Veo 3.1 first/last frame tests failed:', error);
      process.exit(1);
    }
  })();
}

