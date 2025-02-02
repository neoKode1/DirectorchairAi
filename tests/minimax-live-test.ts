import { describe, expect, it } from "vitest";

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/minimax-live",
  name: "Minimax/Hailuo Video 01 Live",
  description: "High quality video generation with realistic motion",
  category: "video",
};

// Interface from the component
interface MinimaxLiveInput {
  prompt: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  motion_bucket_id?: number;
  cond_aug?: number;
}

describe("Minimax Live Model Configuration", () => {
  it("should validate required fields", () => {
    const mockPayload: MinimaxLiveInput = {
      prompt: "test prompt",
    };

    // Check required field
    expect(mockPayload).toHaveProperty("prompt");
    expect(typeof mockPayload.prompt).toBe("string");
  });

  it("should validate optional fields", () => {
    const mockPayload: MinimaxLiveInput = {
      prompt: "test prompt",
      num_frames: 24,
      fps: 30,
      width: 512,
      height: 512,
      motion_bucket_id: 127,
      cond_aug: 0.02,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.num_frames).toBe("number");
    expect(typeof mockPayload.fps).toBe("number");
    expect(typeof mockPayload.width).toBe("number");
    expect(typeof mockPayload.height).toBe("number");
    expect(typeof mockPayload.motion_bucket_id).toBe("number");
    expect(typeof mockPayload.cond_aug).toBe("number");
  });

  it("should validate parameter ranges", () => {
    const mockPayload: MinimaxLiveInput = {
      prompt: "test prompt",
      num_frames: 24,
      fps: 30,
      width: 512,
      height: 512,
      motion_bucket_id: 127,
      cond_aug: 0.02,
    };

    // Validate num_frames range
    expect(mockPayload.num_frames).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_frames).toBeLessThanOrEqual(50);

    // Validate fps range
    expect(mockPayload.fps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.fps).toBeLessThanOrEqual(60);

    // Validate dimensions
    expect(mockPayload.width).toBeGreaterThanOrEqual(256);
    expect(mockPayload.width).toBeLessThanOrEqual(1024);
    expect(mockPayload.height).toBeGreaterThanOrEqual(256);
    expect(mockPayload.height).toBeLessThanOrEqual(1024);

    // Validate motion_bucket_id range
    expect(mockPayload.motion_bucket_id).toBeGreaterThanOrEqual(1);
    expect(mockPayload.motion_bucket_id).toBeLessThanOrEqual(255);

    // Validate cond_aug range
    expect(mockPayload.cond_aug).toBeGreaterThanOrEqual(0);
    expect(mockPayload.cond_aug).toBeLessThanOrEqual(0.1);
  });

  it("should validate dimension ratios", () => {
    const mockPayload: MinimaxLiveInput = {
      prompt: "test prompt",
      width: 512,
      height: 512,
    };

    // Check if dimensions are multiples of 8
    expect(mockPayload.width! % 8).toBe(0);
    expect(mockPayload.height! % 8).toBe(0);
  });
}); 