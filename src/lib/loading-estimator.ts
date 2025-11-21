// Loading estimator for AI generation models
// Based on timing data from FAL AI platform

export interface ModelTimingData {
  model: string;
  averageExecutionTime: number; // in seconds
  minTime: number;
  maxTime: number;
  category: 'video' | 'image';
}

// Timing data based on actual FAL AI measurements
export const MODEL_TIMING_DATA: Record<string, ModelTimingData> = {
  'fal-ai/sora-2/image-to-video': {
    model: 'fal-ai/sora-2/image-to-video',
    averageExecutionTime: 133, // 2 minutes 13 seconds (actual measurement)
    minTime: 100,
    maxTime: 200,
    category: 'video'
  },
  'fal-ai/sora-2/image-to-video/pro': {
    model: 'fal-ai/sora-2/image-to-video/pro',
    averageExecutionTime: 150, // Estimated slightly longer for pro (higher quality)
    minTime: 120,
    maxTime: 250,
    category: 'video'
  },
  'fal-ai/veo3/image-to-video': {
    model: 'fal-ai/veo3/image-to-video',
    averageExecutionTime: 66, // 1 minute 6 seconds
    minTime: 50,
    maxTime: 90,
    category: 'video'
  },
  'fal-ai/kling-video/v2.1/master/image-to-video': {
    model: 'fal-ai/kling-video/v2.1/master/image-to-video',
    averageExecutionTime: 179, // 2 minutes 59 seconds (actual measurement)
    minTime: 150,
    maxTime: 250,
    category: 'video'
  },
  'fal-ai/minimax/hailuo-02/standard/image-to-video': {
    model: 'fal-ai/minimax/hailuo-02/standard/image-to-video',
    averageExecutionTime: 126, // 2 minutes 6 seconds (actual measurement)
    minTime: 100,
    maxTime: 180,
    category: 'video'
  },
  'fal-ai/flux-pro': {
    model: 'fal-ai/flux-pro',
    averageExecutionTime: 45, // Estimated for high-quality images
    minTime: 30,
    maxTime: 60,
    category: 'image'
  },
  'fal-ai/nano-banana/edit': {
    model: 'fal-ai/nano-banana/edit',
    averageExecutionTime: 25, // Estimated for image editing
    minTime: 15,
    maxTime: 40,
    category: 'image'
  },
  'fal-ai/nano-banana-pro/edit': {
    model: 'fal-ai/nano-banana-pro/edit',
    averageExecutionTime: 28, // Slightly higher due to enhanced fidelity
    minTime: 18,
    maxTime: 45,
    category: 'image'
  },
  'fal-ai/veo3.1/fast/first-last-frame-to-video': {
    model: 'fal-ai/veo3.1/fast/first-last-frame-to-video',
    averageExecutionTime: 80, // Based on observed queue times for Veo 3.1 Fast video jobs
    minTime: 60,
    maxTime: 120,
    category: 'video'
  }
};

export class LoadingEstimator {
  private startTime: number;
  private modelTiming: ModelTimingData;
  private lastProgress: number = 0;

  constructor(model: string) {
    this.startTime = Date.now();
    this.modelTiming = MODEL_TIMING_DATA[model] || {
      model,
      averageExecutionTime: 60, // Default fallback
      minTime: 30,
      maxTime: 120,
      category: 'image'
    };
  }

  /**
   * Calculate progress percentage based on elapsed time and model timing data
   */
  getProgress(): number {
    const elapsed = (Date.now() - this.startTime) / 1000; // Convert to seconds
    
    // Phase 1: Initial setup (0-2 seconds) - 0-5%
    if (elapsed < 2) {
      return Math.min(5, (elapsed / 2) * 5);
    }
    
    // Phase 2: Execution phase (2+ seconds) - 5-95%
    const executionElapsed = elapsed - 2;
    const expectedExecutionTime = this.modelTiming.averageExecutionTime - 2; // Subtract setup time
    
    if (executionElapsed <= 0) {
      return 5;
    }
    
    // Use a logarithmic curve for more realistic progress
    // This gives faster initial progress and slower progress near completion
    const progressRatio = Math.min(executionElapsed / expectedExecutionTime, 1);
    const logarithmicProgress = Math.log(1 + progressRatio * 9) / Math.log(10); // 0 to 1
    
    const progress = 5 + (logarithmicProgress * 90); // 5% to 95%
    
    // Ensure progress never goes backwards
    this.lastProgress = Math.max(this.lastProgress, progress);
    
    return Math.min(this.lastProgress, 95); // Cap at 95% until completion
  }

  /**
   * Get estimated time remaining in seconds
   */
  getEstimatedTimeRemaining(): number {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const expectedTotal = this.modelTiming.averageExecutionTime;
    
    if (elapsed >= expectedTotal) {
      return 0;
    }
    
    return Math.max(0, expectedTotal - elapsed);
  }

  /**
   * Get status message based on current progress
   */
  getStatusMessage(): string {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const progress = this.getProgress();
    
    if (progress < 5) {
      return 'Initializing generation...';
    } else if (progress < 20) {
      return 'Starting AI model...';
    } else if (progress < 50) {
      return 'Processing your request...';
    } else if (progress < 80) {
      return 'Generating content...';
    } else if (progress < 95) {
      return 'Finalizing output...';
    } else {
      return 'Almost complete...';
    }
  }

  /**
   * Check if generation should be considered "stuck" (taking too long)
   */
  isStuck(): boolean {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return elapsed > this.modelTiming.maxTime;
  }

  /**
   * Get model-specific timing info
   */
  getModelInfo(): ModelTimingData {
    return this.modelTiming;
  }
}

// Helper function to create estimator for a model
export function createLoadingEstimator(model: string): LoadingEstimator {
  return new LoadingEstimator(model);
}
