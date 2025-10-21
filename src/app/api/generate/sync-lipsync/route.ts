import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('🎬 [Sync LipSync API] Starting sync lip sync request');
    const {
      model,
      video_url,
      audio_url,
      sync_mode
    } = await request.json();

    // Validate required parameters
    if (!video_url) {
      console.error('❌ [Sync LipSync API] Missing video_url');
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    if (!audio_url) {
      console.error('❌ [Sync LipSync API] Missing audio_url');
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Build input object with all parameters
    const input: any = {
      video_url: video_url.trim(),
      audio_url: audio_url.trim()
    };

    // Add optional parameters if provided
    if (model) {
      // Validate model is one of the supported versions
      const validModels = ["lipsync-1.9.0-beta", "lipsync-1.8.0", "lipsync-1.7.1"];
      if (!validModels.includes(model)) {
        console.error('❌ [Sync LipSync API] Invalid model:', model);
        return NextResponse.json(
          { error: `Invalid model. Must be one of: ${validModels.join(', ')}` },
          { status: 400 }
        );
      }
      input.model = model;
    }

    if (sync_mode) {
      // Validate sync_mode is one of the supported modes
      const validSyncModes = ["cut_off", "loop", "bounce", "silence", "remap"];
      if (!validSyncModes.includes(sync_mode)) {
        console.error('❌ [Sync LipSync API] Invalid sync_mode:', sync_mode);
        return NextResponse.json(
          { error: `Invalid sync_mode. Must be one of: ${validSyncModes.join(', ')}` },
          { status: 400 }
        );
      }
      input.sync_mode = sync_mode;
    }

    console.log('🎬 [Sync LipSync API] Input parameters:', input);

    const result = await fal.subscribe("fal-ai/sync-lipsync", {
      input,
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log: any) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ [Sync LipSync API] Generation completed:', result);

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
      videoUrl: result.data?.video?.url,
    });

  } catch (error) {
    console.error('❌ [Sync LipSync API] Sync lip sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'Failed to generate sync lip sync',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
