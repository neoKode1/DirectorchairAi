import { NextRequest, NextResponse } from "next/server";
import { createFalClient } from '@fal-ai/client';
import { applyRateLimit } from '@/lib/rate-limit';
import { createRequestLogger } from '@/lib/logger';
import {
  buildNanoBananaFallbackInput,
  isRecoverableNanoBananaFailure,
  prepareFalGenerationInput,
} from '@/lib/fal-generation';

// Create a dedicated server-side fal client (avoids singleton proxyUrl contamination)
const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

// Allow large request bodies (base64 images can be several MB)
export const maxDuration = 120; // seconds

// Unified generate route that handles all FAL models directly
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: 30 requests/minute for expensive generation calls
  const rateLimited = await applyRateLimit(request, 'generate');
  if (rateLimited) return rateLimited;

  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);
  const log = createRequestLogger({ requestId, route: '/api/generate' });

  try {
    const body = await request.json();

    const preparation = await prepareFalGenerationInput(body, log);
    if (!preparation.valid) {
      log.warn({ error: preparation.error }, 'Validation failed');
      return NextResponse.json({ success: false, error: preparation.error }, { status: 400 });
    }
    const { prompt, model, input, isVideoModel, isImageModel } = preparation.prepared;
    log.info({ model, prompt: prompt.slice(0, 80), ar: body.aspect_ratio, res: body.resolution, dur: body.duration, hasImage: !!body.image_url }, 'Generation request');
    log.debug({ isVideoModel, isImageModel }, 'Classification');

    log.info({ model, ar: input.aspect_ratio, res: input.resolution, dur: input.duration }, 'Calling FAL');

    // Call FAL API directly
    let result;
    try {
      result = await fal.subscribe(model, {
        input,
        logs: true,
        onQueueUpdate: (update: any) => {
          if (update.status !== 'IN_QUEUE') {
            log.debug({ queueStatus: update.status }, 'Queue update');
          }
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      log.info({ duration }, 'Complete');
      
      return NextResponse.json({
        success: true,
        data: result.data,
        requestId: result.requestId,
        status: 'completed',
        model: model,
        prompt: prompt,
        duration: duration,
        timestamp: new Date().toISOString()
      });

    } catch (falError: any) {
      log.error({ status: falError.status, body: falError.body, msg: falError.message }, 'FAL API error');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Check if this is a content policy violation with Nano Banana Edit that we can fallback from
      if (isRecoverableNanoBananaFailure(falError, model, body)) {
        log.warn({ model }, 'Content policy violation, trying fallback');
        try {
          const fallbackInput = buildNanoBananaFallbackInput(input, body);

          const fallbackResult = await fal.subscribe('fal-ai/bytedance/seedream/v4/edit', {
            input: fallbackInput as any,
            logs: true,
          });

          const fallbackDuration = Date.now() - startTime;
          log.info({ duration: fallbackDuration, fallback: 'seedream-v4-edit' }, 'Fallback complete');

          return NextResponse.json({
            success: true,
            data: fallbackResult.data,
            requestId: fallbackResult.requestId,
            status: 'completed',
            model: 'fal-ai/bytedance/seedream/v4/edit',
            prompt: prompt,
            duration: fallbackDuration,
            fallbackUsed: 'fal-ai/bytedance/seedream/v4/edit',
            timestamp: new Date().toISOString()
          });
        } catch (fallbackError) {
          log.error({ err: fallbackError }, 'Fallback also failed');
        }
      }

      // Return the original error if no fallback or fallback failed
      const originalStatus = falError.status || 500;
      
      return NextResponse.json({
        success: false,
        error: 'FAL API call failed',
        details: falError.message || 'Unknown FAL error',
        status: falError.status,
        body: falError.body,
        model: model,
        prompt: prompt,
        duration: duration,
        timestamp: new Date().toISOString()
      }, { status: originalStatus });
    }

  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log.error({ duration, err: error.message }, 'Generation failed');

    return NextResponse.json({
      success: false,
      error: "Failed to process generation request",
      details: error.message || 'Unknown error',
      requestId: requestId,
      duration: duration,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle CORS preflight — same-origin only (no wildcard)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[];

  const isAllowed = allowedOrigins.some(o => origin === o);

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  });
}