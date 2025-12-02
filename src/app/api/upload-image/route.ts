import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 [Upload Image API] Starting image upload');

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      console.error('❌ [Upload Image API] No file provided');
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    console.log('📁 [Upload Image API] Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ [Upload Image API] Invalid file type:', file.type);
      return NextResponse.json({
        success: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('❌ [Upload Image API] File too large:', file.size);
      return NextResponse.json({
        success: false,
        error: 'File size exceeds 10MB limit'
      }, { status: 400 });
    }

    // Generate filename and setup paths
    const extension = file.name.split('.').pop() || 'png';
    const filename = `${nanoid()}.${extension}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert to buffer and save
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/uploads/${filename}`;

    // Generate base64 for FAL.ai compatibility
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('✅ [Upload Image API] Image uploaded successfully:', publicUrl);

    return NextResponse.json({
      success: true,
      filename,
      url: publicUrl,
      dataUrl: dataUrl,
      base64: base64,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ [Upload Image API] Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
