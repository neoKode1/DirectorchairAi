import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [Test Generation] Testing generation endpoint');
    
    const body = await request.json();
    console.log('🧪 [Test Generation] Request body:', body);
    
    // Test the unified generate endpoint
    const testUrl = new URL(request.url);
    testUrl.pathname = '/api/generate';
    
    const testRequest = new NextRequest(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries())
      },
      body: JSON.stringify(body)
    });

    console.log('🧪 [Test Generation] Calling unified generate endpoint...');
    const response = await fetch(testRequest);
    const result = await response.json();
    
    console.log('🧪 [Test Generation] Response status:', response.status);
    console.log('🧪 [Test Generation] Response:', result);
    
    return NextResponse.json({
      success: true,
      testResult: result,
      status: response.status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [Test Generation] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
