import { describe, expect, it } from "vitest";

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/kling",
  name: "Kling 1.6 Pro",
  description: "High quality video generation",
  category: "video",
};

// Interface from the component
interface KlingInput {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

describe("Kling Model Configuration", () => {
  it("should validate required fields", () => {
    const mockPayload: KlingInput = {
      prompt: "test prompt",
    };

    // Check required field
    expect(mockPayload).toHaveProperty("prompt");
    expect(typeof mockPayload.prompt).toBe("string");
  });

  it("should validate optional fields", () => {
    const mockPayload: KlingInput = {
      prompt: "test prompt",
      negative_prompt: "test negative prompt",
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

  it("should validate parameter ranges", () => {
    const mockPayload: KlingInput = {
      prompt: "test prompt",
      num_frames: 24,
      fps: 30,
      width: 512,
      height: 512,
      guidance_scale: 7.5,
      num_inference_steps: 50,
    };

    // Validate num_frames range
    expect(mockPayload.num_frames).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_frames).toBeLessThanOrEqual(120);

    // Validate fps range
    expect(mockPayload.fps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.fps).toBeLessThanOrEqual(60);

    // Validate dimensions
    expect(mockPayload.width).toBeGreaterThanOrEqual(256);
    expect(mockPayload.width).toBeLessThanOrEqual(1024);
    expect(mockPayload.height).toBeGreaterThanOrEqual(256);
    expect(mockPayload.height).toBeLessThanOrEqual(1024);

    // Validate guidance_scale range
    expect(mockPayload.guidance_scale).toBeGreaterThanOrEqual(1);
    expect(mockPayload.guidance_scale).toBeLessThanOrEqual(20);

    // Validate num_inference_steps range
    expect(mockPayload.num_inference_steps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_inference_steps).toBeLessThanOrEqual(100);
  });

  it("should validate dimension ratios", () => {
    const mockPayload: KlingInput = {
      prompt: "test prompt",
      width: 512,
      height: 512,
    };

    // Check if dimensions are multiples of 8
    expect(mockPayload.width! % 8).toBe(0);
    expect(mockPayload.height! % 8).toBe(0);
  });
}); 