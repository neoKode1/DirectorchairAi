import type { EndpointType } from "@fal-ai/client";

export type ImageSize = 
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export interface ImageData {
  url: string;
  seed?: number;
  nsfw_content_detected?: boolean;
}

export interface ImageResult {
  images: ImageData[];
}

export interface FluxInput {
  prompt: string;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: string;
  output_format?: string;
  aspect_ratio?: string;
  image_size?: ImageSize;
  finetune_id?: string;
  finetune_strength?: number;
  style?: string;
  colors?: string[];
}

export interface FluxOutput extends EndpointType {
  data: ImageResult;
}