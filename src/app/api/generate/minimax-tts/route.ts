import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎤 [MiniMax TTS API] Starting TTS generation request');
    
    const { 
      text, 
      voice_setting,
      audio_setting,
      language_boost,
      output_format,
      pronunciation_dict
    } = await request.json();

    console.log('📋 [MiniMax TTS API] Request parameters:', {
      text: text?.substring(0, 100) + '...',
      voice_setting,
      audio_setting,
      language_boost,
      output_format,
      has_pronunciation_dict: !!pronunciation_dict
    });

    // Validate required parameters
    if (!text) {
      console.error('❌ [MiniMax TTS API] Missing text');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!voice_setting?.voice_id) {
      console.error('❌ [MiniMax TTS API] Missing voice_id');
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    // Build input object with only provided parameters
    const input: any = {
      text: text.trim(),
      voice_setting: {
        voice_id: voice_setting.voice_id,
        speed: voice_setting.speed || 1,
        vol: voice_setting.vol || 1,
        pitch: voice_setting.pitch || 0,
        english_normalization: voice_setting.english_normalization || false
      }
    };

    // Add optional parameters only if they are provided
    if (audio_setting) {
      input.audio_setting = {
        sample_rate: audio_setting.sample_rate || "32000",
        bitrate: audio_setting.bitrate || "128000",
        format: audio_setting.format || "mp3",
        channel: audio_setting.channel || "1"
      };
    }

    if (language_boost) input.language_boost = language_boost;
    if (output_format) input.output_format = output_format;
    if (pronunciation_dict) input.pronunciation_dict = pronunciation_dict;

    console.log('🎯 [MiniMax TTS API] Calling FAL.AI with input:', input);

    const result = await fal.subscribe("fal-ai/minimax/preview/speech-2.5-hd", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ [MiniMax TTS API] Generation completed successfully');
    console.log('📦 [MiniMax TTS API] Result:', result);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      audioUrl: result.data?.audio?.url,
      duration: result.data?.duration_ms,
    });

  } catch (error) {
    console.error('❌ [MiniMax TTS API] Generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
