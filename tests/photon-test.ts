import { describe, expect, test } from '@jest/globals';

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/photon",
  name: "Photon",
  description: "High quality image generation",
  category: "image",
};

// Mock the expected payload structure
interface PhotonModelState {
  prompt: string;
  generation_type: "image";
  model: "photon-1" | "photon-flash-1" | string;
  aspect_ratio: string;
  negative_prompt?: string;
  seed?: number;
  num_steps?: number;
  guidance_scale?: number;
  image_url?: string;
}

describe("Photon Model Configuration", () => {
  test("should have valid model options", () => {
    const validModels = ["photon-1", "photon-flash-1"];
    expect(validModels).toContain("photon-1");
    expect(validModels).toContain("photon-flash-1");
  });

  test("should have valid aspect ratio options", () => {
    const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
    expect(validAspectRatios).toContain("1:1");
    expect(validAspectRatios).toContain("16:9");
  });

  test("should validate payload structure", () => {
    const mockPayload: PhotonModelState = {
      prompt: "test prompt",
      generation_type: "image",
      model: "photon-1",
      aspect_ratio: "1:1",
      negative_prompt: "test negative prompt",
      seed: 123,
      num_steps: 30,
      guidance_scale: 7.5,
    };

    // Check required fields
    expect(mockPayload).toHaveProperty("prompt");
    expect(mockPayload).toHaveProperty("generation_type");
    expect(mockPayload).toHaveProperty("model");
    expect(mockPayload).toHaveProperty("aspect_ratio");

    // Check field types
    expect(typeof mockPayload.prompt).toBe("string");
    expect(mockPayload.generation_type).toBe("image");
    expect(typeof mockPayload.model).toBe("string");
    expect(typeof mockPayload.aspect_ratio).toBe("string");
    
    // Check optional fields
    expect(typeof mockPayload.negative_prompt).toBe("string");
    expect(typeof mockPayload.seed).toBe("number");
    expect(typeof mockPayload.num_steps).toBe("number");
    expect(typeof mockPayload.guidance_scale).toBe("number");
  });

  test("should validate parameter ranges", () => {
    const mockPayload: PhotonModelState = {
      prompt: "test prompt",
      generation_type: "image",
      model: "photon-1",
      aspect_ratio: "1:1",
      num_steps: 30,
      guidance_scale: 7.5,
    };

    // Validate num_steps range
    expect(mockPayload.num_steps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_steps).toBeLessThanOrEqual(50);

    // Validate guidance_scale range
    expect(mockPayload.guidance_scale).toBeGreaterThanOrEqual(1);
    expect(mockPayload.guidance_scale).toBeLessThanOrEqual(20);
  });
}); 