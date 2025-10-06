import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@/lib/fal.server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');
    const model = searchParams.get('model');

    if (!requestId || !model) {
      return NextResponse.json(
        { error: 'request_id and model are required' },
        { status: 400 }
      );
    }

    console.log('📥 [Queue] Getting result for request:', requestId);

    // Get the final result
    const falClient = fal();
    const result = await falClient.queue.result(model, {
      requestId: requestId,
    });

    console.log('✅ [Queue] Result retrieved successfully');

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ [Queue] Error getting result:', error);
    return NextResponse.json(
      { error: 'Failed to get queue result', details: error.message },
      { status: 500 }
    );
  }
}
