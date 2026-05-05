import { NextRequest, NextResponse } from 'next/server';
import { createFalClient } from '@fal-ai/client';
import { applyRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { ALLOWED_CHARACTER_SHEET_MODELS } from '@/lib/persona-models';

const log = logger.child({ route: '/api/personas/character-sheet-status' });

export const maxDuration = 30;

const fal = createFalClient({
  credentials: process.env.FAL_KEY,
});

function isRecoverableError(err: any): boolean {
  const status = err?.status || 0;
  if (status === 422 || status === 400) return true;
  const detail = err?.body?.detail;
  return !!(detail && JSON.stringify(detail).includes('could not generate'));
}

export async function GET(request: NextRequest) {
  const rateLimited = await applyRateLimit(request, 'standard');
  if (rateLimited) return rateLimited;

  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const model = searchParams.get('model');

    if (!requestId || !model) {
      return NextResponse.json({ error: 'Missing requestId or model' }, { status: 400 });
    }
    if (!ALLOWED_CHARACTER_SHEET_MODELS.has(model)) {
      return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
    }

    const status = await fal.queue.status(model, { requestId, logs: false });

    if (status.status !== 'COMPLETED') {
      return NextResponse.json({
        status: status.status,
        requestId,
        model,
      });
    }

    const result = await fal.queue.result(model, { requestId });
    const images = (result.data as any)?.images ?? [];

    return NextResponse.json({
      status: 'COMPLETED',
      requestId,
      model,
      images,
    });
  } catch (error: any) {
    const status = error?.status || 0;
    const recoverable = isRecoverableError(error);
    log.error({ status, err: error?.message || error }, 'Character sheet status failed');
    return NextResponse.json(
      {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        recoverable,
      },
      { status: status || 500 }
    );
  }
}
