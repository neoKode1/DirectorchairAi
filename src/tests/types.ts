import type { QueueStatus, RequestLog, Result } from "@fal-ai/client";

// Common types
export type ImageSize = "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";

// Base interfaces
export interface BaseInput {
  prompt: string;
  pollInterval?: number;
}

export interface BaseOutput {
  data: any;
  status: string;
}

// Image Generation Types
export interface ImageGenerationInput extends BaseInput {
  image_size?: ImageSize;
  num_images?: number;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  enable_safety_checker?: boolean;
}

export interface ImageGenerationOutput {
  images: Array<{
    url: string;
    seed?: number;
    nsfw_content_detected?: boolean;
  }>;
}

// Audio Model Types
export interface AudioModelInput extends BaseInput {
  video_url?: string;
  audio_url?: string;
  model?: string;
  negative_prompt?: string;
  num_steps?: number;
  duration?: number;
  cfg_strength?: number;
  mask_away_clip?: boolean;
}

export interface AudioModelOutput {
  audio?: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  video?: {
    url: string;
  };
}

// Ray2 Types
export interface Ray2Input extends BaseInput {
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
}

export interface Ray2Output {
  images: Array<{
    url: string;
    seed?: number;
  }>;
}

// Metadata Types
export interface MetadataInput {
  url: string;
}

export interface MetadataOutput {
  format: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  size?: number;
}

// Helper function for queue updates
export function handleQueueUpdate(status: QueueStatus): void {
  if (status.status === "IN_PROGRESS" && status.logs) {
    status.logs.forEach((log: RequestLog) => {
      console.log(log.message);
    });
  }
}

// Base types for all tests
export interface BaseModelInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface BaseTestInput {
  pollInterval?: number;
}

export interface BaseTestOutput {
  status: string;
  message?: string;
}

// Common test function type
export type TestFunction = () => Promise<void>;

// Image Models
export interface ImageModelInput extends BaseTestInput {
  prompt: string;
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
  enable_safety_checker?: boolean;
  image_size?: ImageSize;
  num_images?: number;
  seed?: number;
}

export interface ImageModelOutput {
  images: Array<{
    url: string;
    seed?: number;
    nsfw_content_detected?: boolean;
  }>;
}

// Video Models
export interface VideoModelInput extends BaseTestInput {
  prompt: string;
  image_url?: string;
  negative_prompt?: string;
  num_frames?: number | string;
  fps?: number;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  duration?: string;
  aspect_ratio?: string;
  resolution?: string;
  enable_safety_checker?: boolean;
  pro_mode?: boolean;
}

export interface VideoModelOutput {
  video: {
    url: string;
  };
}

// Training Models
export interface TrainingModelInput extends BaseTestInput {
  images_data_url: string[];
  steps: number;
  trigger_word: string;
  learning_rate?: number;
  do_caption?: boolean;
  create_masks?: boolean;
  is_style?: boolean;
  is_input_format_already_preprocessed?: boolean;
}

export interface TrainingModelOutput {
  diffusers_lora_file?: {
    url: string;
  };
  config_file?: {
    url: string;
  };
}

export interface FFmpegInput extends BaseTestInput {
  video_url: string;
  command: string;
}

export interface FFmpegOutput {
  video: {
    url: string;
  };
} 