import { NextRequest, NextResponse } from "next/server";

// Simplified generate route that routes to dedicated FAL proxies
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('🔍 [Generate API] Request received:', {
      model: body.model,
      prompt: body.prompt?.substring(0, 100) + '...',
      hasImage: !!body.image_url
    });

    // Extract model and prompt - these are required
    const model = body.model || body.endpoint || body.endpointId;
    const prompt = body.prompt;
    
    if (!model) {
      console.error('❌ [Generate API] Missing model parameter');
      return NextResponse.json({ 
        success: false,
        error: "Model parameter is required" 
      }, { status: 400 });
    }

    if (!prompt) {
      console.error('❌ [Generate API] Missing prompt parameter');
      return NextResponse.json({ 
        success: false,
        error: "Prompt parameter is required" 
      }, { status: 400 });
    }

    // Determine if this is a video or image generation request
    const isVideoModel = model.includes('video') || 
                        model.includes('veo') || 
                        model.includes('kling') || 
                        model.includes('luma') || 
                        model.includes('minimax') ||
                        model.includes('seedance');

    const isImageModel = model.includes('flux') || 
                        model.includes('imagen') || 
                        model.includes('stable-diffusion') || 
                        model.includes('dreamina') ||
                        model.includes('ideogram');

    // Route to appropriate proxy
    let targetEndpoint: string;
    
    if (isVideoModel) {
      targetEndpoint = '/api/fal/video';
      console.log('🎬 [Generate API] Routing to video proxy');
    } else if (isImageModel) {
      targetEndpoint = '/api/fal/image';
      console.log('🖼️ [Generate API] Routing to image proxy');
    } else {
      // Default to image proxy for unknown models
      targetEndpoint = '/api/fal/image';
      console.log('🖼️ [Generate API] Unknown model type, defaulting to image proxy');
    }

    // Create request for the appropriate proxy
    const proxyUrl = new URL(request.url);
    proxyUrl.pathname = targetEndpoint;
    
    const proxyRequest = new NextRequest(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries())
      },
      body: JSON.stringify(body)
    });

    console.log('🔗 [Generate API] Forwarding to:', targetEndpoint);

    // Call the appropriate proxy with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
      const proxyResponse = await fetch(proxyRequest, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const result = await proxyResponse.json();
    
      if (!proxyResponse.ok) {
        console.error('❌ [Generate API] Proxy error:', result);
        return NextResponse.json({
          success: false,
          error: result.error || 'Generation failed',
          details: result.details
        }, { status: proxyResponse.status });
      }

      console.log('✅ [Generate API] Generation successful');
      return NextResponse.json(result);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('❌ [Generate API] Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Generation timeout',
          details: 'The generation request took too long and was cancelled. Please try again with a simpler prompt or different model.',
          model: model,
          prompt: prompt
        }, { status: 408 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Network error',
        details: fetchError.message || 'Failed to connect to generation service',
        model: model,
        prompt: prompt
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [Generate API] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process generation request",
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
