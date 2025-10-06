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

    // Apply model-specific parameter handling (same as in /api/generate)
    const processedInput = { ...input };
    
    // Handle Minimax Hailuo-02 model specific parameters
    if (model.includes('minimax/hailuo-02') || model.includes('minimax/hailuo-02/standard')) {
      console.log(`🔧 [Queue] Detected Minimax Hailuo-02 model: ${model}`);
      
      // Hailuo AI 02 Standard ONLY accepts duration: '6' or '10' (strings)
      if (input.duration) {
        const durationStr = input.duration.toString();
        if (durationStr.includes('5') || durationStr.includes('5s')) {
          processedInput.duration = '6'; // Convert 5s to 6s (closest valid option)
        } else if (durationStr.includes('10') || durationStr.includes('10s')) {
          processedInput.duration = '10';
        } else if (durationStr.includes('6') || durationStr.includes('6s')) {
          processedInput.duration = '6';
        } else {
          processedInput.duration = '6'; // Default to 6 seconds (valid option)
        }
      } else {
        processedInput.duration = '6'; // Default to 6 seconds (valid option)
      }

      // Hailuo AI 02 Standard ONLY accepts resolution: '512P' or '768P'
      if (input.resolution) {
        if (input.resolution === '1080p' || input.resolution === '720p') {
          processedInput.resolution = '768P'; // Convert high res to 768P
        } else if (input.resolution === '512P' || input.resolution === '768P') {
          processedInput.resolution = input.resolution; // Already valid
        } else {
          processedInput.resolution = '768P'; // Default to 768P (valid option)
        }
      } else {
        processedInput.resolution = '768P'; // Default to 768P (valid option)
      }

      console.log(`🔧 [Queue] Hailuo AI 02 Standard parameters:`, {
        model: model,
        originalDuration: input.duration,
        originalResolution: input.resolution,
        finalDuration: processedInput.duration,
        finalResolution: processedInput.resolution,
        note: 'Hailuo AI 02 only accepts duration: 6 or 10 (strings), resolution: 512P or 768P (strings)'
      });
    }

    // Handle Kling model specific parameters
    if (model.includes('kling-video')) {
      // Kling models only accept duration: '5' or '10' (strings without 's')
      if (input.duration) {
        const durationStr = input.duration.toString();
        if (durationStr.includes('5') || durationStr.includes('5s')) {
          processedInput.duration = '5'; // Kling uses '5' not '5s'
        } else if (durationStr.includes('10') || durationStr.includes('10s')) {
          processedInput.duration = '10';
        } else {
          processedInput.duration = '5'; // Default to 5 seconds
        }
      } else {
        processedInput.duration = '5'; // Default to 5 seconds
      }

      console.log(`🔧 [Queue] Kling model parameters:`, {
        originalDuration: input.duration,
        finalDuration: processedInput.duration,
        note: 'Kling uses duration: 5 or 10 (strings without s)'
      });
    }

    // Handle Luma model specific parameters
    if (model.includes('luma-dream-machine')) {
      // Luma Ray 2 Flash uses duration: '5s' or '9s' (strings with 's')
      if (input.duration) {
        const durationStr = input.duration.toString();
        if (durationStr.includes('5') || durationStr.includes('5s')) {
          processedInput.duration = '5s'; // Luma uses '5s' with 's'
        } else if (durationStr.includes('9') || durationStr.includes('9s')) {
          processedInput.duration = '9s';
        } else {
          processedInput.duration = '5s'; // Default to 5 seconds
        }
      } else {
        processedInput.duration = '5s'; // Default to 5 seconds
      }

      console.log(`🔧 [Queue] Luma Ray 2 Flash parameters:`, {
        originalDuration: input.duration,
        finalDuration: processedInput.duration,
        note: 'Luma uses duration: 5s or 9s (strings with s)'
      });
    }

    // Handle Seedance model specific parameters
    if (model.includes('seedance')) {
      // Seedance expects duration as a number (3, 4, 5, etc.) not a string with 's'
      processedInput.duration = 5; // Default to 5 seconds for simplicity
      
      console.log(`🔧 [Queue] Seedance model parameters:`, {
        originalDuration: input.duration,
        finalDuration: processedInput.duration,
        note: 'Seedance uses duration as number (3, 4, 5, etc.)'
      });
    }

    // Submit request to FAL queue with processed input
    const falClient = fal();
    const { request_id } = await falClient.queue.submit(model, {
      input: processedInput,
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
