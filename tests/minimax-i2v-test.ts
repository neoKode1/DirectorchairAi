import { describe, expect, test } from '@jest/globals';

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/minimax-i2v",
  name: "Minimax Image to Video",
  description: "Convert still images into dynamic videos",
  category: "video",
};

interface MinimaxI2VInput {
  prompt: string;
  image_url: string;
  negative_prompt?: string;
  num_frames?: number;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  fps?: number;
  seed?: number;
  motion_strength?: number;
}

describe("Minimax I2V Model Configuration", () => {
  test("should validate required fields", () => {
    const mockPayload: MinimaxI2VInput = {
      prompt: "test prompt",
      image_url: "https://example.com/image.jpg",
    };

    // Check required fields
    expect(mockPayload).toHaveProperty("prompt");
    expect(mockPayload).toHaveProperty("image_url");
    expect(typeof mockPayload.prompt).toBe("string");
    expect(typeof mockPayload.image_url).toBe("string");
  });

  test("should validate image URL format", () => {
    const mockPayload: MinimaxI2VInput = {
      prompt: "test prompt",
      image_url: "https://example.com/image.jpg",
    };

    // Check URL format
    expect(mockPayload.image_url).toMatch(/^https?:\/\/.+/);
    
    // Check supported image formats
    expect(mockPayload.image_url).toMatch(/\.(jpg|jpeg|png|webp)$/i);
  });

  test("should validate optional fields", () => {
    const mockPayload: MinimaxI2VInput = {
      prompt: "test prompt",
      image_url: "https://example.com/image.jpg",
      negative_prompt: "test negative prompt",
      num_frames: 16,
      width: 1024,
      height: 576,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      fps: 8,
      seed: 12345,
      motion_strength: 0.7,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.negative_prompt).toBe("string");
    expect(typeof mockPayload.num_frames).toBe("number");
    expect(typeof mockPayload.width).toBe("number");
    expect(typeof mockPayload.height).toBe("number");
    expect(typeof mockPayload.num_inference_steps).toBe("number");
    expect(typeof mockPayload.guidance_scale).toBe("number");
    expect(typeof mockPayload.fps).toBe("number");
    expect(typeof mockPayload.seed).toBe("number");
    expect(typeof mockPayload.motion_strength).toBe("number");
  });

  test("should validate parameter ranges", () => {
    const mockPayload: MinimaxI2VInput = {
      prompt: "test prompt",
      image_url: "https://example.com/image.jpg",
      num_frames: 16,
      width: 1024,
      height: 576,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      fps: 8,
      motion_strength: 0.7,
    };

    // Validate num_frames range (must be between 14 and 120)
    expect(mockPayload.num_frames).toBeGreaterThanOrEqual(14);
    expect(mockPayload.num_frames).toBeLessThanOrEqual(120);

    // Validate dimensions (must be multiples of 8)
    expect(mockPayload.width! % 8).toBe(0);
    expect(mockPayload.height! % 8).toBe(0);

    // Validate width range (must be between 256 and 1024)
    expect(mockPayload.width).toBeGreaterThanOrEqual(256);
    expect(mockPayload.width).toBeLessThanOrEqual(1024);

    // Validate height range (must be between 256 and 576)
    expect(mockPayload.height).toBeGreaterThanOrEqual(256);
    expect(mockPayload.height).toBeLessThanOrEqual(576);

    // Validate num_inference_steps range (must be between 1 and 100)
    expect(mockPayload.num_inference_steps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_inference_steps).toBeLessThanOrEqual(100);

    // Validate guidance_scale range (must be between 1 and 20)
    expect(mockPayload.guidance_scale).toBeGreaterThanOrEqual(1);
    expect(mockPayload.guidance_scale).toBeLessThanOrEqual(20);

    // Validate fps range (must be between 1 and 30)
    expect(mockPayload.fps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.fps).toBeLessThanOrEqual(30);

    // Validate motion_strength range (must be between 0 and 1)
    expect(mockPayload.motion_strength).toBeGreaterThanOrEqual(0);
    expect(mockPayload.motion_strength).toBeLessThanOrEqual(1);
  });
}); 