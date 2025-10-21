import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'public', 'uploads');

async function ensureUploadsDir() {
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
}

export async function POST(request: Request) {
  try {
    console.log('📤 [Upload API] Starting file upload');
    
    // Ensure uploads directory exists
    await ensureUploadsDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ [Upload API] No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 [Upload API] Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size (8MB limit for development)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      console.error('❌ [Upload API] File too large:', file.size);
      return NextResponse.json(
        { error: 'File size exceeds 8MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ [Upload API] Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, MP4, WebM' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFilename);

    console.log('💾 [Upload API] Saving file to:', filePath);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Generate public URL - convert to absolute URL for FAL API compatibility
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/uploads/${uniqueFilename}`;

    console.log('✅ [Upload API] File uploaded successfully:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    });

  } catch (error) {
    console.error('❌ [Upload API] Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'No file URL provided' },
        { status: 400 }
      );
    }

    // For development, we'll just return success
    // In production, you'd want to actually delete the file
    console.log('🗑️ [Upload API] Delete request for:', url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [Upload API] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
