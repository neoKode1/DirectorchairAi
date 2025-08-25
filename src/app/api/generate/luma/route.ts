import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 [Luma API] Request received');
    
    // Check if FAL_KEY is available
    if (!process.env.FAL_KEY) {
      console.error('❌ [Luma API] FAL_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'FAL_KEY environment variable is not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log('📝 [Luma API] Request body:', body);

    const {
      model,
      prompt,
      negative_prompt,
      image_url,
      aspect_ratio = "16:9",
      duration = "5",
      resolution = "720p",
      loop = false,
      seed,
    } = body;

    if (!prompt) {
      console.log('❌ [Luma API] Missing prompt');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Determine the correct Luma endpoint based on the model
    let lumaEndpoint = "fal-ai/luma-dream-machine/ray-2";
    
    if (model?.includes('ray-2-flash')) {
      lumaEndpoint = "fal-ai/luma-dream-machine/ray-2-flash/image-to-video";
    } else if (model?.includes('ray-2')) {
      lumaEndpoint = "fal-ai/luma-dream-machine/ray-2";
    }

    // Prepare the input for Luma
    const input: any = {
      prompt: prompt.trim(),
      aspect_ratio,
      duration,
      resolution,
      loop,
    };

    // Add image URL if provided
    if (image_url?.trim()) {
      input.image_url = image_url.trim();
    }

    // Add optional parameters
    if (negative_prompt?.trim()) {
      input.negative_prompt = negative_prompt.trim();
    }
    
    if (seed !== undefined && seed !== null) {
      input.seed = seed;
    }

    console.log('🚀 [Luma API] Calling fal.ai with input:', input);
    console.log('🔑 [Luma API] FAL_KEY available:', !!process.env.FAL_KEY);
    console.log('🎬 [Luma API] Using Luma endpoint:', lumaEndpoint);

    // Call the Luma API
    const result = await fal.subscribe(lumaEndpoint, {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('📊 [Luma API] Queue update:', update.status);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log: any) => log.message).forEach(console.log);
        }
      },
    }).catch((error: any) => {
      console.error('❌ [Luma API] FAL subscribe error:', error);
      console.error('❌ [Luma API] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    });

    console.log('✅ [Luma API] Generation completed');
    console.log('📦 [Luma API] Result:', result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      model: 'Luma Ray 2',
      parameters: input,
    });

  } catch (error: any) {
    console.error('❌ [Luma API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate video',
        details: error.message || 'Unknown error occurred',
        model: 'Luma Ray 2'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      models: [
        {
          id: "ray2",
          name: "Luma Ray 2",
          description: "Large-scale video generative model capable of creating realistic visuals with natural, coherent motion",
          category: "video",
        },
        {
          id: "ray2-flash",
          name: "Luma Ray 2 Flash (I2V)",
          description: "Fast image-to-video generation with Luma's latest Ray 2 Flash model",
          category: "video",
        },
      ],
    },
    { status: 200 },
  );
}
