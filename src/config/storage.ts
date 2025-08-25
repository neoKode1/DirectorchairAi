type AllowedImageTypes = 'image/jpeg' | 'image/png' | 'image/webp';
type AllowedVideoTypes = 'video/mp4' | 'video/webm';
type AllowedAudioTypes = 'audio/mpeg' | 'audio/wav' | 'audio/mp3';
type AllowedCustomModelTypes = 'application/json' | 'application/octet-stream' | 'application/x-safetensors';
type AllowedMimeTypes = AllowedImageTypes | AllowedVideoTypes | AllowedAudioTypes | AllowedCustomModelTypes;

type MediaTypeConfig = {
  readonly [K in MediaType]: {
    readonly mimeTypes: readonly string[];
    readonly maxSize: number;
  }
};

export const storageConfig = {
  maxFileSizes: {
    image: 8 * 1024 * 1024, // 8MB
    video: 256 * 1024 * 1024, // 256MB
    audio: 32 * 1024 * 1024, // 32MB
    customModel: 100 * 1024 * 1024, // 100MB for custom model files
  },
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp'] as const,
    video: ['video/mp4', 'video/webm'] as const,
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp3'] as const,
    customModel: ['application/json', 'application/octet-stream', 'application/x-safetensors'] as const,
  },
  bucketName: 'local-development', // Using local storage for development
  uploadEndpoint: '/api/upload',
} as const;

export type MediaType = 'image' | 'video' | 'audio' | 'customModel';

function isAllowedMimeType(mimeType: string, mediaType: MediaType): mimeType is AllowedMimeTypes {
  return storageConfig.allowedTypes[mediaType].some(
    allowedType => allowedType === mimeType
  );
}

export function validateFile(file: File, type: MediaType): string | null {
  // Check file size
  if (file.size > storageConfig.maxFileSizes[type]) {
    return `File size exceeds ${storageConfig.maxFileSizes[type] / (1024 * 1024)}MB limit`;
  }

  // Check file type
  if (!isAllowedMimeType(file.type, type)) {
    return `Invalid file type. Allowed types: ${storageConfig.allowedTypes[type].join(', ')}`;
  }

  return null;
}

export function getMediaType(file: File): MediaType {
  const type = file.type.split('/')[0];
  
  // Handle custom model files
  if (file.type === 'application/json' || 
      file.type === 'application/octet-stream' || 
      file.type === 'application/x-safetensors') {
    return 'customModel';
  }
  
  return type === 'audio' ? 'audio' : type as MediaType;
} 