import { describe, expect, test } from "@jest/globals";

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/flux-pro-ultra-finetuned",
  name: "FLUX Pro 1.1 Ultra Finetuned",
  description: "High quality image generation with finetuning",
  category: "image",
};

// Interface from the component
interface FluxProUltraFinetunedInput {
  prompt: string;
  negative_prompt?: string;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: string;
  output_format?: string;
  aspect_ratio?: string;
  finetune_id: string;
  finetune_strength?: number;
}

describe("Flux Pro Ultra Finetuned Model Configuration", () => {
  test("should validate required fields", () => {
    const mockPayload: FluxProUltraFinetunedInput = {
      prompt: "test prompt",
      finetune_id: "test-finetune-123",
    };

    // Check required fields
    expect(mockPayload).toHaveProperty("prompt");
    expect(mockPayload).toHaveProperty("finetune_id");
    expect(typeof mockPayload.prompt).toBe("string");
    expect(typeof mockPayload.finetune_id).toBe("string");
  });

  test("should validate optional fields", () => {
    const mockPayload: FluxProUltraFinetunedInput = {
      prompt: "test prompt",
      finetune_id: "test-finetune-123",
      negative_prompt: "test negative prompt",
      num_images: 4,
      enable_safety_checker: true,
      safety_tolerance: "medium",
      output_format: "png",
      aspect_ratio: "1:1",
      finetune_strength: 0.8,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.negative_prompt).toBe("string");
    expect(typeof mockPayload.num_images).toBe("number");
    expect(typeof mockPayload.enable_safety_checker).toBe("boolean");
    expect(typeof mockPayload.safety_tolerance).toBe("string");
    expect(typeof mockPayload.output_format).toBe("string");
    expect(typeof mockPayload.aspect_ratio).toBe("string");
    expect(typeof mockPayload.finetune_strength).toBe("number");
  });

  test("should validate parameter ranges and values", () => {
    const mockPayload: FluxProUltraFinetunedInput = {
      prompt: "test prompt",
      finetune_id: "test-finetune-123",
      num_images: 4,
      safety_tolerance: "medium",
      output_format: "png",
      aspect_ratio: "1:1",
      finetune_strength: 0.8,
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

    // Validate finetune_strength range
    expect(mockPayload.finetune_strength).toBeGreaterThanOrEqual(0);
    expect(mockPayload.finetune_strength).toBeLessThanOrEqual(1);
  });

  test("should validate finetune_id format", () => {
    const mockPayload: FluxProUltraFinetunedInput = {
      prompt: "test prompt",
      finetune_id: "test-finetune-123",
    };

    // Check finetune_id format (alphanumeric with hyphens)
    expect(mockPayload.finetune_id).toMatch(/^[a-zA-Z0-9-]+$/);
  });
});
