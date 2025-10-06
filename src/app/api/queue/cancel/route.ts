import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@/lib/fal.server';

export async function PUT(request: NextRequest) {
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

    console.log('❌ [Queue] Cancelling request:', requestId);

    // Cancel the request using FAL's cancel endpoint
    const response = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.status === 202) {
      console.log('✅ [Queue] Cancellation requested successfully:', requestId);
      return NextResponse.json({
        status: 'CANCELLATION_REQUESTED',
        message: 'Request cancellation has been requested'
      });
    } else if (response.status === 400) {
      console.log('⚠️ [Queue] Request already completed:', requestId);
      return NextResponse.json({
        status: 'ALREADY_COMPLETED',
        message: 'Request has already been completed and cannot be cancelled'
      }, { status: 400 });
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('❌ [Queue] Error cancelling request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel request', details: error.message },
      { status: 500 }
    );
  }
}
