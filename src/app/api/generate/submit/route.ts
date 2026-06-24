import { NextRequest, NextResponse } from 'next/server';
import { createFalClient } from '@fal-ai/client';
import { applyRateLimit } from '@/lib/rate-limit';
import { createRequestLogger } from '@/lib/logger';
import { prepareFalGenerationInput } from '@/lib/fal-generation';

// Submit only. The long-running generation runs on Fal's queue, not inside Vercel.
export const maxDuration = 60;

const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimited = await applyRateLimit(request, 'generate');
  if (rateLimited) return rateLimited;

  const startTime = Date.now();
  const localRequestId = crypto.randomUUID().slice(0, 8);
  const log = createRequestLogger({ requestId: localRequestId, route: '/api/generate/submit' });

  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ success: false, error: 'FAL_KEY not configured' }, { status: 500 });
    }

    const body = await request.json();
    const preparation = await prepareFalGenerationInput(body, log);
    if (!preparation.valid) {
      log.warn({ error: preparation.error }, 'Queued generation validation failed');
      return NextResponse.json({ success: false, error: preparation.error }, { status: 400 });
    }

    const { model, prompt, input } = preparation.prepared;
    log.info({ model, ar: input.aspect_ratio, res: input.resolution, dur: input.duration }, 'Submitting queued generation');

    const submitResult = await fal.queue.submit(model, {
      input: input as any,
      priority: body.priority === 'low' ? 'low' : 'normal',
    });
    const requestId = (submitResult as any).request_id || (submitResult as any).requestId;
    const duration = Date.now() - startTime;

    log.info({ model, requestId, duration }, 'Queued generation submitted');

    return NextResponse.json({
      success: true,
      queued: true,
      status: submitResult.status || 'IN_QUEUE',
      requestId,
      model,
      prompt,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const status = error?.status || 500;
    log.error({ duration, status, body: error?.body, err: error?.message || error }, 'Queued generation submit failed');
    return NextResponse.json({
      success: false,
      error: 'Failed to submit queued generation',
      details: error?.message || 'Unknown error',
      status: error?.status,
      body: error?.body,
      duration,
      timestamp: new Date().toISOString(),
    }, { status });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}