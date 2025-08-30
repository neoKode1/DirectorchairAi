import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('🔄 [Poll API] Polling for task:', taskId);

    // Get FAL API key from environment
    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      console.error('❌ [Poll API] FAL_KEY not found in environment');
      return NextResponse.json(
        { error: 'FAL API key not configured' },
        { status: 500 }
      );
    }

    // Poll the FAL.ai API for task status using the current queue endpoint
    const response = await fetch(`https://queue.fal.run/fal-ai/queue/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ [Poll API] FAL API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `FAL API error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('📊 [Poll API] FAL API response:', result);

    // Extract relevant information from the FAL response
    const status = result.status || 'unknown';
    let videoData = null;
    let error = null;

    if (status === 'completed' && result.images && result.images.length > 0) {
      // For video generation, the result might be in images array
      const videoResult = result.images[0];
      videoData = {
        url: videoResult.url,
        duration: videoResult.duration || '5s',
        resolution: videoResult.resolution || 'HD',
        format: videoResult.content_type || 'mp4',
      };
    } else if (status === 'failed') {
      error = result.error || 'Video generation failed';
    }

    return NextResponse.json({
      status,
      video: videoData,
      error,
      prompt: result.prompt,
      taskId,
    });

  } catch (error) {
    console.error('❌ [Poll API] Error polling video status:', error);
    return NextResponse.json(
      { error: 'Failed to poll video status' },
      { status: 500 }
    );
  }
}
