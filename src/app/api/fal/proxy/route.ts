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
    
    // Call the original route handler
    const response = await route.POST(request);
    
    console.log('📊 [FAL Proxy] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Proxy request failed' }));
      console.error('❌ [FAL Proxy] Error response:', errorData);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [FAL Proxy] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    return await route.GET(request);
  } catch (error) {
    console.error('❌ [FAL Proxy] GET request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
