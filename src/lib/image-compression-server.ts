/**
 * Server-side image compression utilities using Node.js APIs
 * This version works in server environments without browser APIs
 */

import sharp from 'sharp';

export interface ServerCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export interface ServerCompressionResult {
  compressedBuffer: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  mimeType: string;
}

/**
 * Compress an image buffer using Sharp (server-side)
 */
export async function compressImageBuffer(
  imageBuffer: Buffer,
  options: ServerCompressionOptions = {}
): Promise<ServerCompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    maxSizeKB = 1024
  } = options;

  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const originalSize = imageBuffer.length;
    
    // Calculate new dimensions while maintaining aspect ratio
    let { width, height } = metadata;
    if (!width || !height) {
      throw new Error('Unable to determine image dimensions');
    }

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    // Compress the image
    let compressedBuffer = await sharp(imageBuffer)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true 
      })
      .toBuffer();

    // If still too large, reduce quality further
    let currentQuality = quality;
    while (compressedBuffer.length > maxSizeKB * 1024 && currentQuality > 10) {
      currentQuality -= 10;
      compressedBuffer = await sharp(imageBuffer)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: currentQuality,
          progressive: true,
          mozjpeg: true 
        })
        .toBuffer();
    }

    // If still too large, reduce dimensions
    if (compressedBuffer.length > maxSizeKB * 1024) {
      const sizeReduction = Math.sqrt((maxSizeKB * 1024) / compressedBuffer.length);
      const newWidth = Math.floor(width * sizeReduction);
      const newHeight = Math.floor(height * sizeReduction);
      
      compressedBuffer = await sharp(imageBuffer)
        .resize(newWidth, newHeight, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 70,
          progressive: true,
          mozjpeg: true 
        })
        .toBuffer();
    }

    return {
      compressedBuffer,
      originalSize,
      compressedSize: compressedBuffer.length,
      compressionRatio: compressedBuffer.length / originalSize,
      mimeType: 'image/jpeg'
    };

  } catch (error) {
    throw new Error(`Server-side image compression failed: ${error}`);
  }
}

/**
 * Convert image buffer to base64 data URI
 */
export function bufferToDataUri(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Download and compress image from URL (server-side)
 */
export async function compressImageFromUrl(
  imageUrl: string,
  options: ServerCompressionOptions = {}
): Promise<ServerCompressionResult> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    return await compressImageBuffer(imageBuffer, options);

  } catch (error) {
    throw new Error(`Failed to compress image from URL: ${error}`);
  }
}

/**
 * Compress a base64 data URI (server-side)
 */
export async function compressBase64DataUri(
  dataUri: string,
  options: ServerCompressionOptions = {}
): Promise<ServerCompressionResult> {
  try {
    // Extract base64 data from data URI
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URI format');
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    return await compressImageBuffer(imageBuffer, options);

  } catch (error) {
    throw new Error(`Failed to compress base64 data URI: ${error}`);
  }
}

/**
 * Get optimal compression options based on image size
 */
export function getOptimalCompressionOptions(
  imageSize: number,
  imageType: string = 'image/jpeg'
): ServerCompressionOptions {
  const sizeMB = imageSize / (1024 * 1024);
  
  if (sizeMB > 5) {
    return {
      maxWidth: 1280,
      maxHeight: 720,
      quality: 60,
      maxSizeKB: 512
    };
  } else if (sizeMB > 2) {
    return {
      maxWidth: 1600,
      maxHeight: 900,
      quality: 70,
      maxSizeKB: 768
    };
  } else {
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 80,
      maxSizeKB: 1024
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
