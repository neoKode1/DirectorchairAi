import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!video.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      );
    }

    // Validate file size (e.g., 100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (video.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = video.name.split('.').pop() || 'mp4';
    const filename = `video-${timestamp}.${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/uploads/${filename}`;

    console.log('✅ [Video Upload] Video uploaded successfully:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: video.size,
      type: video.type
    });

  } catch (error) {
    console.error('❌ [Video Upload] Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video file' },
      { status: 500 }
    );
  }
}
