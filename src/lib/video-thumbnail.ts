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
  const startTime = Date.now();
  
  try {
    console.log('🎬 [VideoThumbnail] ===== FRAME EXTRACTION START =====');
    console.log('🎬 [VideoThumbnail] Input parameters:', {
      videoUrl: videoUrl.length > 100 ? videoUrl.substring(0, 100) + '...' : videoUrl,
      fullVideoUrl: videoUrl,
      frameType,
      timestamp: new Date().toISOString()
    });

    // Validate inputs
    if (!videoUrl || !videoUrl.startsWith('http')) {
      throw new Error(`Invalid video URL: ${videoUrl}`);
    }

    console.log('🎬 [VideoThumbnail] Preparing API request...');
    const requestBody = {
      model: 'fal-ai/ffmpeg-api/extract-frame',
      prompt: 'Extract frame from video', // Required by FAL API
      video_url: videoUrl,
      frame_type: frameType
    };
    console.log('🎬 [VideoThumbnail] Request body:', requestBody);

    // Call the FFmpeg frame extraction API
    console.log('🎬 [VideoThumbnail] Making API call to /api/fal/image...');
    const response = await fetch('/api/fal/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🎬 [VideoThumbnail] API response status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [VideoThumbnail] API error response:', errorText);
      throw new Error(`Frame extraction API failed: ${response.status} - ${errorText}`);
    }

    console.log('🎬 [VideoThumbnail] Parsing response JSON...');
    const result = await response.json();
    console.log('🎬 [VideoThumbnail] Full API response:', JSON.stringify(result, null, 2));

    // Analyze response structure
    console.log('🎬 [VideoThumbnail] Response analysis:', {
      hasSuccess: 'success' in result,
      successValue: result.success,
      hasData: 'data' in result,
      dataType: typeof result.data,
      dataKeys: result.data ? Object.keys(result.data) : 'N/A'
    });

    if (result.success && result.data) {
      // FFmpeg extract frame returns images array
      const imageUrl = result.data.images?.[0]?.url || result.data.image?.url || result.data.url;
      
      console.log('🎬 [VideoThumbnail] Image URL extraction:', {
        foundInImages: !!result.data.images?.[0]?.url,
        foundInImage: !!result.data.image?.url,
        foundInRoot: !!result.data.url,
        finalImageUrl: imageUrl
      });

      if (imageUrl) {
        const duration = Date.now() - startTime;
        console.log('✅ [VideoThumbnail] Frame extraction successful!', {
          thumbnailUrl: imageUrl.length > 100 ? imageUrl.substring(0, 100) + '...' : imageUrl,
          fullThumbnailUrl: imageUrl,
          duration: `${duration}ms`,
          frameType
        });
        console.log('🎬 [VideoThumbnail] ===== FRAME EXTRACTION SUCCESS =====');
        
        return {
          success: true,
          thumbnailUrl: imageUrl
        };
      }
    }
    
    const errorMsg = result.error || 'Frame extraction failed - no image URL returned';
    console.error('❌ [VideoThumbnail] No valid image URL found in response');
    throw new Error(errorMsg);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [VideoThumbnail] ===== FRAME EXTRACTION FAILED =====');
    console.error('❌ [VideoThumbnail] Error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A',
      duration: `${duration}ms`,
      videoUrl: videoUrl.substring(0, 100) + '...',
      frameType
    });
    
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
  console.log('🎬 [VideoThumbnail] ===== CACHE THUMBNAIL REQUEST =====');
  const startTime = Date.now();
  
  try {
    const cacheKey = `video_thumbnail_${frameType}_${btoa(videoUrl).substring(0, 20)}`;
    console.log('🎬 [VideoThumbnail] Cache operation details:', {
      videoUrl: videoUrl.length > 100 ? videoUrl.substring(0, 100) + '...' : videoUrl,
      frameType,
      cacheKey,
      timestamp: new Date().toISOString()
    });
    
    // Check if thumbnail is already cached
    console.log('🎬 [VideoThumbnail] Checking localStorage cache...');
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const duration = Date.now() - startTime;
      console.log('✅ [VideoThumbnail] Cache HIT! Using cached thumbnail:', {
        cacheKey,
        thumbnailUrl: cached.length > 100 ? cached.substring(0, 100) + '...' : cached,
        duration: `${duration}ms`
      });
      console.log('🎬 [VideoThumbnail] ===== CACHE SUCCESS =====');
      return cached;
    }

    console.log('🎬 [VideoThumbnail] Cache MISS - extracting new thumbnail...');
    
    // Extract new thumbnail
    const result = await extractVideoThumbnail({ videoUrl, frameType });
    
    console.log('🎬 [VideoThumbnail] Extraction result for caching:', {
      success: result.success,
      hasThumbnailUrl: !!result.thumbnailUrl,
      error: result.error || 'none'
    });
    
    if (result.success && result.thumbnailUrl) {
      // Cache the thumbnail
      try {
        console.log('🎬 [VideoThumbnail] Attempting to cache thumbnail...');
        localStorage.setItem(cacheKey, result.thumbnailUrl);
        
        // Verify cache was set
        const verification = localStorage.getItem(cacheKey);
        const isVerified = verification === result.thumbnailUrl;
        
        const duration = Date.now() - startTime;
        console.log('✅ [VideoThumbnail] Thumbnail cached successfully!', {
          cacheKey,
          thumbnailUrl: result.thumbnailUrl.length > 100 ? result.thumbnailUrl.substring(0, 100) + '...' : result.thumbnailUrl,
          verified: isVerified,
          duration: `${duration}ms`,
          cacheSize: new Blob([result.thumbnailUrl]).size + ' bytes'
        });
        console.log('🎬 [VideoThumbnail] ===== CACHE & EXTRACT SUCCESS =====');
      } catch (error) {
        console.warn('⚠️ [VideoThumbnail] Failed to cache thumbnail:', {
          error: error instanceof Error ? error.message : String(error),
          cacheKey,
          thumbnailUrlLength: result.thumbnailUrl.length
        });
        console.warn('⚠️ [VideoThumbnail] Possible localStorage full or quota exceeded');
      }
      
      return result.thumbnailUrl;
    }

    const duration = Date.now() - startTime;
    console.error('❌ [VideoThumbnail] Failed to extract thumbnail for caching:', {
      videoUrl: videoUrl.substring(0, 100) + '...',
      frameType,
      error: result.error,
      duration: `${duration}ms`
    });
    console.log('🎬 [VideoThumbnail] ===== CACHE FAILED =====');
    return null;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [VideoThumbnail] Cache operation failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A',
      duration: `${duration}ms`
    });
    console.log('🎬 [VideoThumbnail] ===== CACHE ERROR =====');
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
  console.log('📥 [VideoThumbnail] ===== DOWNLOAD WITH FRAME START =====');
  const startTime = Date.now();
  
  try {
    console.log('📥 [VideoThumbnail] Download parameters:', {
      videoUrl: videoUrl.length > 100 ? videoUrl.substring(0, 100) + '...' : videoUrl,
      fullVideoUrl: videoUrl,
      videoTitle,
      extractFrameType,
      timestamp: new Date().toISOString()
    });

    // Clean filename
    const cleanTitle = sanitizeFilename(videoTitle);
    console.log('📥 [VideoThumbnail] Sanitized filename:', {
      original: videoTitle,
      sanitized: cleanTitle
    });
    
    // Extract frame first
    console.log('🎬 [VideoThumbnail] Step 1: Extracting frame...');
    const frameStartTime = Date.now();
    const frameResult = await extractVideoThumbnail({ videoUrl, frameType: extractFrameType });
    const frameExtractionDuration = Date.now() - frameStartTime;
    
    console.log('🎬 [VideoThumbnail] Frame extraction completed:', {
      success: frameResult.success,
      duration: `${frameExtractionDuration}ms`,
      hasThumbnailUrl: !!frameResult.thumbnailUrl,
      error: frameResult.error || 'none'
    });
    
    if (!frameResult.success || !frameResult.thumbnailUrl) {
      throw new Error(`Failed to extract video frame: ${frameResult.error}`);
    }
    
    // Download video
    console.log('📥 [VideoThumbnail] Step 2: Downloading video file...');
    const videoDownloadStartTime = Date.now();
    const videoResponse = await fetch(videoUrl);
    
    console.log('📥 [VideoThumbnail] Video download response:', {
      status: videoResponse.status,
      statusText: videoResponse.statusText,
      ok: videoResponse.ok,
      contentType: videoResponse.headers.get('content-type'),
      contentLength: videoResponse.headers.get('content-length')
    });
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status} - ${videoResponse.statusText}`);
    }
    
    const videoBlob = await videoResponse.blob();
    const videoDownloadDuration = Date.now() - videoDownloadStartTime;
    console.log('📥 [VideoThumbnail] Video blob created:', {
      size: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
      type: videoBlob.type,
      duration: `${videoDownloadDuration}ms`
    });
    
    // Download frame
    console.log('📥 [VideoThumbnail] Step 3: Downloading frame image...');
    const frameDownloadStartTime = Date.now();
    const frameResponse = await fetch(frameResult.thumbnailUrl);
    
    console.log('📥 [VideoThumbnail] Frame download response:', {
      status: frameResponse.status,
      statusText: frameResponse.statusText,
      ok: frameResponse.ok,
      contentType: frameResponse.headers.get('content-type'),
      contentLength: frameResponse.headers.get('content-length')
    });
    
    if (!frameResponse.ok) {
      throw new Error(`Failed to download frame: ${frameResponse.status} - ${frameResponse.statusText}`);
    }
    
    const frameBlob = await frameResponse.blob();
    const frameDownloadDuration = Date.now() - frameDownloadStartTime;
    console.log('📥 [VideoThumbnail] Frame blob created:', {
      size: `${(frameBlob.size / 1024).toFixed(2)} KB`,
      type: frameBlob.type,
      duration: `${frameDownloadDuration}ms`
    });
    
    // Determine file extensions
    const videoExtension = getFileExtension(videoUrl) || 'mp4';
    const frameExtension = getFileExtension(frameResult.thumbnailUrl) || 'jpg';
    
    console.log('📥 [VideoThumbnail] File extensions determined:', {
      video: videoExtension,
      frame: frameExtension,
      videoFilename: `${cleanTitle}.${videoExtension}`,
      frameFilename: `${cleanTitle}_${extractFrameType}_frame.${frameExtension}`
    });
    
    // Download video file
    console.log('📥 [VideoThumbnail] Step 4: Triggering video file download...');
    const videoDownloadUrl = window.URL.createObjectURL(videoBlob);
    const videoLink = document.createElement('a');
    videoLink.href = videoDownloadUrl;
    videoLink.download = `${cleanTitle}.${videoExtension}`;
    document.body.appendChild(videoLink);
    videoLink.click();
    
    console.log('📥 [VideoThumbnail] Video download triggered:', {
      filename: videoLink.download,
      blobUrl: videoDownloadUrl.substring(0, 50) + '...'
    });
    
    // Download frame file (with slight delay to avoid browser blocking)
    console.log('📥 [VideoThumbnail] Step 5: Scheduling frame download (500ms delay)...');
    setTimeout(() => {
      console.log('📥 [VideoThumbnail] Triggering frame file download...');
      const frameDownloadUrl = window.URL.createObjectURL(frameBlob);
      const frameLink = document.createElement('a');
      frameLink.href = frameDownloadUrl;
      frameLink.download = `${cleanTitle}_${extractFrameType}_frame.${frameExtension}`;
      document.body.appendChild(frameLink);
      frameLink.click();
      
      console.log('📥 [VideoThumbnail] Frame download triggered:', {
        filename: frameLink.download,
        blobUrl: frameDownloadUrl.substring(0, 50) + '...'
      });
      
      // Cleanup
      window.URL.revokeObjectURL(frameDownloadUrl);
      document.body.removeChild(frameLink);
      console.log('📥 [VideoThumbnail] Frame download cleanup completed');
    }, 500);
    
    // Cleanup video download
    window.URL.revokeObjectURL(videoDownloadUrl);
    document.body.removeChild(videoLink);
    
    const totalDuration = Date.now() - startTime;
    console.log('✅ [VideoThumbnail] Download process completed successfully!', {
      totalDuration: `${totalDuration}ms`,
      frameExtractionTime: `${frameExtractionDuration}ms`,
      videoDownloadTime: `${videoDownloadDuration}ms`,
      frameDownloadTime: `${frameDownloadDuration}ms`,
      filesDownloaded: 2,
      videoSize: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
      frameSize: `${(frameBlob.size / 1024).toFixed(2)} KB`
    });
    console.log('📥 [VideoThumbnail] ===== DOWNLOAD WITH FRAME SUCCESS =====');
    
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ [VideoThumbnail] ===== DOWNLOAD WITH FRAME FAILED =====');
    console.error('❌ [VideoThumbnail] Download error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A',
      duration: `${totalDuration}ms`,
      videoUrl: videoUrl.substring(0, 100) + '...',
      videoTitle,
      extractFrameType
    });
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
  console.log('🧹 [VideoThumbnail] ===== CLEARING THUMBNAIL CACHE =====');
  const startTime = Date.now();
  
  try {
    const keys = Object.keys(localStorage);
    const thumbnailKeys = keys.filter(key => key.startsWith('video_thumbnail_'));
    
    console.log('🧹 [VideoThumbnail] Cache analysis:', {
      totalLocalStorageKeys: keys.length,
      thumbnailKeysFound: thumbnailKeys.length,
      thumbnailKeys: thumbnailKeys.slice(0, 5), // Show first 5 keys
      moreKeys: thumbnailKeys.length > 5 ? `... and ${thumbnailKeys.length - 5} more` : 'none'
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    thumbnailKeys.forEach((key, index) => {
      try {
        localStorage.removeItem(key);
        successCount++;
        if (index < 3) { // Log first few for debugging
          console.log(`🧹 [VideoThumbnail] Removed cache key: ${key}`);
        }
      } catch (error) {
        errorCount++;
        console.warn(`⚠️ [VideoThumbnail] Failed to remove cache key: ${key}`, error);
      }
    });
    
    const duration = Date.now() - startTime;
    console.log('✅ [VideoThumbnail] Cache clearing completed:', {
      totalKeysProcessed: thumbnailKeys.length,
      successfullyRemoved: successCount,
      errors: errorCount,
      duration: `${duration}ms`
    });
    console.log('🧹 [VideoThumbnail] ===== CACHE CLEARING SUCCESS =====');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ [VideoThumbnail] Cache clearing failed:', {
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`
    });
    console.log('🧹 [VideoThumbnail] ===== CACHE CLEARING FAILED =====');
  }
}
