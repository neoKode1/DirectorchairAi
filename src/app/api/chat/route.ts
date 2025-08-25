import { NextRequest, NextResponse } from 'next/server';
import { claudeAPI } from '@/lib/claude-api';

export async function POST(request: NextRequest) {
  try {
    const { userInput, conversationHistory } = await request.json();

    console.log('🤖 [Chat API] Received request:', { userInput, historyLength: conversationHistory?.length });

    // Generate Claude AI response using traditional API
    const response = await claudeAPI.generateConversationalResponse(userInput, conversationHistory || []);

    console.log('✅ [Chat API] Generated response length:', response.length);

    return NextResponse.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('❌ [Chat API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 