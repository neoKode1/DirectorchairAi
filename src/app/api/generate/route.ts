import { NextRequest, NextResponse } from "next/server";

// Simplified generate route that routes to dedicated FAL proxies
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`🔍 [Generate API] ===== GENERATION REQUEST START [${requestId}] =====`);
    console.log(`🔍 [Generate API] Timestamp: ${new Date().toISOString()}`);
    
    const body = await request.json();
    console.log(`🔍 [Generate API] [${requestId}] Request received:`, {
      model: body.model,
      prompt: body.prompt?.substring(0, 100) + '...',
      hasImage: !!body.image_url,
      imageUrl: body.image_url,
      aspectRatio: body.aspect_ratio,
      duration: body.duration,
      resolution: body.resolution,
      allKeys: Object.keys(body)
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
    
    console.log(`🔍 [Generate API] [${requestId}] Model classification:`, {
      model: model,
      isVideoModel: isVideoModel,
      isImageModel: isImageModel,
      videoKeywords: ['video', 'veo', 'kling', 'luma', 'minimax', 'seedance'].filter(keyword => model.includes(keyword)),
      imageKeywords: ['flux', 'imagen', 'stable-diffusion', 'dreamina', 'ideogram'].filter(keyword => model.includes(keyword))
    });

    // Route to appropriate proxy
    let targetEndpoint: string;
    
    if (isVideoModel) {
      targetEndpoint = '/api/fal/video';
      console.log(`🎬 [Generate API] [${requestId}] Routing to video proxy`);
    } else if (isImageModel) {
      targetEndpoint = '/api/fal/image';
      console.log(`🖼️ [Generate API] [${requestId}] Routing to image proxy`);
    } else {
      // Default to image proxy for unknown models
      targetEndpoint = '/api/fal/image';
      console.log(`🖼️ [Generate API] [${requestId}] Unknown model type, defaulting to image proxy`);
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

    console.log(`🔗 [Generate API] [${requestId}] Forwarding to:`, targetEndpoint);
    console.log(`🔗 [Generate API] [${requestId}] Proxy request start time:`, new Date().toISOString());

    // Call the appropriate proxy with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
      const proxyResponse = await fetch(proxyRequest, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const result = await proxyResponse.json();
      
      const proxyEndTime = Date.now();
      const proxyDuration = proxyEndTime - startTime;
    
      if (!proxyResponse.ok) {
        console.error(`❌ [Generate API] [${requestId}] Proxy error:`, {
          status: proxyResponse.status,
          result: result,
          duration: proxyDuration
        });
        return NextResponse.json({
          success: false,
          error: result.error || 'Generation failed',
          details: result.details,
          requestId: requestId,
          duration: proxyDuration
        }, { status: proxyResponse.status });
      }

      console.log(`✅ [Generate API] [${requestId}] Generation successful`);
      console.log(`✅ [Generate API] [${requestId}] Total duration: ${proxyDuration}ms`);
      console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST COMPLETED =====`);
      
      return NextResponse.json({
        ...result,
        requestId: requestId,
        duration: proxyDuration
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ [Generate API] [${requestId}] Fetch error:`, {
        error: fetchError.message,
        name: fetchError.name,
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      if (fetchError.name === 'AbortError') {
        console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST TIMEOUT =====`);
        return NextResponse.json({
          success: false,
          error: 'Generation timeout',
          details: 'The generation request took too long and was cancelled. Please try again with a simpler prompt or different model.',
          model: model,
          prompt: prompt,
          requestId: requestId,
          duration: duration
        }, { status: 408 });
      }
      
      console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST FAILED =====`);
      return NextResponse.json({
        success: false,
        error: 'Network error',
        details: fetchError.message || 'Failed to connect to generation service',
        model: model,
        prompt: prompt,
        requestId: requestId,
        duration: duration
      }, { status: 500 });
    }

  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ [Generate API] [${requestId}] General error:`, {
      error: error.message,
      stack: error.stack,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🔍 [Generate API] [${requestId}] ===== GENERATION REQUEST ERROR =====`);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process generation request",
      details: error.message || 'Unknown error',
      requestId: requestId,
      duration: duration,
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
