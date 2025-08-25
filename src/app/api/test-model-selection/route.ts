import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceCore } from '@/lib/intelligence-core';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [Test Model Selection] Testing model selection');
    
    const body = await request.json();
    const { userInput, contentType = 'video', modelPreferences } = body;
    
    if (!userInput) {
      return NextResponse.json({
        success: false,
        error: 'userInput is required'
      }, { status: 400 });
    }
    
    console.log('🧪 [Test Model Selection] Input:', { userInput, contentType, modelPreferences });
    
    // Initialize intelligence core
    const intelligenceCore = new IntelligenceCore();
    
    // Set model preferences if provided
    if (modelPreferences) {
      console.log('🧪 [Test Model Selection] Setting model preferences:', modelPreferences);
      intelligenceCore.setModelPreferences(modelPreferences);
    }
    
    // Analyze user intent
    console.log('🧪 [Test Model Selection] Analyzing user intent...');
    const intent = await intelligenceCore.analyzeUserIntent(userInput, contentType);
    console.log('🧪 [Test Model Selection] Intent analysis result:', intent);
    
    // Select optimal model
    console.log('🧪 [Test Model Selection] Selecting optimal model...');
    const delegation = await intelligenceCore.selectOptimalModel(intent);
    console.log('🧪 [Test Model Selection] Model selection result:', delegation);
    
    return NextResponse.json({
      success: true,
      input: { userInput, contentType, modelPreferences },
      intent: intent,
      delegation: delegation,
      selectedModel: delegation ? {
        endpointId: delegation.modelId,
        label: delegation.label,
        category: delegation.category,
        reason: delegation.reason
      } : null
    });
    
  } catch (error: any) {
    console.error('❌ [Test Model Selection] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
