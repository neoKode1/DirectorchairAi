import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@/lib/fal.server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, input } = body;

    if (!model || !input) {
      return NextResponse.json(
        { error: 'Model and input are required' },
        { status: 400 }
      );
    }

    console.log('🚀 [Queue] Submitting request to queue:', { model, input });

    // Submit request to FAL queue
    const falClient = fal();
    const { request_id } = await falClient.queue.submit(model, {
      input,
      webhookUrl: undefined, // We'll poll for status instead
    });

    console.log('✅ [Queue] Request submitted successfully:', request_id);

    return NextResponse.json({
      request_id,
      status: 'IN_QUEUE',
      message: 'Request submitted to queue successfully'
    });

  } catch (error: any) {
    console.error('❌ [Queue] Error submitting request:', error);
    return NextResponse.json(
      { error: 'Failed to submit request to queue', details: error.message },
      { status: 500 }
    );
  }
}

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

    console.log('🔍 [Queue] Checking status for request:', requestId);

    // Get request status
    const falClient = fal();
    const status = await falClient.queue.status(model, {
      requestId: requestId,
      logs: true,
    });

    console.log('📊 [Queue] Status retrieved:', status.status);

    return NextResponse.json(status);

  } catch (error: any) {
    console.error('❌ [Queue] Error checking status:', error);
    return NextResponse.json(
      { error: 'Failed to check queue status', details: error.message },
      { status: 500 }
    );
  }
}
