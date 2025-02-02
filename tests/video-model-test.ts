import { describe, expect, test } from '@jest/globals';

// Mock model info for different video models
const mockModels = {
  pixverse: {
    id: "fal-ai/pixverse-v3.5",
    name: "Pixverse v3.5",
    description: "State of the art text-to-video generation model",
    category: "video",
  },
  imageToVideo: {
    id: "fal-ai/image-to-video",
    name: "Image to Video",
    description: "Convert still images into fluid videos",
    category: "video",
  },
  videoToVideo: {
    id: "fal-ai/video-to-video",
    name: "Video to Video",
    description: "Transform existing videos using prompts",
    category: "video",
  }
};

interface VideoModelInput {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  fps?: number;
  seed?: number;
  motion_bucket_id?: number;
  noise_aug_strength?: number;
  image_url?: string;  // For image-to-video
  video_url?: string;  // For video-to-video
}

describe("Video Model Configuration", () => {
  describe("Text to Video (Pixverse)", () => {
    test("should validate required fields", () => {
      const mockPayload: VideoModelInput = {
        prompt: "test prompt",
      };

      // Check required field
      expect(mockPayload).toHaveProperty("prompt");
      expect(typeof mockPayload.prompt).toBe("string");
    });

    test("should validate optional fields", () => {
      const mockPayload: VideoModelInput = {
        prompt: "test prompt",
        negative_prompt: "test negative prompt",
        num_frames: 16,
        width: 1024,
        height: 576,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        fps: 8,
        seed: 12345,
        motion_bucket_id: 127,
        noise_aug_strength: 0.02,
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
      expect(typeof mockPayload.motion_bucket_id).toBe("number");
      expect(typeof mockPayload.noise_aug_strength).toBe("number");
    });

    test("should validate parameter ranges", () => {
      const mockPayload: VideoModelInput = {
        prompt: "test prompt",
        num_frames: 16,
        width: 1024,
        height: 576,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        fps: 8,
        motion_bucket_id: 127,
        noise_aug_strength: 0.02,
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

      // Validate motion_bucket_id range (must be between 1 and 255)
      expect(mockPayload.motion_bucket_id).toBeGreaterThanOrEqual(1);
      expect(mockPayload.motion_bucket_id).toBeLessThanOrEqual(255);

      // Validate noise_aug_strength range (must be between 0.0 and 1.0)
      expect(mockPayload.noise_aug_strength).toBeGreaterThanOrEqual(0.0);
      expect(mockPayload.noise_aug_strength).toBeLessThanOrEqual(1.0);
    });
  });

  describe("Image to Video", () => {
    test("should validate required fields for image-to-video", () => {
      const mockPayload: VideoModelInput = {
        prompt: "test prompt",
        image_url: "https://example.com/image.jpg",
      };

      // Check required fields
      expect(mockPayload).toHaveProperty("prompt");
      expect(mockPayload).toHaveProperty("image_url");
      expect(typeof mockPayload.prompt).toBe("string");
      expect(typeof mockPayload.image_url).toBe("string");
      expect(mockPayload.image_url).toMatch(/^https?:\/\/.+/);
    });

    test("should validate image URL format", () => {
      const validUrls = [
        "https://example.com/image.jpg",
        "https://example.com/image.png",
        "https://example.com/image.jpeg",
        "https://example.com/image.webp"
      ];

      validUrls.forEach(url => {
        const mockPayload: VideoModelInput = {
          prompt: "test prompt",
          image_url: url
        };

        expect(mockPayload.image_url).toMatch(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i);
      });
    });
  });

  describe("Video to Video", () => {
    test("should validate required fields for video-to-video", () => {
      const mockPayload: VideoModelInput = {
        prompt: "test prompt",
        video_url: "https://example.com/video.mp4",
      };

      // Check required fields
      expect(mockPayload).toHaveProperty("prompt");
      expect(mockPayload).toHaveProperty("video_url");
      expect(typeof mockPayload.prompt).toBe("string");
      expect(typeof mockPayload.video_url).toBe("string");
      expect(mockPayload.video_url).toMatch(/^https?:\/\/.+/);
    });

    test("should validate video URL format", () => {
      const validUrls = [
        "https://example.com/video.mp4",
        "https://example.com/video.webm",
        "https://example.com/video.mov"
      ];

      validUrls.forEach(url => {
        const mockPayload: VideoModelInput = {
          prompt: "test prompt",
          video_url: url
        };

        expect(mockPayload.video_url).toMatch(/^https?:\/\/.+\.(mp4|webm|mov)$/i);
      });
    });
  });

  describe("Common Validations", () => {
    test("should validate aspect ratios", () => {
      const validAspectRatios = [
        { width: 1024, height: 576 },  // 16:9
        { width: 768, height: 432 },   // 16:9
        { width: 512, height: 512 },   // 1:1
        { width: 576, height: 1024 },  // 9:16
      ];

      validAspectRatios.forEach(({ width, height }) => {
        const mockPayload: VideoModelInput = {
          prompt: "test prompt",
          width,
          height,
        };

        // Check if dimensions are multiples of 8
        expect(mockPayload.width! % 8).toBe(0);
        expect(mockPayload.height! % 8).toBe(0);

        // Check if dimensions are within valid ranges
        expect(mockPayload.width).toBeGreaterThanOrEqual(256);
        expect(mockPayload.width).toBeLessThanOrEqual(1024);
        expect(mockPayload.height).toBeGreaterThanOrEqual(256);
        expect(mockPayload.height).toBeLessThanOrEqual(1024);
      });
    });

    test("should validate default values", () => {
      const mockPayload: VideoModelInput = {
        prompt: "test prompt",
      };

      const defaultValues = {
        num_frames: 16,
        width: 1024,
        height: 576,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        fps: 8,
        motion_bucket_id: 127,
        noise_aug_strength: 0.02,
      };

      // Create full payload with defaults
      const fullPayload: VideoModelInput = {
        ...defaultValues,
        ...mockPayload,
      };

      // Validate all default values
      expect(fullPayload.num_frames).toBe(defaultValues.num_frames);
      expect(fullPayload.width).toBe(defaultValues.width);
      expect(fullPayload.height).toBe(defaultValues.height);
      expect(fullPayload.num_inference_steps).toBe(defaultValues.num_inference_steps);
      expect(fullPayload.guidance_scale).toBe(defaultValues.guidance_scale);
      expect(fullPayload.fps).toBe(defaultValues.fps);
      expect(fullPayload.motion_bucket_id).toBe(defaultValues.motion_bucket_id);
      expect(fullPayload.noise_aug_strength).toBe(defaultValues.noise_aug_strength);
    });
  });
}); 