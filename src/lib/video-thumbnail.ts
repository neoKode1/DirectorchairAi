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
    console.log('🎬 [VideoThumbnail] Extracting frame from video:', {
      videoUrl: videoUrl.substring(0, 100) + '...',
      frameType
    });

    // Call the FFmpeg frame extraction API
    const response = await fetch('/api/fal/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'fal-ai/ffmpeg-api/extract-frame',
        prompt: 'Extract frame from video', // Required by FAL API
        video_url: videoUrl,
        frame_type: frameType
      })
    });

    if (!response.ok) {
      throw new Error(`Frame extraction API failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('🎬 [VideoThumbnail] Frame extraction result:', result);

    if (result.success && result.data) {
      // FFmpeg extract frame returns images array
      const imageUrl = result.data.images?.[0]?.url || result.data.image?.url || result.data.url;
      
      if (imageUrl) {
        return {
          success: true,
          thumbnailUrl: imageUrl
        };
      }
    }
    
    throw new Error(result.error || 'Frame extraction failed - no image URL returned');
  } catch (error) {
    console.error('❌ [VideoThumbnail] Failed to extract video thumbnail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extracts thumbnail and caches it for a video URL
 * Returns the cached thumbnail if already extracted
 */
export async function getVideoThumbnailWithCache(
  videoUrl: string,
  frameType: 'first' | 'middle' | 'last' = 'last'
): Promise<string | null> {
  const cacheKey = `video_thumbnail_${frameType}_${btoa(videoUrl).substring(0, 20)}`;
  
  // Check if thumbnail is already cached
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log('🎬 [VideoThumbnail] Using cached thumbnail for video');
    return cached;
  }

  // Extract new thumbnail
  const result = await extractVideoThumbnail({ videoUrl, frameType });
  
  if (result.success && result.thumbnailUrl) {
    // Cache the thumbnail
    try {
      localStorage.setItem(cacheKey, result.thumbnailUrl);
      console.log('🎬 [VideoThumbnail] Cached new thumbnail for video');
    } catch (error) {
      console.warn('⚠️ [VideoThumbnail] Failed to cache thumbnail (localStorage full?):', error);
    }
    
    return result.thumbnailUrl;
  }

  return null;
}

/**
 * Downloads a video with its last frame as two separate files
 */
export async function downloadVideoWithFrame(
  videoUrl: string,
  videoTitle: string,
  extractFrameType: 'first' | 'middle' | 'last' = 'last'
): Promise<void> {
  try {
    console.log('📥 [VideoThumbnail] Starting video + frame download for:', videoTitle);

    // Clean filename
    const cleanTitle = sanitizeFilename(videoTitle);
    
    // Extract frame first
    console.log('🎬 [VideoThumbnail] Extracting frame...');
    const frameResult = await extractVideoThumbnail({ videoUrl, frameType: extractFrameType });
    
    if (!frameResult.success || !frameResult.thumbnailUrl) {
      throw new Error('Failed to extract video frame');
    }
    
    // Download video
    console.log('📥 [VideoThumbnail] Downloading video...');
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status}`);
    }
    const videoBlob = await videoResponse.blob();
    
    // Download frame
    console.log('📥 [VideoThumbnail] Downloading frame...');
    const frameResponse = await fetch(frameResult.thumbnailUrl);
    if (!frameResponse.ok) {
      throw new Error(`Failed to download frame: ${frameResponse.status}`);
    }
    const frameBlob = await frameResponse.blob();
    
    // Determine file extensions
    const videoExtension = getFileExtension(videoUrl) || 'mp4';
    const frameExtension = getFileExtension(frameResult.thumbnailUrl) || 'jpg';
    
    // Download video file
    const videoDownloadUrl = window.URL.createObjectURL(videoBlob);
    const videoLink = document.createElement('a');
    videoLink.href = videoDownloadUrl;
    videoLink.download = `${cleanTitle}.${videoExtension}`;
    document.body.appendChild(videoLink);
    videoLink.click();
    
    // Download frame file (with slight delay to avoid browser blocking)
    setTimeout(() => {
      const frameDownloadUrl = window.URL.createObjectURL(frameBlob);
      const frameLink = document.createElement('a');
      frameLink.href = frameDownloadUrl;
      frameLink.download = `${cleanTitle}_${extractFrameType}_frame.${frameExtension}`;
      document.body.appendChild(frameLink);
      frameLink.click();
      
      // Cleanup
      window.URL.revokeObjectURL(frameDownloadUrl);
      document.body.removeChild(frameLink);
    }, 500);
    
    // Cleanup video download
    window.URL.revokeObjectURL(videoDownloadUrl);
    document.body.removeChild(videoLink);
    
    console.log('✅ [VideoThumbnail] Download completed successfully - 2 files downloaded');
    
  } catch (error) {
    console.error('❌ [VideoThumbnail] Download failed:', error);
    throw error;
  }
}

/**
 * Gets file extension from URL
 */
function getFileExtension(url: string): string | null {
  const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Sanitizes filename for safe filesystem usage
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length
}

/**
 * Downloads just the video file (simple download)
 */
export async function downloadVideo(videoUrl: string, videoTitle: string): Promise<void> {
  try {
    console.log('📥 [VideoThumbnail] Downloading video:', videoTitle);
    
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    
    const blob = await response.blob();
    const extension = getFileExtension(videoUrl) || 'mp4';
    const cleanTitle = sanitizeFilename(videoTitle);
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${cleanTitle}.${extension}`;
    document.body.appendChild(link);
    link.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
    
    console.log('✅ [VideoThumbnail] Video download completed');
    
  } catch (error) {
    console.error('❌ [VideoThumbnail] Video download failed:', error);
    throw error;
  }
}

/**
 * Clears all cached video thumbnails
 */
export function clearVideoThumbnailCache(): void {
  const keys = Object.keys(localStorage);
  const thumbnailKeys = keys.filter(key => key.startsWith('video_thumbnail_'));
  
  thumbnailKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`🧹 [VideoThumbnail] Cleared ${thumbnailKeys.length} cached thumbnails`);
}
