import { NextRequest, NextResponse } from 'next/server';

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

    // Convert to buffer for base64 and upload
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // For now, just return the base64 data URL since FAL.ai accepts it
    // This avoids file system issues on Vercel
    console.log('✅ [Upload Image API] Image processed successfully (base64)');

    return NextResponse.json({
      success: true,
      filename: file.name,
      url: dataUrl, // Use data URL directly
      dataUrl: dataUrl,
      base64: base64,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ [Upload Image API] Upload error:', error);
    console.error('❌ [Upload Image API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
