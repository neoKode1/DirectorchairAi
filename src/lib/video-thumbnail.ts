/**
 * Video thumbnail extraction utilities
 * Uses the FFmpeg frame extraction API to generate thumbnails from videos
 */

export interface VideoThumbnailOptions {
  videoUrl: string;
  frameType?: 'first' | 'middle' | 'last';
}

export interface VideoThumbnailResult {
  success: boolean;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * Extracts a frame from a video using the FFmpeg API
 */
export async function extractVideoThumbnail(
  options: VideoThumbnailOptions
): Promise<VideoThumbnailResult> {
  const { videoUrl, frameType = 'last' } = options;

  try {
    if (!videoUrl || !videoUrl.startsWith('http')) {
      throw new Error(`Invalid video URL: ${videoUrl}`);
    }

    const response = await fetch('/api/fal/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'fal-ai/ffmpeg-api/extract-frame',
        prompt: 'Extract frame from video',
        video_url: videoUrl,
        frame_type: frameType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Frame extraction API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      const imageUrl = result.data.images?.[0]?.url || result.data.image?.url || result.data.url;
      if (imageUrl) {
        return { success: true, thumbnailUrl: imageUrl };
      }
    }

    throw new Error(result.error || 'Frame extraction failed - no image URL returned');
  } catch (error) {
    console.error('❌ [VideoThumbnail] Frame extraction failed:', error instanceof Error ? error.message : error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Extracts thumbnail and caches it in localStorage.
 * Returns the cached thumbnail if already extracted.
 */
export async function getVideoThumbnailWithCache(
  videoUrl: string,
  frameType: 'first' | 'middle' | 'last' = 'last'
): Promise<string | null> {
  try {
    const cacheKey = `video_thumbnail_${frameType}_${btoa(videoUrl).substring(0, 20)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    const result = await extractVideoThumbnail({ videoUrl, frameType });

    if (result.success && result.thumbnailUrl) {
      try {
        localStorage.setItem(cacheKey, result.thumbnailUrl);
      } catch {
        // localStorage full — continue without caching
      }
      return result.thumbnailUrl;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Downloads a video with its last frame as two separate files
 */
export async function downloadVideoWithFrame(
  videoUrl: string,
  videoTitle: string,
  extractFrameType: 'first' | 'middle' | 'last' = 'last'
): Promise<void> {
  const cleanTitle = sanitizeFilename(videoTitle);

  // Extract frame
  const frameResult = await extractVideoThumbnail({ videoUrl, frameType: extractFrameType });
  if (!frameResult.success || !frameResult.thumbnailUrl) {
    throw new Error(`Failed to extract video frame: ${frameResult.error}`);
  }

  // Download video blob
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.status}`);
  }
  const videoBlob = await videoResponse.blob();

  // Download frame blob
  const frameResponse = await fetch(frameResult.thumbnailUrl);
  if (!frameResponse.ok) {
    throw new Error(`Failed to download frame: ${frameResponse.status}`);
  }
  const frameBlob = await frameResponse.blob();

  const videoExtension = getFileExtension(videoUrl) || 'mp4';
  const frameExtension = getFileExtension(frameResult.thumbnailUrl) || 'jpg';

  // Trigger video download
  triggerBlobDownload(videoBlob, `${cleanTitle}.${videoExtension}`);

  // Trigger frame download with slight delay to avoid browser blocking
  setTimeout(() => {
    triggerBlobDownload(frameBlob, `${cleanTitle}_${extractFrameType}_frame.${frameExtension}`);
  }, 500);
}

/** Triggers a browser file download from a Blob */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

/** Gets file extension from URL */
function getFileExtension(url: string): string | null {
  const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : null;
}

/** Sanitizes filename for safe filesystem usage */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

/**
 * Downloads just the video file (simple download)
 */
export async function downloadVideo(videoUrl: string, videoTitle: string): Promise<void> {
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }
  const blob = await response.blob();
  const extension = getFileExtension(videoUrl) || 'mp4';
  triggerBlobDownload(blob, `${sanitizeFilename(videoTitle)}.${extension}`);
}

/**
 * Clears all cached video thumbnails from localStorage
 */
export function clearVideoThumbnailCache(): void {
  try {
    const thumbnailKeys = Object.keys(localStorage).filter(k => k.startsWith('video_thumbnail_'));
    thumbnailKeys.forEach(key => localStorage.removeItem(key));
  } catch {
    // localStorage unavailable — silently ignore
  }
}
