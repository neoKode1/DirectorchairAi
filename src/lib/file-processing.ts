/**
 * Comprehensive file processing utilities for images and audio
 */

export interface FileProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  maxAudioSizeKB?: number; // Separate limit for audio files
}

export interface FileProcessingResult {
  processedDataUrl: string;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  fileType: 'image' | 'audio';
  mimeType: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: 'image' | 'audio';
  mimeType?: string;
}

/**
 * Validate if a file is a supported image or audio file
 */
export function validateFile(file: File): FileValidationResult {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const audioTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/aac'];
  
  if (imageTypes.includes(file.type)) {
    return {
      isValid: true,
      fileType: 'image',
      mimeType: file.type
    };
  }
  
  if (audioTypes.includes(file.type)) {
    return {
      isValid: true,
      fileType: 'audio',
      mimeType: file.type
    };
  }
  
  return {
    isValid: false,
    error: `Unsupported file type: ${file.type}. Supported types: ${[...imageTypes, ...audioTypes].join(', ')}`
  };
}

/**
 * Process an image file (compress if needed)
 */
export async function processImageFile(
  file: File, 
  options: FileProcessingOptions = {}
): Promise<FileProcessingResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 1024 // 1MB limit for images
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
        
        // Try different quality levels if file is too large
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        
        while (dataUrl.length > maxSizeKB * 1024 && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        const originalSize = file.size;
        const processedSize = Math.round((dataUrl.length - 22) * 3 / 4); // Approximate base64 to bytes
        const compressionRatio = originalSize / processedSize;

        resolve({
          processedDataUrl: dataUrl,
          originalSize,
          processedSize,
          compressionRatio,
          fileType: 'image',
          mimeType: 'image/jpeg'
        });
      } catch (error) {
        reject(new Error(`Image processing failed: ${error}`));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Process an audio file (validate and convert to data URL)
 */
export async function processAudioFile(
  file: File,
  options: FileProcessingOptions = {}
): Promise<FileProcessingResult> {
  const { maxAudioSizeKB = 5120 } = options; // 5MB limit for audio files

  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > maxAudioSizeKB * 1024) {
      reject(new Error(`Audio file too large: ${formatFileSize(file.size)}. Maximum size: ${maxAudioSizeKB}KB`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const originalSize = file.size;
      const processedSize = Math.round((dataUrl.length - 22) * 3 / 4); // Approximate base64 to bytes
      const compressionRatio = 1; // Audio files aren't compressed, just converted

      resolve({
        processedDataUrl: dataUrl,
        originalSize,
        processedSize,
        compressionRatio,
        fileType: 'audio',
        mimeType: file.type
      });
    };

    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Process any supported file (image or audio)
 */
export async function processFile(
  file: File,
  options: FileProcessingOptions = {}
): Promise<FileProcessingResult> {
  const validation = validateFile(file);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (validation.fileType === 'image') {
    return processImageFile(file, options);
  } else if (validation.fileType === 'audio') {
    return processAudioFile(file, options);
  } else {
    throw new Error('Unsupported file type');
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type icon
 */
export function getFileTypeIcon(fileType: 'image' | 'audio'): string {
  return fileType === 'image' ? '🖼️' : '🎵';
}

/**
 * Get file type display name
 */
export function getFileTypeDisplayName(fileType: 'image' | 'audio'): string {
  return fileType === 'image' ? 'Image' : 'Audio';
}
