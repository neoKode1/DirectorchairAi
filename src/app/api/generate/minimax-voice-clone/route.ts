import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎭 [MiniMax Voice Clone API] Starting voice cloning request');
    
    const { 
      audio_url,
      text,
      model,
      noise_reduction,
      need_volume_normalization,
      accuracy
    } = await request.json();

    console.log('📋 [MiniMax Voice Clone API] Request parameters:', {
      audio_url: audio_url?.substring(0, 50) + '...',
      text: text?.substring(0, 50) + '...',
      model,
      noise_reduction,
      need_volume_normalization,
      accuracy
    });

    // Validate required parameters
    if (!audio_url) {
      console.error('❌ [MiniMax Voice Clone API] Missing audio_url');
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Build input object with only provided parameters
    const input: any = {
      audio_url: audio_url.trim()
    };

    // Add optional parameters only if they are provided
    if (text) input.text = text.trim();
    if (model) input.model = model;
    if (noise_reduction !== undefined) input.noise_reduction = noise_reduction;
    if (need_volume_normalization !== undefined) input.need_volume_normalization = need_volume_normalization;
    if (accuracy) input.accuracy = accuracy;

    console.log('🎯 [MiniMax Voice Clone API] Calling FAL.AI with input:', input);

    const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ [MiniMax Voice Clone API] Voice cloning completed successfully');
    console.log('📦 [MiniMax Voice Clone API] Result:', result);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      customVoiceId: result.data?.custom_voice_id,
      previewAudioUrl: result.data?.audio?.url,
    });

  } catch (error) {
    console.error('❌ [MiniMax Voice Clone API] Voice cloning error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to clone voice',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
