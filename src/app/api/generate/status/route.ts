import { NextRequest, NextResponse } from 'next/server';
import { createFalClient } from '@fal-ai/client';
import { applyRateLimit } from '@/lib/rate-limit';
import { isValidModel } from '@/lib/input-validation';
import { createRequestLogger } from '@/lib/logger';
import { normalizeFalMediaResult } from '@/lib/fal-generation';

export const maxDuration = 30;

const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

const TERMINAL_FAILURE_STATUSES = new Set(['FAILED', 'CANCELLED']);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rateLimited = await applyRateLimit(request, 'standard');
  if (rateLimited) return rateLimited;

  const localRequestId = crypto.randomUUID().slice(0, 8);
  const log = createRequestLogger({ requestId: localRequestId, route: '/api/generate/status' });

  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ success: false, error: 'FAL_KEY not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const model = searchParams.get('model');

    if (!requestId || !model) {
      return NextResponse.json({ success: false, error: 'Missing requestId or model' }, { status: 400 });
    }
    if (!isValidModel(model)) {
      return NextResponse.json({ success: false, error: 'Unsupported model' }, { status: 400 });
    }

    const queueStatus = await fal.queue.status(model, { requestId, logs: false });
    log.debug({ model, requestId, status: queueStatus.status }, 'Queued generation status');

    if (queueStatus.status !== 'COMPLETED') {
      return NextResponse.json({
        success: !TERMINAL_FAILURE_STATUSES.has(queueStatus.status),
        queued: true,
        status: queueStatus.status,
        requestId,
        model,
        logs: (queueStatus as any).logs || [],
      }, { status: TERMINAL_FAILURE_STATUSES.has(queueStatus.status) ? 500 : 200 });
    }

    const result = await fal.queue.result(model, { requestId });
    const data = (result as any).data;
    const { images, videos, audios } = normalizeFalMediaResult(data);

    return NextResponse.json({
      success: true,
      queued: true,
      status: 'COMPLETED',
      requestId,
      model,
      data,
      images,
      videos,
      audios,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const status = error?.status || 500;
    log.error({ status, body: error?.body, err: error?.message || error }, 'Queued generation status failed');
    return NextResponse.json({
      success: false,
      queued: true,
      status: 'FAILED',
      error: error?.message || 'Unknown error',
      body: error?.body,
      timestamp: new Date().toISOString(),
    }, { status });
  }
}