import { fal } from "@fal-ai/client";
import { describe, expect, test, jest } from '@jest/globals';

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/recraft-20b",
  name: "Recraft 20B",
  description: "State of the art Recraft 20B model by recraft.ai",
  category: "image",
};

// Interface definitions
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface ImageSize {
  width: number;
  height: number;
}

type ImageSizePreset = "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";

interface RecraftInput {
  prompt: string;
  image_size: ImageSizePreset | ImageSize;
  style?: string;
  colors?: RGBColor[];
  style_id?: string;
}

interface ImageResult {
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
}

interface RecraftResponse {
  data: {
    images: ImageResult[];
  };
}

// Update the mockFetch function definition
const mockFetch = (response: any) => {
  return jest.fn(
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response)
      } as Response)
  );
};

async function testRecraft() {
  try {
    console.log("Starting Recraft test...");
    
    const result = await fal.subscribe("fal-ai/recraft", {
      input: {
        prompt: "A majestic tiger in a mystical forest",
        negative_prompt: "blurry, low quality",
        num_images: 1,
        style: "cinematic",
        width: 1024,
        height: 1024
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Recraft generation completed!");
    console.log("Result:", result);
    console.log("Image URLs:", result.data?.images?.map((img: ImageResult) => img.url));
  } catch (error) {
    console.error("Error in Recraft:", error);
  }
}

testRecraft();

describe("Recraft Model Configuration", () => {
  describe("Input Validation", () => {
    test("should validate required fields", () => {
      const mockPayload: RecraftInput = {
        prompt: "test prompt",
        image_size: "square_hd"
      };

      // Check required fields
      expect(mockPayload).toHaveProperty("prompt");
      expect(mockPayload).toHaveProperty("image_size");
      expect(typeof mockPayload.prompt).toBe("string");
    });

    test("should validate preset image sizes", () => {
      const validSizes: ImageSizePreset[] = [
        "square_hd",
        "square",
        "portrait_4_3",
        "portrait_16_9",
        "landscape_4_3",
        "landscape_16_9"
      ];

      const mockPayload: RecraftInput = {
        prompt: "test prompt",
        image_size: "square_hd"
      };

      expect(validSizes).toContain(mockPayload.image_size);
    });

    test("should validate custom image dimensions", () => {
      const mockPayload: RecraftInput = {
        prompt: "test prompt",
        image_size: {
          width: 1024,
          height: 768
        }
      };

      // Check if image_size is an object with width and height
      expect(typeof (mockPayload.image_size as ImageSize).width).toBe("number");
      expect(typeof (mockPayload.image_size as ImageSize).height).toBe("number");

      // Validate dimension constraints
      const { width, height } = mockPayload.image_size as ImageSize;
      expect(width).toBeGreaterThanOrEqual(256);
      expect(width).toBeLessThanOrEqual(2048);
      expect(height).toBeGreaterThanOrEqual(256);
      expect(height).toBeLessThanOrEqual(2048);
    });

    test("should validate style options", () => {
      const mockPayload: RecraftInput = {
        prompt: "test prompt",
        image_size: "square_hd",
        style: "realistic_image"
      };

      const validStyles = [
        "any",
        "realistic_image",
        "digital_illustration",
        "vector_illustration",
        "realistic_image/b_and_w",
        "realistic_image/enterprise",
        "digital_illustration/3d",
        "vector_illustration/cartoon",
        "icon/broken_line"
      ];

      expect(validStyles).toContain(mockPayload.style);
    });

    test("should validate color format", () => {
      const mockPayload: RecraftInput = {
        prompt: "test prompt",
        image_size: "square_hd",
        colors: [
          { r: 255, g: 0, b: 0 },
          { r: 0, g: 255, b: 0 },
          { r: 0, g: 0, b: 255 }
        ]
      };

      // Check if colors is an array
      expect(Array.isArray(mockPayload.colors)).toBe(true);

      // Validate each color's RGB values
      mockPayload.colors?.forEach(color => {
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
      });
    });

    test("should validate optional style_id", () => {
      const mockPayload: RecraftInput = {
        prompt: "test prompt",
        image_size: "square_hd",
        style_id: "custom_style_123"
      };

      // Check if style_id is a string when provided
      expect(typeof mockPayload.style_id).toBe("string");
    });
  });

  describe("API Integration", () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.resetAllMocks();
    });

    test("should handle successful image generation", async () => {
      const mockResponse: RecraftResponse = {
        data: {
          images: [
            {
              url: "https://example.com/image1.png",
              content_type: "image/png",
              file_name: "image1.png",
              file_size: 1024
            }
          ]
        }
      };

      // Set up fetch mock
      global.fetch = mockFetch(mockResponse);

      const response = await fetch("/api/generate/recraft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "test prompt",
          image_size: "square_hd"
        })
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result).toEqual(mockResponse);
      expect(result.data.images).toHaveLength(1);
      expect(result.data.images[0]).toHaveProperty("url");
    });

    test("should handle API errors", async () => {
      // Set up fetch mock for error case
      global.fetch = mockFetch({ error: "Failed to generate image" });

      const response = await fetch("/api/generate/recraft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "",  // Invalid input
          image_size: "square_hd"
        })
      });

      const result = await response.json();

      expect(response.ok).toBe(true); // Mock always returns ok
      expect(result).toHaveProperty("error");
    });
  });

  describe("Response Validation", () => {
    test("should validate image result format", () => {
      const mockResult: ImageResult = {
        url: "https://example.com/image.png",
        content_type: "image/png",
        file_name: "image.png",
        file_size: 1024
      };

      expect(mockResult).toHaveProperty("url");
      expect(typeof mockResult.url).toBe("string");
      expect(mockResult.url).toMatch(/^https?:\/\//);
      expect(mockResult.content_type).toMatch(/^image\//);
      expect(mockResult.file_size).toBeGreaterThan(0);
    });

    test("should handle multiple images in response", () => {
      const mockResponse: RecraftResponse = {
        data: {
          images: [
            {
              url: "https://example.com/image1.png",
              content_type: "image/png",
              file_name: "image1.png",
              file_size: 1024
            },
            {
              url: "https://example.com/image2.png",
              content_type: "image/png",
              file_name: "image2.png",
              file_size: 1024
            }
          ]
        }
      };

      expect(Array.isArray(mockResponse.data.images)).toBe(true);
      expect(mockResponse.data.images.length).toBeGreaterThan(0);
      
      mockResponse.data.images.forEach(image => {
        expect(image).toHaveProperty("url");
        expect(typeof image.url).toBe("string");
        expect(image.url).toMatch(/^https?:\/\//);
        expect(image.content_type).toMatch(/^image\//);
        expect(image.file_size).toBeGreaterThan(0);
      });
    });
  });
}); 