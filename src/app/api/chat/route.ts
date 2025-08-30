import { NextRequest, NextResponse } from 'next/server';
import { claudeAPI } from '@/lib/claude-api';

// Request size limit (2MB for chat requests)
const MAX_REQUEST_SIZE = 2 * 1024 * 1024;
const MAX_INPUT_LENGTH = 4000; // Maximum characters for user input
const MAX_HISTORY_ITEMS = 50; // Maximum conversation history items

export async function POST(request: NextRequest) {
  try {
    // Check content length before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json({
        success: false,
        error: 'Request too large. Maximum size is 2MB.'
      }, { status: 413 });
    }

    const body = await request.json();
    const { userInput, conversationHistory } = body;

    // Validate required input
    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'userInput is required and must be a string'
      }, { status: 400 });
    }

    // Validate input length
    if (userInput.length > MAX_INPUT_LENGTH) {
      return NextResponse.json({
        success: false,
        error: `Input too long. Maximum length is ${MAX_INPUT_LENGTH} characters.`
      }, { status: 400 });
    }

    // Validate conversation history
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return NextResponse.json({
        success: false,
        error: 'conversationHistory must be an array'
      }, { status: 400 });
    }

    // Limit conversation history size
    const limitedHistory = conversationHistory ? 
      conversationHistory.slice(-MAX_HISTORY_ITEMS) : [];

    console.log('🤖 [Chat API] Received request:', { 
      userInputLength: userInput.length, 
      historyLength: limitedHistory.length 
    });

    // Generate Claude AI response with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await claudeAPI.generateConversationalResponse(
        userInput.trim(), 
        limitedHistory
      );
      
      clearTimeout(timeout);
      
      console.log('✅ [Chat API] Generated response length:', response.length);

      return NextResponse.json({
        success: true,
        response: response
      });
      
    } catch (apiError) {
      clearTimeout(timeout);
      throw apiError;
    }

  } catch (error) {
    console.error('❌ [Chat API] Error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    if ((error as any).name === 'AbortError') {
      return NextResponse.json({
        success: false,
        error: 'Request timed out'
      }, { status: 408 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 