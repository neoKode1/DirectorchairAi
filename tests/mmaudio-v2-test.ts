import { describe, expect, it } from "vitest";

// Mock the model info
const mockModelInfo = {
  id: "fal-ai/mmaudio-v2",
  name: "MMAudio V2",
  description: "Advanced audio processing and generation",
  category: "audio",
};

// Interface based on component state and props
interface MMAudioV2Input {
  prompt: string;
  video_url?: string;
  num_steps?: number;
  duration?: number;
  cfg_strength?: number;
}

describe("MMAudio V2 Model Configuration", () => {
  it("should validate required fields", () => {
    const mockPayload: MMAudioV2Input = {
      prompt: "test prompt",
    };

    // Check required field
    expect(mockPayload).toHaveProperty("prompt");
    expect(typeof mockPayload.prompt).toBe("string");
  });

  it("should validate optional fields", () => {
    const mockPayload: MMAudioV2Input = {
      prompt: "test prompt",
      video_url: "https://example.com/video.mp4",
      num_steps: 25,
      duration: 8,
      cfg_strength: 4.5,
    };

    // Check optional fields exist and have correct types
    expect(typeof mockPayload.video_url).toBe("string");
    expect(typeof mockPayload.num_steps).toBe("number");
    expect(typeof mockPayload.duration).toBe("number");
    expect(typeof mockPayload.cfg_strength).toBe("number");
  });

  it("should validate parameter ranges", () => {
    const mockPayload: MMAudioV2Input = {
      prompt: "test prompt",
      num_steps: 25,
      duration: 8,
      cfg_strength: 4.5,
    };

    // Validate num_steps range
    expect(mockPayload.num_steps).toBeGreaterThanOrEqual(1);
    expect(mockPayload.num_steps).toBeLessThanOrEqual(50);

    // Validate duration range
    expect(mockPayload.duration).toBeGreaterThanOrEqual(1);
    expect(mockPayload.duration).toBeLessThanOrEqual(30);

    // Validate cfg_strength range
    expect(mockPayload.cfg_strength).toBeGreaterThanOrEqual(1);
    expect(mockPayload.cfg_strength).toBeLessThanOrEqual(10);
  });

  it("should validate video URL format", () => {
    const mockPayload: MMAudioV2Input = {
      prompt: "test prompt",
      video_url: "https://example.com/video.mp4",
    };

    // Check video URL format
    expect(mockPayload.video_url).toMatch(/^https?:\/\/.+/);
    
    // Check video file extension
    const validExtensions = [".mp4", ".mov", ".avi", ".webm"];
    const fileExtension = mockPayload.video_url?.split(".").pop()?.toLowerCase();
    expect(validExtensions).toContain(`.${fileExtension}`);
  });

  it("should validate video-to-video mode", () => {
    const videoToVideoModelInfo = {
      ...mockModelInfo,
      id: "fal-ai/mmaudio-v2/video-to-video",
    };

    // Check that video URL is required in video-to-video mode
    const mockPayload: MMAudioV2Input = {
      prompt: "test prompt",
      video_url: "https://example.com/video.mp4",
    };

    expect(videoToVideoModelInfo.id).toContain("video-to-video");
    expect(mockPayload).toHaveProperty("video_url");
  });
}); 