/**
 * Image compression utilities for handling large images
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export interface CompressionResult {
  compressedDataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Compress an image file to reduce its size
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 1024 // 1MB limit
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels if the image is still too large
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        // Check if we need to reduce quality further
        while (getDataUrlSizeKB(dataUrl) > maxSizeKB && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        // If still too large, reduce dimensions
        if (getDataUrlSizeKB(dataUrl) > maxSizeKB) {
          const sizeReduction = Math.sqrt(maxSizeKB / getDataUrlSizeKB(dataUrl));
          const newWidth = Math.floor(width * sizeReduction);
          const newHeight = Math.floor(height * sizeReduction);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        }

        const originalSize = file.size;
        const compressedSize = getDataUrlSizeBytes(dataUrl);

        resolve({
          compressedDataUrl: dataUrl,
          originalSize,
          compressedSize,
          compressionRatio: compressedSize / originalSize
        });

      } catch (error) {
        reject(new Error(`Image compression failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Get the size of a data URL in KB
 */
export function getDataUrlSizeKB(dataUrl: string): number {
  return getDataUrlSizeBytes(dataUrl) / 1024;
}

/**
 * Get the size of a data URL in bytes
 */
export function getDataUrlSizeBytes(dataUrl: string): number {
  // Remove the data URL prefix to get just the base64 data
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) return 0;
  
  // Calculate the actual byte size (base64 is ~4/3 the size of the original)
  return Math.floor((base64Data.length * 3) / 4);
}

/**
 * Validate if an image file is within acceptable limits
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSizeMB = 5; // 5MB limit
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Please use JPEG, PNG, or WebP.`
    };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is ${maxSizeMB}MB.`
    };
  }
  
  return { isValid: true };
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

/**
 * Compress an image from a URL (for server-side use)
 */
export async function compressImageFromUrl(
  imageUrl: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 1024
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels if the image is still too large
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        // Check if we need to reduce quality further
        while (getDataUrlSizeKB(dataUrl) > maxSizeKB && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        // If still too large, reduce dimensions
        if (getDataUrlSizeKB(dataUrl) > maxSizeKB) {
          const sizeReduction = Math.sqrt(maxSizeKB / getDataUrlSizeKB(dataUrl));
          const newWidth = Math.floor(width * sizeReduction);
          const newHeight = Math.floor(height * sizeReduction);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        }

        const compressedSize = getDataUrlSizeBytes(dataUrl);

        resolve({
          compressedDataUrl: dataUrl,
          originalSize: 0, // Unknown for URL-based compression
          compressedSize,
          compressionRatio: 1 // Unknown without original size
        });

  } catch (error) {
        reject(new Error(`Image compression failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = imageUrl;
  });
}

/**
 * Compress a base64 data URI
 */
export async function compressBase64DataUri(
  dataUri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 1024
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels if the image is still too large
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        // Check if we need to reduce quality further
        while (getDataUrlSizeKB(dataUrl) > maxSizeKB && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        // If still too large, reduce dimensions
        if (getDataUrlSizeKB(dataUrl) > maxSizeKB) {
          const sizeReduction = Math.sqrt(maxSizeKB / getDataUrlSizeKB(dataUrl));
          const newWidth = Math.floor(width * sizeReduction);
          const newHeight = Math.floor(height * sizeReduction);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        }

        const originalSize = getDataUrlSizeBytes(dataUri);
        const compressedSize = getDataUrlSizeBytes(dataUrl);

        resolve({
          compressedDataUrl: dataUrl,
          originalSize,
          compressedSize,
          compressionRatio: compressedSize / originalSize
        });

  } catch (error) {
        reject(new Error(`Image compression failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataUri;
  });
}

/**
 * Get optimal compression options based on image characteristics
 */
export function getOptimalCompressionOptions(
  imageSize: number,
  imageType: string = 'image/jpeg'
): CompressionOptions {
  const sizeMB = imageSize / (1024 * 1024);
  
  if (sizeMB > 5) {
    return {
      maxWidth: 1280,
      maxHeight: 720,
      quality: 0.6,
      maxSizeKB: 512
    };
  } else if (sizeMB > 2) {
    return {
      maxWidth: 1600,
      maxHeight: 900,
      quality: 0.7,
      maxSizeKB: 768
    };
  } else {
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      maxSizeKB: 1024
    };
  }
}