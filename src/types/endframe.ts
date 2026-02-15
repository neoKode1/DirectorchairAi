// EndFrame API Types for DirectorChair
export interface EndFrameRequest {
  firstImage: string; // base64 encoded first image (start frame)
  secondImage: string; // base64 encoded second image (end frame)
  prompt: string; // description of the transition
  model?: string; // model to use (default: MiniMax-Hailuo-02)
}

export interface EndFrameResponse {
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  status?: string;
  error?: string;
  retryable?: boolean;
}

export interface EndFrameProcessingState {
  isProcessing: boolean;
  taskId?: string;
  status?: string;
  progress?: number;
  error?: string;
}

