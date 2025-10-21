import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';

export interface FileUploadOptions {
  maxSize: number; // in bytes
  allowedTypes: readonly string[];
  generateBase64?: boolean;
  uploadDir?: string;
  allowedExtensions?: readonly string[];
  fieldName?: string; // Add fieldName to the interface
}

export interface UploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  base64?: string;
  error?: string;
  size?: number;
  type?: string;
}

const DEFAULT_UPLOAD_OPTIONS: FileUploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB default
  allowedTypes: [],
  generateBase64: false,
  uploadDir: 'uploads'
};

// File type configurations
export const FILE_TYPE_CONFIGS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
    allowedExtensions: ['.mp4', '.webm', '.mov', '.avi']
  },
  audio: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'],
    allowedExtensions: ['.mp3', '.wav', '.ogg', '.m4a']
  }
} as const;

// Validate file type and size
function validateFile(file: File, options: FileUploadOptions): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!file || file.size === 0) {
    return { isValid: false, error: 'No file provided or file is empty' };
  }

  // Check file size
  if (file.size > options.maxSize) {
    return { 
      isValid: false, 
      error: `File too large. Maximum size is ${Math.round(options.maxSize / 1024 / 1024)}MB` 
    };
  }

  // Check file type
  if (options.allowedTypes.length > 0 && !options.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}` 
    };
  }

  // Check file extension if specified
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!options.allowedExtensions.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Invalid file extension. Allowed extensions: ${options.allowedExtensions.join(', ')}` 
      };
    }
  }

  return { isValid: true };
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
  const uniqueId = nanoid(12);
  return `${baseName}-${uniqueId}${extension}`;
}

// Ensure upload directory exists
async function ensureUploadDirectory(uploadPath: string): Promise<void> {
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }
}

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// Generic file upload handler
export async function handleFileUpload(
  request: NextRequest,
  fileType: keyof typeof FILE_TYPE_CONFIGS,
  customOptions?: Partial<FileUploadOptions>
): Promise<NextResponse> {
  try {
    console.log(`📁 [Upload] Starting ${fileType} upload`);

    const formData = await request.formData();
    const fieldName = customOptions?.fieldName || fileType;
    const file = formData.get(fieldName) as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Merge default options with file type config and custom options
    const config = FILE_TYPE_CONFIGS[fileType];
    const options: FileUploadOptions = {
      ...DEFAULT_UPLOAD_OPTIONS,
      ...config,
      ...customOptions
    };

    // Validate file
    const validation = validateFile(file, options);
    if (!validation.isValid) {
      console.error(`❌ [Upload] Validation error: ${validation.error}`);
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
      }, { status: 400 });
    }

    // Generate filename and setup paths
    const filename = generateFilename(file.name);
    const uploadDir = join(process.cwd(), 'public', options.uploadDir || 'uploads');
    const filePath = join(uploadDir, filename);
    
    // Ensure directory exists
    await ensureUploadDirectory(uploadDir);

    // Convert to buffer and save
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    const result: UploadResult = {
      success: true,
      filename,
      url: `/${options.uploadDir}/${filename}`,
      size: file.size,
      type: file.type
    };

    // Generate base64 if requested
    if (options.generateBase64) {
      result.base64 = await fileToBase64(file);
    }

    console.log(`✅ [Upload] ${fileType} uploaded successfully: ${filename}`);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error(`❌ [Upload] Error uploading ${fileType}:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Convenience functions for specific file types
export const uploadHandlers = {
  image: (request: NextRequest, options?: Partial<FileUploadOptions>) => 
    handleFileUpload(request, 'image', options),
    
  video: (request: NextRequest, options?: Partial<FileUploadOptions>) => 
    handleFileUpload(request, 'video', options),
    
  audio: (request: NextRequest, options?: Partial<FileUploadOptions>) => 
    handleFileUpload(request, 'audio', options)
};

// Multiple file upload handler
export async function handleMultipleFileUpload(
  request: NextRequest,
  fileType: keyof typeof FILE_TYPE_CONFIGS,
  maxFiles: number = 5,
  customOptions?: Partial<FileUploadOptions>
): Promise<NextResponse> {
  try {
    console.log(`📁 [Multi-Upload] Starting multiple ${fileType} upload`);

    const formData = await request.formData();
    const files: File[] = [];
    
    // Extract all files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No files provided' 
      }, { status: 400 });
    }

    if (files.length > maxFiles) {
      return NextResponse.json({ 
        success: false, 
        error: `Too many files. Maximum allowed: ${maxFiles}` 
      }, { status: 400 });
    }

    // Process each file
    const results: UploadResult[] = [];
    const config = FILE_TYPE_CONFIGS[fileType];
    const options: FileUploadOptions = {
      ...DEFAULT_UPLOAD_OPTIONS,
      ...config,
      ...customOptions
    };

    for (const file of files) {
      const validation = validateFile(file, options);
      if (!validation.isValid) {
        results.push({
          success: false,
          error: validation.error
        });
        continue;
      }

      try {
        const filename = generateFilename(file.name);
        const uploadDir = join(process.cwd(), 'public', options.uploadDir || 'uploads');
        const filePath = join(uploadDir, filename);
        
        await ensureUploadDirectory(uploadDir);
        
        const buffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(buffer));

        const result: UploadResult = {
          success: true,
          filename,
          url: `/${options.uploadDir}/${filename}`,
          size: file.size,
          type: file.type
        };

        if (options.generateBase64) {
          result.base64 = await fileToBase64(file);
        }

        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: `Failed to upload ${file.name}`
        });
      }
    }

    console.log(`✅ [Multi-Upload] Processed ${files.length} ${fileType} files`);
    
    return NextResponse.json({
      success: true,
      files: results,
      totalUploaded: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error(`❌ [Multi-Upload] Error uploading ${fileType} files:`, error);
    return NextResponse.json({ 
      success: false, 
      error: 'Multi-upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}