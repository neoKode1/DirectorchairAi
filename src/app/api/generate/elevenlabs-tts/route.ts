import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎤 [ElevenLabs TTS API] Starting TTS generation request');
    
    const { 
      text, 
      voice, 
      stability, 
      similarity_boost, 
      style, 
      speed, 
      timestamps, 
      previous_text, 
      next_text, 
      language_code 
    } = await request.json();

    console.log('📋 [ElevenLabs TTS API] Request parameters:', {
      text: text?.substring(0, 100) + '...',
      voice,
      stability,
      similarity_boost,
      style,
      speed,
      timestamps,
      has_previous_text: !!previous_text,
      has_next_text: !!next_text,
      language_code
    });

    // Validate required parameters
    if (!text) {
      console.error('❌ [ElevenLabs TTS API] Missing text');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!voice) {
      console.error('❌ [ElevenLabs TTS API] Missing voice');
      return NextResponse.json(
        { error: 'Voice is required' },
        { status: 400 }
      );
    }

    // Build input object with only provided parameters
    const input: any = {
      text: text.trim(),
      voice,
    };

    // Add optional parameters only if they are provided
    if (stability !== undefined) input.stability = stability;
    if (similarity_boost !== undefined) input.similarity_boost = similarity_boost;
    if (style !== undefined) input.style = style;
    if (speed !== undefined) input.speed = speed;
    if (timestamps !== undefined) input.timestamps = timestamps;
    if (previous_text) input.previous_text = previous_text;
    if (next_text) input.next_text = next_text;
    if (language_code) input.language_code = language_code;

    console.log('🎯 [ElevenLabs TTS API] Calling FAL.AI with input:', input);

    const result = await fal.subscribe("fal-ai/elevenlabs/tts/multilingual-v2", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ [ElevenLabs TTS API] Generation completed successfully');
    console.log('📦 [ElevenLabs TTS API] Result:', result);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      audioUrl: result.data?.audio?.url,
    });

  } catch (error) {
    console.error('❌ [ElevenLabs TTS API] Generation error:', error);
    
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
