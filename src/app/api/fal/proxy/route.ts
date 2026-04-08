import { route } from "@fal-ai/server-proxy/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { logger } from '@/lib/logger';

const log = logger.child({ route: '/api/fal/proxy' });

if (!process.env.FAL_KEY) {
  log.error('FAL_KEY environment variable is not set');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const response = await route.POST(request);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Proxy request failed' }));
      log.error({ status: response.status, errorData }, 'FAL proxy error response');
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    log.error({ err: error }, 'FAL proxy unexpected error');
    return NextResponse.json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const response = await route.GET(request);
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    log.error({ err: error }, 'FAL proxy GET error');
    return NextResponse.json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
