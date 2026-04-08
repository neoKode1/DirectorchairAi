import { NextRequest, NextResponse } from "next/server";
import { createFalClient } from '@fal-ai/client';
import { createRequestLogger, logger } from '@/lib/logger';

const log = logger.child({ route: '/api/fal/image' });

// Dedicated server-side fal client (avoids singleton proxyUrl contamination)
const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

/**
 * FFmpeg frame extraction proxy.
 * This route now ONLY handles fal-ai/ffmpeg-api/extract-frame requests
 * (called by video-thumbnail.ts). All image generation models are handled
 * by /api/generate.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const model = body.model || body.endpoint || body.endpointId;

    if (!model) {
      return NextResponse.json({ success: false, error: "Model parameter is required" }, { status: 400 });
    }

    // Only allow FFmpeg frame extraction through this route
    if (!model.includes('ffmpeg-api/extract-frame')) {
      return NextResponse.json({
        success: false,
        error: `Model "${model}" is not supported by this route. Use /api/generate instead.`
      }, { status: 400 });
    }

    if (!body.video_url) {
      return NextResponse.json({ success: false, error: "video_url is required for frame extraction" }, { status: 400 });
    }

    log.debug({ data: { video_url: body.video_url, frame_type: body.frame_type } }, '🎬 [FFmpeg Proxy] Extracting frame:');

    const input: Record<string, unknown> = {
      prompt: body.prompt || 'Extract frame from video',
      video_url: body.video_url,
      frame_type: body.frame_type || 'last',
    };

    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        log.debug({ data: update.status }, '📊 [FFmpeg Proxy] Queue:');
      },
    });

    log.info('Complete');

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      status: 'completed',
      model,
    });
  } catch (error: any) {
    log.error({ err: error.message }, '❌ [FFmpeg Proxy] Error:');
    const status = error.status || 500;
    return NextResponse.json({
      success: false,
      error: error.message || 'Frame extraction failed',
      details: error.body,
    }, { status });
  }
}
