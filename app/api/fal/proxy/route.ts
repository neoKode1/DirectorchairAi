import { route } from "@fal-ai/server-proxy/nextjs";
import { NextRequest, NextResponse } from "next/server";

// Check if FAL_KEY is available
if (!process.env.FAL_KEY) {
  console.error('❌ [FAL Proxy] FAL_KEY environment variable is not set');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔗 [FAL Proxy] Request received');
    console.log('🔗 [FAL Proxy] FAL_KEY available:', !!process.env.FAL_KEY);
    console.log('🔗 [FAL Proxy] Request URL:', request.url);
    console.log('🔗 [FAL Proxy] Request method:', request.method);
    console.log('🔗 [FAL Proxy] Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Call the original route handler
    const response = await route.POST(request);
    
    console.log('📊 [FAL Proxy] Response status:', response.status);
    console.log('📊 [FAL Proxy] Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Clone the response body to avoid 'disturbed or locked' error
    const responseBody = response.body ? await response.clone().text() : null;
    
    if (!response.ok) {
      console.error('❌ [FAL Proxy] Error response status:', response.status);
      console.error('❌ [FAL Proxy] Error response body:', responseBody);
    }
    
    // Convert Response to NextResponse
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    return nextResponse;
  } catch (error) {
    console.error('❌ [FAL Proxy] Unexpected error:', error);
    console.error('❌ [FAL Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ [FAL Proxy] Error name:', error instanceof Error ? error.name : 'Unknown error type');
    
    return NextResponse.json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const response = await route.GET(request);
    
    // Clone the response body to avoid 'disturbed or locked' error
    const responseBody = response.body ? await response.clone().text() : null;
    
    // Convert Response to NextResponse
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    return nextResponse;
  } catch (error) {
    console.error('❌ [FAL Proxy] GET request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
