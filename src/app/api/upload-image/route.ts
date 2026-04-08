import { NextRequest, NextResponse } from 'next/server';
import { uploadHandlers } from '@/lib/upload-handlers';
import { createRequestLogger, logger } from '@/lib/logger';

const log = logger.child({ route: '/api/upload-image' });

export async function POST(request: NextRequest) {
  // Use the shared upload handler with base64 generation for FAL.ai compatibility
  const response = await uploadHandlers.image(request, {
    fieldName: 'image', // Original code expects 'image' field name
    generateBase64: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Get the response data
  const responseData = await response.json();

  if (!responseData.success) {
    return response;
  }

  // Add compatibility fields for existing code
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const publicUrl = `${baseUrl}${responseData.url}`;
  const dataUrl = responseData.base64 ? `data:${responseData.type};base64,${responseData.base64}` : undefined;

  log.debug({ data: publicUrl }, '📤 [Upload API] Image uploaded successfully:');
  if (dataUrl) {
    log.debug('Base64 data URL generated for FAL.ai compatibility');
  }

  return NextResponse.json({
    ...responseData,
    url: publicUrl,
    dataUrl: dataUrl
  });
}
