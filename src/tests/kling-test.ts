import { describe, expect, it } from "vitest";
import { fal, QueueStatus, RequestLog } from "@fal-ai/client";

// Interface for Kling model input
interface KlingInput {
  prompt: string;
  image_url: string;
  negative_prompt?: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

// Interface for Kling model output
interface KlingOutput {
  video_url: string;
  requestId: string;
}

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/kling-video/v1.6/pro/image-to-video",
  name: "Kling 1.6 Pro",
  description: "High quality video generation from image",
  category: "video",
};

describe("Kling Model Configuration", () => {
  it("should validate required fields", () => {
    const mockPayload: KlingInput = {
      prompt: "A stylish woman walks down a Tokyo street",
      image_url: "https://example.com/image.jpg"
    };

    // Check required fields
    expect(mockPayload).toHaveProperty("prompt");
    expect(mockPayload).toHaveProperty("image_url");
    expect(typeof mockPayload.prompt).toBe("string");
    expect(typeof mockPayload.image_url).toBe("string");
  });

  it("should validate optional fields", () => {
    const mockPayload: KlingInput = {
      prompt: "A stylish woman walks down a Tokyo street",
      image_url: "https://example.com/image.jpg",
      negative_prompt: "blurry, low quality",
      num_frames: 24,
      fps: 30,
      width: 512,
      height: 512,
      guidance_scale: 7.5,
      num_inference_steps: 50,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.negative_prompt).toBe("string");
    expect(typeof mockPayload.num_frames).toBe("number");
    expect(typeof mockPayload.fps).toBe("number");
    expect(typeof mockPayload.width).toBe("number");
    expect(typeof mockPayload.height).toBe("number");
    expect(typeof mockPayload.guidance_scale).toBe("number");
    expect(typeof mockPayload.num_inference_steps).toBe("number");
  });

  it("should validate image URL format", () => {
    const mockPayload: KlingInput = {
      prompt: "A stylish woman walks down a Tokyo street",
      image_url: "https://example.com/image.jpg"
    };

    expect(mockPayload.image_url).toMatch(/^https?:\/\/.+/);
  });
});

// Test function for the Kling model
async function testKlingModel(input: KlingInput): Promise<KlingOutput> {
  try {
    console.log("Testing Kling model with input:", input);
    
    const result = await fal.subscribe(mockModelInfo.id, {
      input,
      logs: true,
      onQueueUpdate: (status: QueueStatus) => {
        if (status.status === "IN_PROGRESS" && status.logs) {
          status.logs.map((log: RequestLog) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Kling model test completed successfully");
    console.log("Request ID:", result.requestId);
    
    return {
      video_url: result.data.video_url,
      requestId: result.requestId
    };
  } catch (error) {
    console.error("Error testing Kling model:", error);
    throw error;
  }
}

// Only run this test if FAL_KEY is available
if (process.env.FAL_KEY) {
  describe("Kling Model Integration", () => {
    it("should generate video from image", async () => {
      const input: KlingInput = {
        prompt: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage",
        image_url: "https://example.com/test-image.jpg"
      };

      const result = await testKlingModel(input);
      
      expect(result).toHaveProperty("video_url");
      expect(result).toHaveProperty("requestId");
      expect(typeof result.video_url).toBe("string");
      expect(typeof result.requestId).toBe("string");
    }, 60000); // Timeout after 60 seconds
  });
}
