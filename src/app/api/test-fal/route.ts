import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [Test FAL] Testing FAL configuration');
    
    // Check if FAL_KEY is available
    if (!process.env.FAL_KEY) {
      console.error('❌ [Test FAL] FAL_KEY environment variable is not set');
      return NextResponse.json({
        success: false,
        error: 'FAL_KEY environment variable is not set',
        falKeyAvailable: false
      }, { status: 500 });
    }
    
    console.log('✅ [Test FAL] FAL_KEY is available');
    console.log('🔑 [Test FAL] FAL_KEY prefix:', process.env.FAL_KEY.substring(0, 8) + '...');
    
    // Test a simple FAL API call
    try {
      console.log('🧪 [Test FAL] Testing FAL API connectivity...');
      
      // Try to get model info for Veo3
      const modelInfo = await fal.run("fal-ai/veo3/image-to-video", {
        input: {
          prompt: "test",
          aspect_ratio: "16:9",
          duration: "1s",
          resolution: "720p"
        }
      });
      
      console.log('✅ [Test FAL] FAL API test successful');
      
      return NextResponse.json({
        success: true,
        falKeyAvailable: true,
        falKeyPrefix: process.env.FAL_KEY.substring(0, 8) + '...',
        message: 'FAL configuration is working correctly'
      });
      
    } catch (falError: any) {
      console.error('❌ [Test FAL] FAL API test failed:', falError);
      
      return NextResponse.json({
        success: false,
        falKeyAvailable: true,
        falKeyPrefix: process.env.FAL_KEY.substring(0, 8) + '...',
        error: 'FAL API test failed',
        details: falError.message || 'Unknown FAL error'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ [Test FAL] Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
