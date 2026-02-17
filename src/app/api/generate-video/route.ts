import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration = 10, resolution = '1080p', ratio = '16:9' } = body;

    const apiKey = process.env.BYTEPLUS_API_KEY;
    const baseUrl = process.env.BYTEPLUS_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3';

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: 'API key not configured. Please set BYTEPLUS_API_KEY in your environment variables.' } },
        { status: 500 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: { message: 'Prompt is required and must be a non-empty string' } },
        { status: 400 }
      );
    }

    // Step 1: Create task
    const createRes = await fetch(`${baseUrl}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'seedance-2-0', // Update this with the exact model ID from BytePlus console
        content: {
          text: prompt,
          // For image-to-video, add: references: [{ type: 'image', url: '...' }]
        },
        parameters: {
          duration, // seconds
          resolution,
          ratio,
          // Other Seedance 2.0 params can be added here:
          // seed: number,
          // camera_control: object,
          // audio_sync: boolean,
        },
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error('BytePlus API Error:', errorData);
      
      return NextResponse.json(
        { error: errorData },
        { status: createRes.status }
      );
    }

    const data = await createRes.json();
    const { task_id } = data;

    if (!task_id) {
      return NextResponse.json(
        { error: { message: 'No task_id returned from API' } },
        { status: 500 }
      );
    }

    // Return task_id to client for polling
    return NextResponse.json({ task_id });
  } catch (error) {
    console.error('Generate video error:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to create task' } },
      { status: 500 }
    );
  }
}

