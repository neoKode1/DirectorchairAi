import type { QueueStatus, RequestLog } from "@fal-ai/client";

export interface FluxDevInput {
  prompt: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_images?: number;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface FluxDevOutput {
  images: Array<{
    url: string;
    seed?: number;
    nsfw_content_detected?: boolean;
  }>;
}

export const handleQueueUpdate = (status: QueueStatus) => {
  if (status.status === "IN_PROGRESS" && status.logs) {
    status.logs.forEach((log: RequestLog) => {
      console.log(log.message);
    });
  }
}; 