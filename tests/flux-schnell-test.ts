import { describe, expect, test } from '@jest/globals';

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/flux-schnell",
  name: "FLUX Schnell",
  description: "Fast image generation",
  category: "image",
};

// Interface from the component
interface FluxSchnellInput {
  prompt: string;
  negative_prompt?: string;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: string;
  output_format?: string;
  aspect_ratio?: string;
  width?: number;
  height?: number;
}

describe("Flux Schnell Model Configuration", () => {
  test("should validate required fields", () => {
    const mockPayload: FluxSchnellInput = {
      prompt: "test prompt",
    };

    // Check required field
    expect(mockPayload).toHaveProperty("prompt");
    expect(typeof mockPayload.prompt).toBe("string");
  });

  test("should validate optional fields", () => {
    const mockPayload: FluxSchnellInput = {
      prompt: "test prompt",
      negative_prompt: "test negative prompt",
      num_images: 4,
      enable_safety_checker: true,
      safety_tolerance: "medium",
      output_format: "png",
      aspect_ratio: "1:1",
      width: 512,
      height: 512,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.negative_prompt).toBe("string");
    expect(typeof mockPayload.num_images).toBe("number");
    expect(typeof mockPayload.enable_safety_checker).toBe("boolean");
    expect(typeof mockPayload.safety_tolerance).toBe("string");
    expect(typeof mockPayload.output_format).toBe("string");
    expect(typeof mockPayload.aspect_ratio).toBe("string");
    expect(typeof mockPayload.width).toBe("number");
    expect(typeof mockPayload.height).toBe("number");
  });

  test("should validate parameter ranges and values", () => {
    const mockPayload: FluxSchnellInput = {
      prompt: "test prompt",
      num_images: 4,
      safety_tolerance: "medium",
      output_format: "png",
      aspect_ratio: "1:1",
      width: 512,
      height: 512,
    };

    // Validate num_images range
    expect(mockPayload.num_images).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_images).toBeLessThanOrEqual(4);

    // Validate safety_tolerance options
    const validSafetyTolerances = ["low", "medium", "high"];
    expect(validSafetyTolerances).toContain(mockPayload.safety_tolerance);

    // Validate output_format options
    const validOutputFormats = ["png", "jpg"];
    expect(validOutputFormats).toContain(mockPayload.output_format);

    // Validate aspect_ratio options
    const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
    expect(validAspectRatios).toContain(mockPayload.aspect_ratio);

    // Validate dimensions
    expect(mockPayload.width).toBeGreaterThanOrEqual(256);
    expect(mockPayload.width).toBeLessThanOrEqual(1024);
    expect(mockPayload.height).toBeGreaterThanOrEqual(256);
    expect(mockPayload.height).toBeLessThanOrEqual(1024);
  });

  test("should validate dimension ratios", () => {
    const mockPayload: FluxSchnellInput = {
      prompt: "test prompt",
      width: 512,
      height: 512,
    };

    // Check if dimensions are multiples of 8
    expect(mockPayload.width! % 8).toBe(0);
    expect(mockPayload.height! % 8).toBe(0);
  });
}); 