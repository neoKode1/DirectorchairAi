import { NextRequest, NextResponse } from 'next/server';
import { createRequestLogger, logger } from '@/lib/logger';

const log = logger.child({ route: '/api/poll-task' });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const apiKey = process.env.BYTEPLUS_API_KEY;
    const baseUrl = process.env.BYTEPLUS_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Poll the task status
    const res = await fetch(`${baseUrl}/contents/generations/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      log.error({ err: errorData }, 'Poll task error:');
      
      return NextResponse.json(
        { error: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    // BytePlus API returns:
    // { status: 'succeeded' | 'running' | 'failed', result: { video_url: '...' }, ... }
    return NextResponse.json(data);
  } catch (error) {
    log.error({ err: error }, 'Poll task error:');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Poll error' },
      { status: 500 }
    );
  }
}

