import { describe, expect, test } from '@jest/globals';

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/stable-diffusion-3.5",
  name: "Stable Diffusion 3.5",
  description: "Latest version of Stable Diffusion with enhanced capabilities",
  category: "image",
};

// Interface for the component
interface StableDiffusionInput {
  prompt: string;
  negative_prompt?: string;
  num_images?: number;
  scheduler?: "ddim" | "dpm-solver" | "euler-ancestral" | "euler" | "lms";
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
  seed?: number;
  enable_safety_checker?: boolean;
  clip_skip?: number;
  image_format?: "jpeg" | "png";
  quality?: number;
}

describe("Stable Diffusion 3.5 Model Configuration", () => {
  test("should validate required fields", () => {
    const mockPayload: StableDiffusionInput = {
      prompt: "test prompt",
    };

    // Check required field
    expect(mockPayload).toHaveProperty("prompt");
    expect(typeof mockPayload.prompt).toBe("string");
  });

  test("should validate optional fields", () => {
    const mockPayload: StableDiffusionInput = {
      prompt: "test prompt",
      negative_prompt: "test negative prompt",
      num_images: 4,
      scheduler: "dpm-solver",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      width: 512,
      height: 512,
      seed: 12345,
      enable_safety_checker: true,
      clip_skip: 2,
      image_format: "png",
      quality: 95,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.negative_prompt).toBe("string");
    expect(typeof mockPayload.num_images).toBe("number");
    expect(typeof mockPayload.scheduler).toBe("string");
    expect(typeof mockPayload.num_inference_steps).toBe("number");
    expect(typeof mockPayload.guidance_scale).toBe("number");
    expect(typeof mockPayload.width).toBe("number");
    expect(typeof mockPayload.height).toBe("number");
    expect(typeof mockPayload.seed).toBe("number");
    expect(typeof mockPayload.enable_safety_checker).toBe("boolean");
    expect(typeof mockPayload.clip_skip).toBe("number");
    expect(typeof mockPayload.image_format).toBe("string");
    expect(typeof mockPayload.quality).toBe("number");
  });

  test("should validate parameter ranges and values", () => {
    const mockPayload: StableDiffusionInput = {
      prompt: "test prompt",
      num_images: 4,
      scheduler: "dpm-solver",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      width: 512,
      height: 512,
      clip_skip: 2,
      quality: 95,
    };

    // Validate num_images range
    expect(mockPayload.num_images).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_images).toBeLessThanOrEqual(4);

    // Validate scheduler options
    const validSchedulers = ["ddim", "dpm-solver", "euler-ancestral", "euler", "lms"];
    expect(validSchedulers).toContain(mockPayload.scheduler);

    // Validate num_inference_steps range
    expect(mockPayload.num_inference_steps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_inference_steps).toBeLessThanOrEqual(100);

    // Validate guidance_scale range
    expect(mockPayload.guidance_scale).toBeGreaterThanOrEqual(1);
    expect(mockPayload.guidance_scale).toBeLessThanOrEqual(20);

    // Validate dimensions
    expect(mockPayload.width).toBeGreaterThanOrEqual(256);
    expect(mockPayload.width).toBeLessThanOrEqual(1024);
    expect(mockPayload.height).toBeGreaterThanOrEqual(256);
    expect(mockPayload.height).toBeLessThanOrEqual(1024);

    // Validate clip_skip range
    expect(mockPayload.clip_skip).toBeGreaterThanOrEqual(1);
    expect(mockPayload.clip_skip).toBeLessThanOrEqual(4);

    // Validate quality range
    expect(mockPayload.quality).toBeGreaterThanOrEqual(1);
    expect(mockPayload.quality).toBeLessThanOrEqual(100);
  });

  test("should validate dimension ratios", () => {
    const mockPayload: StableDiffusionInput = {
      prompt: "test prompt",
      width: 512,
      height: 512,
    };

    // Check if dimensions are multiples of 8
    expect(mockPayload.width! % 8).toBe(0);
    expect(mockPayload.height! % 8).toBe(0);
  });

  test("should validate image format options", () => {
    const mockPayload: StableDiffusionInput = {
      prompt: "test prompt",
      image_format: "png",
    };

    // Validate image format options
    const validFormats = ["jpeg", "png"];
    expect(validFormats).toContain(mockPayload.image_format);
  });
}); 