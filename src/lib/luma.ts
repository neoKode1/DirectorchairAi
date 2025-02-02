export interface LumaConfig {
  apiKey: string;
}

export interface LumaVideoRequest {
  prompt: string;
  generation_type: "video";
  model?: "ray-2";
  resolution?: "720p";
  duration?: string;
  aspect_ratio?: string;
  loop?: boolean;
  keyframes?: {
    frame0?: {
      type: "image" | "generation";
      url?: string;
      id?: string;
    };
    frame1?: {
      type: "image" | "generation";
      url?: string;
      id?: string;
    };
  };
  callback_url?: string;
}

export interface LumaImageRequest {
  prompt: string;
  generation_type: "image";
  model?: "photon-1" | "photon-flash-1";
  aspect_ratio?: string;
  image_ref?: Array<{
    url: string;
    weight: number;
  }>;
  style_ref?: Array<{
    url: string;
    weight: number;
  }>;
  character_ref?: {
    [key: string]: {
      images: string[];
    };
  };
  modify_image_ref?: {
    url: string;
    weight: number;
  };
  callback_url?: string;
}

export interface LumaResponse {
  id: string;
  generation_type: "video" | "image";
  state: "queued" | "processing" | "completed" | "failed" | "dreaming";
  failure_reason: string | null;
  created_at: string;
  assets: {
    video?: string;
    thumbnail?: string;
    image?: string;
  } | null;
  model: string;
  request: {
    generation_type: "video" | "image";
    prompt: string;
    aspect_ratio?: string;
    loop?: boolean;
    keyframes?: Record<string, { type: "image"; url: string }> | null;
    callback_url?: string | null;
    model: string;
    resolution?: string;
    duration?: string;
    negative_prompt?: string;
    seed?: number;
    num_steps?: number;
    guidance_scale?: number;
    image_url?: string;
    image_ref?: Array<{ url: string; weight: number }>;
    style_ref?: Array<{ url: string; weight: number }>;
    character_ref?: { identity0: { images: string[] } };
    modify_image_ref?: { url: string; weight: number };
  };
}

export class LumaClient {
  private apiKey: string;
  private baseUrl = "https://api.lumalabs.ai/dream-machine/v1";

  constructor(config: LumaConfig) {
    this.apiKey = config.apiKey;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async generateVideo(request: LumaVideoRequest): Promise<LumaResponse> {
    if (request.duration && !request.duration.endsWith('s')) {
      request.duration = `${request.duration}s`;
    }

    return this.fetch("/generations", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        model: request.model || "ray-2", // Default to ray-2
        resolution: request.resolution || "720p", // Default to 720p
        generation_type: "video", // Ensure generation_type is set
      }),
    });
  }

  async generateImage(request: LumaImageRequest): Promise<LumaResponse> {
    return this.fetch("/generations", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        model: request.model || "photon-1", // Default to photon-1
        generation_type: "image", // Ensure generation_type is set
      }),
    });
  }

  async getGeneration(id: string): Promise<LumaResponse> {
    return this.fetch(`/generations/${id}`);
  }

  async listGenerations(params?: { limit?: number; offset?: number }): Promise<LumaResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    return this.fetch(`/generations?${queryParams.toString()}`);
  }

  async deleteGeneration(id: string): Promise<void> {
    return this.fetch(`/generations/${id}`, {
      method: "DELETE",
    });
  }

  async listCameraMotions(): Promise<string[]> {
    return this.fetch("/generations/camera_motion/list");
  }

  async uploadFile(file: File): Promise<string> {
    throw new Error("File upload not implemented - Luma requires you to use your own CDN");
  }
}

export const luma = new LumaClient({
  apiKey: process.env.LUMAAI_API_KEY || "",
}); 