export const LUMA_MODELS = {
  RAY2: {
    id: "fal-ai/luma-ray-2",
    name: "Ray2",
    description: "Latest version of Luma's text-to-video model with improved quality and motion control",
    category: "video",
    defaultParams: {
      num_frames: 16,
      width: 512,
      height: 512,
      fps: 8,
      motion_scale: 1.0,
      guidance_scale: 7.5,
      num_inference_steps: 50,
      negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus"
    },
    limits: {
      num_frames: { min: 8, max: 50 },
      width: { min: 256, max: 1024, step: 64 },
      height: { min: 256, max: 1024, step: 64 },
      fps: { min: 1, max: 30 },
      motion_scale: { min: 0.1, max: 3.0, step: 0.1 },
      guidance_scale: { min: 1, max: 20, step: 0.5 },
      num_inference_steps: { min: 10, max: 150 }
    }
  },
  RAY1_6: {
    id: "fal-ai/luma-ray-1.6",
    name: "Ray1.6",
    description: "Stable version of Luma's text-to-video model with good balance of speed and quality",
    category: "video",
    defaultParams: {
      num_frames: 16,
      width: 512,
      height: 512,
      fps: 8,
      motion_scale: 1.0,
      guidance_scale: 7.5,
      num_inference_steps: 50,
      negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus"
    },
    limits: {
      num_frames: { min: 8, max: 50 },
      width: { min: 256, max: 1024, step: 64 },
      height: { min: 256, max: 1024, step: 64 },
      fps: { min: 1, max: 30 },
      motion_scale: { min: 0.1, max: 3.0, step: 0.1 },
      guidance_scale: { min: 1, max: 20, step: 0.5 },
      num_inference_steps: { min: 10, max: 150 }
    }
  }
};

export interface LumaModelParams {
  prompt: string;
  negative_prompt?: string;
  image_url?: string;
  seed?: number;
  num_frames: number;
  width: number;
  height: number;
  fps: number;
  motion_scale: number;
  guidance_scale: number;
  num_inference_steps: number;
}

export interface LumaModelLimits {
  min: number;
  max: number;
  step?: number;
}

export interface LumaModel {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultParams: Partial<LumaModelParams>;
  limits: {
    [K in keyof Omit<LumaModelParams, "prompt" | "negative_prompt" | "image_url" | "seed">]: LumaModelLimits;
  };
}

export function validateLumaParams(params: LumaModelParams, model: LumaModel): string | null {
  if (!params.prompt) {
    return "Prompt is required";
  }

  for (const [key, limits] of Object.entries(model.limits)) {
    const value = params[key as keyof LumaModelParams];
    if (typeof value === "number") {
      if (value < limits.min || value > limits.max) {
        return `${key} must be between ${limits.min} and ${limits.max}`;
      }
      if (limits.step && value % limits.step !== 0) {
        return `${key} must be a multiple of ${limits.step}`;
      }
    }
  }

  return null;
}

export function getDefaultLumaParams(model: LumaModel): LumaModelParams {
  return {
    prompt: "",
    ...model.defaultParams,
    seed: Math.floor(Math.random() * 1000000)
  } as LumaModelParams;
} 