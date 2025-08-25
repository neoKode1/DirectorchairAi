import { NextRequest, NextResponse } from "next/server";
import { getAvailableModels, getCurrentModel, refreshModelCache } from "@/lib/anthropic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'refresh') {
      console.log('🔄 [API] Refreshing model cache...');
      refreshModelCache();
      return NextResponse.json({ 
        message: "Model cache refreshed",
        success: true 
      });
    }

    if (action === 'current') {
      const currentModel = getCurrentModel();
      return NextResponse.json({ 
        currentModel,
        success: true 
      });
    }

    // Default: get all available models
    console.log('📋 [API] Fetching available models...');
    const models = await getAvailableModels();
    
    return NextResponse.json({
      ...models,
      currentModel: getCurrentModel(),
      success: true
    });

  } catch (error: any) {
    console.error("❌ [API] Models error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch models",
        success: false 
      },
      { status: 500 }
    );
  }
}
