// Import sharp with fallback handling
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('⚠️ [ImageCompression] Sharp not available, using fallback compression');
  sharp = null;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maxSizeBytes?: number;
}

export interface CompressionResult {
  buffer: Buffer;
  size: number;
  format: string;
  width: number;
  height: number;
  compressed: boolean;
  originalSize: number;
}

const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  format: 'jpeg',
  maxSizeBytes: 5 * 1024 * 1024 // 5MB limit for FAL API
};

/**
 * Compress an image buffer to reduce file size while maintaining quality
 * This is specifically designed to prevent HTTP 413 errors with FAL API
 */
export async function compressImage(
  inputBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  // Use fallback if Sharp is not available
  if (!sharp) {
    console.warn('⚠️ [ImageCompression] Sharp not available, using fallback compression');
    const originalSize = inputBuffer.length;
    return {
      buffer: inputBuffer,
      size: originalSize,
      format: 'unknown',
      width: 0,
      height: 0,
      compressed: false,
      originalSize
    };
  }

  const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };
  
  try {
    console.log('🗜️ [ImageCompression] Starting compression with options:', opts);
    
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    const originalSize = inputBuffer.length;
    
    console.log('🗜️ [ImageCompression] Original image:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: originalSize,
      sizeMB: (originalSize / 1024 / 1024).toFixed(2)
    });

    // If image is already small enough, return as-is
    if (originalSize <= (opts.maxSizeBytes || DEFAULT_COMPRESSION_OPTIONS.maxSizeBytes!)) {
      console.log('🗜️ [ImageCompression] Image already within size limit, no compression needed');
      return {
        buffer: inputBuffer,
        size: originalSize,
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        compressed: false,
        originalSize
      };
    }

    // Calculate new dimensions while maintaining aspect ratio
    let newWidth = metadata.width || 1920;
    let newHeight = metadata.height || 1920;
    
    if (newWidth > (opts.maxWidth || DEFAULT_COMPRESSION_OPTIONS.maxWidth!)) {
      const ratio = (opts.maxWidth || DEFAULT_COMPRESSION_OPTIONS.maxWidth!) / newWidth;
      newWidth = opts.maxWidth || DEFAULT_COMPRESSION_OPTIONS.maxWidth!;
      newHeight = Math.round(newHeight * ratio);
    }
    
    if (newHeight > (opts.maxHeight || DEFAULT_COMPRESSION_OPTIONS.maxHeight!)) {
      const ratio = (opts.maxHeight || DEFAULT_COMPRESSION_OPTIONS.maxHeight!) / newHeight;
      newHeight = opts.maxHeight || DEFAULT_COMPRESSION_OPTIONS.maxHeight!;
      newWidth = Math.round(newWidth * ratio);
    }

    console.log('🗜️ [ImageCompression] Resizing to:', { width: newWidth, height: newHeight });

    // Start with the base transformation
    let sharpInstance = sharp(inputBuffer)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Apply format-specific compression
    switch (opts.format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: opts.quality,
          progressive: true,
          mozjpeg: true // Use mozjpeg for better compression
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality: opts.quality,
          progressive: true,
          compressionLevel: 9
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: opts.quality,
          effort: 6 // Higher effort for better compression
        });
        break;
    }

    // Apply compression
    let compressedBuffer = await sharpInstance.toBuffer();
    let currentQuality = opts.quality || 85;
    
    // If still too large, reduce quality iteratively
    while (compressedBuffer.length > (opts.maxSizeBytes || DEFAULT_COMPRESSION_OPTIONS.maxSizeBytes!) && currentQuality > 20) {
      currentQuality -= 10;
      console.log(`🗜️ [ImageCompression] Reducing quality to ${currentQuality}% (current size: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
      
      let retryInstance = sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });

      switch (opts.format) {
        case 'jpeg':
          retryInstance = retryInstance.jpeg({ 
            quality: currentQuality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          retryInstance = retryInstance.png({ 
            quality: currentQuality,
            progressive: true,
            compressionLevel: 9
          });
          break;
        case 'webp':
          retryInstance = retryInstance.webp({ 
            quality: currentQuality,
            effort: 6
          });
          break;
      }

      compressedBuffer = await retryInstance.toBuffer();
    }

    // If still too large, reduce dimensions further
    if (compressedBuffer.length > (opts.maxSizeBytes || DEFAULT_COMPRESSION_OPTIONS.maxSizeBytes!)) {
      console.log('🗜️ [ImageCompression] Still too large, reducing dimensions further');
      
      newWidth = Math.round(newWidth * 0.8);
      newHeight = Math.round(newHeight * 0.8);
      
      let finalInstance = sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });

      switch (opts.format) {
        case 'jpeg':
          finalInstance = finalInstance.jpeg({ 
            quality: 70,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          finalInstance = finalInstance.png({ 
            quality: 70,
            progressive: true,
            compressionLevel: 9
          });
          break;
        case 'webp':
          finalInstance = finalInstance.webp({ 
            quality: 70,
            effort: 6
          });
          break;
      }

      compressedBuffer = await finalInstance.toBuffer();
    }

    const finalSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
    
    console.log('🗜️ [ImageCompression] Compression complete:', {
      originalSize: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
      finalSize: (finalSize / 1024 / 1024).toFixed(2) + 'MB',
      compressionRatio: compressionRatio + '%',
      finalDimensions: `${newWidth}x${newHeight}`
    });

    return {
      buffer: compressedBuffer,
      size: finalSize,
      format: opts.format || 'jpeg',
      width: newWidth,
      height: newHeight,
      compressed: true,
      originalSize
    };

  } catch (error) {
    console.error('❌ [ImageCompression] Error compressing image:', error);
    // Return original buffer if compression fails
    return {
      buffer: inputBuffer,
      size: inputBuffer.length,
      format: 'unknown',
      width: 0,
      height: 0,
      compressed: false,
      originalSize: inputBuffer.length
    };
  }
}

/**
 * Compress image from URL and return base64 data URI
 * This is the main function used by the FAL API conversion
 */
export async function compressImageFromUrl(
  imageUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  try {
    console.log('🗜️ [ImageCompression] Fetching image from URL:', imageUrl);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    
    // Compress the image
    const result = await compressImage(inputBuffer, options);
    
    // Convert to base64 data URI
    const mimeType = `image/${result.format}`;
    const base64 = result.buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;
    
    console.log('🗜️ [ImageCompression] URL compression completed:', {
      originalSize: result.originalSize,
      compressedSize: result.size,
      reduction: result.compressed ? `${((1 - result.size / result.originalSize) * 100).toFixed(1)}%` : '0% (no compression)'
    });
    
    return dataUri;
    
  } catch (error) {
    console.error('❌ [ImageCompression] Error compressing image from URL:', error);
    throw error;
  }
}

/**
 * Compress a base64 data URI if it's too large
 * This handles images that are already in base64 format from the frontend
 */
export async function compressBase64DataUri(
  dataUri: string,
  options: CompressionOptions = {}
): Promise<string> {
  try {
    console.log('🗜️ [ImageCompression] Processing base64 data URI for compression');
    
    // Extract the base64 data from the data URI
    const base64Match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid data URI format');
    }
    
    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    
    // Convert base64 to buffer
    const inputBuffer = Buffer.from(base64Data, 'base64');
    const originalSize = inputBuffer.length;
    
    console.log('📊 [ImageCompression] Base64 data URI size:', (originalSize / 1024 / 1024).toFixed(2) + 'MB');
    
    // If image is small enough, return as-is
    if (originalSize <= 2 * 1024 * 1024) { // 2MB threshold
      console.log('✅ [ImageCompression] Base64 data URI is small enough, no compression needed');
      return dataUri;
    }
    
    // Compress the image
    const result = await compressImage(inputBuffer, options);
    
    // Convert back to base64 data URI
    const compressedBase64 = result.buffer.toString('base64');
    const compressedDataUri = `data:image/${result.format};base64,${compressedBase64}`;
    
    const compressionRatio = ((originalSize - result.size) / originalSize * 100).toFixed(1);
    console.log('🗜️ [ImageCompression] Base64 data URI compressed:', {
      originalSize: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
      compressedSize: (result.size / 1024 / 1024).toFixed(2) + 'MB',
      compressionRatio: compressionRatio + '%'
    });
    
    return compressedDataUri;
    
  } catch (error) {
    console.error('❌ [ImageCompression] Error compressing base64 data URI:', error);
    // Return original if compression fails
    return dataUri;
  }
}

/**
 * Check if an image needs compression based on size
 */
export function needsCompression(buffer: Buffer, maxSizeBytes: number = 5 * 1024 * 1024): boolean {
  return buffer.length > maxSizeBytes;
}

/**
 * Get optimal compression options based on image size and type
 */
export function getOptimalCompressionOptions(originalSize: number): CompressionOptions {
  if (originalSize > 10 * 1024 * 1024) { // > 10MB
    return {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 75,
      format: 'jpeg',
      maxSizeBytes: 3 * 1024 * 1024 // 3MB target
    };
  } else if (originalSize > 5 * 1024 * 1024) { // > 5MB
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 80,
      format: 'jpeg',
      maxSizeBytes: 4 * 1024 * 1024 // 4MB target
    };
  } else {
    return {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 85,
      format: 'jpeg',
      maxSizeBytes: 5 * 1024 * 1024 // 5MB target
    };
  }
}
