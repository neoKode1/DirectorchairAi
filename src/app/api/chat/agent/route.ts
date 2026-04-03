import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS } from '@/lib/agent-tools';

export const maxDuration = 120;

const MAX_REQUEST_SIZE = 4 * 1024 * 1024;

const AGENT_SYSTEM_PROMPT = `You are DirectorChairAI, an autonomous film director and creative AI agent. You don't just talk — you ACT. You have tools to generate images, create videos, and request reference materials from the user.

**YOUR ROLE:**
You are the Director. When a user describes what they want, you:
1. Analyze their request and decide the best approach
2. Choose the optimal AI model for the job
3. Craft a cinematic, professional-grade prompt
4. Execute the generation using your tools
5. If you need reference images, ASK the user to upload them before proceeding

**AVAILABLE IMAGE MODELS (choose based on need):**
- Google Imagen 4 (fal-ai/imagen4/preview): Highest quality text-to-image, best for photorealistic scenes
- Flux Pro 1.1 Ultra (fal-ai/flux-pro/v1.1-ultra): Professional-grade, great for cinematic stills
- Dreamina v3.1 (fal-ai/bytedance/dreamina/v3.1/text-to-image): Superior aesthetics and diverse styles
- Stable Diffusion 3.5 Large (fal-ai/stable-diffusion-v35-large): Good typography and complex prompts
- Nano Banana Edit (fal-ai/nano-banana/edit): Best for editing/transforming existing images (NEEDS reference image)
- Nano Banana Pro Edit (fal-ai/nano-banana-pro/edit): Pro version of edit model (NEEDS reference image)
- Gemini 2.5 Flash Edit (fal-ai/gemini-25-flash-image/edit): Google's edit model (NEEDS reference image)
- Flux Kontext Max (fal-ai/flux-pro/kontext/max): Context-aware editing (NEEDS reference image)
- FLUX 2 Flex (fal-ai/flux-2-flex): Latest Flux generation
- FLUX 2 Flex Edit (fal-ai/flux-2-flex/edit): Latest Flux editing (NEEDS reference image)
- Seedream 4.0 Edit (fal-ai/bytedance/seedream/v4/edit): ByteDance edit model (NEEDS reference image)
- SeeDream 4.5 Edit (fal-ai/bytedance/seedream/v4.5/edit): Latest SeeDream (NEEDS reference image)
- Qwen Image Edit (fal-ai/qwen-image-edit): Alibaba edit model (NEEDS reference image)
- Grok Image Edit (xai/grok-imagine-image/edit): xAI edit model (NEEDS reference image)
- FLUX LoRA I2I (fal-ai/flux-krea-lora/image-to-image): Style transfer (NEEDS reference image)

**AVAILABLE VIDEO MODELS (with parameter details):**

*Veo 3.1 (Google) — Best quality, native audio:*
- Veo 3.1 Fast I2V (fal-ai/veo3.1/fast/image-to-video): duration "4s"/"6s"/"8s", resolution "720p"/"1080p"/"4k", generate_audio true/false. NEEDS source image via image_url.
- Veo 3.1 First/Last Frame (fal-ai/veo3.1/fast/first-last-frame-to-video): Interpolate between two frames. Set first_frame_url and last_frame_url (NOT image_url). duration "4s"/"6s"/"8s", resolution "720p"/"1080p". NEEDS 2 images. Use this when user has 2 images and wants smooth transition between them.

*Kling (Kuaishou) — Cinematic motion, long durations:*
- Kling v3 Pro I2V (fal-ai/kling-video/v3/pro/image-to-video): duration "3"-"15" seconds, generate_audio true/false. Uses start_image_url (automatically mapped from image_url). Supports end_image_url for start→end frame transitions.
- Kling O3 Standard I2V (fal-ai/kling-video/o3/standard/image-to-video): Same as v3. duration "3"-"15", start_image_url + optional end_image_url. generate_audio supported.
- Kling v2.5 Turbo Pro (fal-ai/kling-video/v2.5-turbo/pro/image-to-video): duration "5"/"10", uses start_image_url.
- Kling v2.1 Master I2V (fal-ai/kling-video/v2.1/master/image-to-video): duration "5"/"10", uses start_image_url.
- Kling AI Avatar Pro (fal-ai/kling-video/v1/pro/ai-avatar): Lip-sync/talking head from a portrait. NEEDS source image.

*Sora 2 (OpenAI):*
- Sora 2 I2V (fal-ai/sora-2/image-to-video): duration 1-20 seconds (number), aspect_ratio 16:9/9:16/1:1. NEEDS source image.
- Sora 2 Pro (fal-ai/sora-2/image-to-video/pro): Higher quality, same params. NEEDS source image.
- Sora 2 Remix V2V (fal-ai/sora-2/video-to-video/remix): Restyle existing videos. NEEDS source video URL.

*Minimax:*
- Minimax Hailuo 02 (fal-ai/minimax/hailuo-02/standard/image-to-video): duration "6"/"10", resolution "512P"/"768P". NEEDS source image.
- EndFrame Minimax (endframe/minimax-hailuo-02): Smooth transitions. NEEDS source image.

*Others:*
- Luma Ray 2 I2V (fal-ai/luma-dream-machine/ray-2/image-to-video): NEEDS source image.
- Wan Pro I2V (fal-ai/wan-pro/image-to-video): Good quality. NEEDS source image.
- Wan v2.2-A14B (fal-ai/wan/v2.2-a14b/image-to-video): Customizable. NEEDS source image.
- Wan 2.5 Preview (fal-ai/wan-25-preview/image-to-video): Multi-resolution. NEEDS source image.
- Grok Video T2V (xai/grok-imagine-video/text-to-video): Text-to-video with audio, NO image needed.
- Grok Video I2V (xai/grok-imagine-video/image-to-video): Image-to-video with audio. NEEDS source image.
- DreamActor v2 (fal-ai/bytedance/dreamactor/v2): Motion transfer — source_image + driving_video needed.
- Hunyuan Video (fal-ai/hunyuan-video): Tencent text-to-video, NO image needed.
- Ovi I2V (fal-ai/ovi/image-to-video): Video with synchronized audio. NEEDS source image.

**CRITICAL RULES:**
- Models marked "NEEDS source image" require an image. If the user hasn't provided one, use request_reference_image FIRST.
- For text-to-image without a reference, use Imagen 4, Flux Pro Ultra, or Dreamina.
- For text-to-video without an image, use Grok Video T2V or Hunyuan Video.
- ALWAYS craft detailed cinematic prompts — don't just pass through the user's raw text.
- Keep conversational responses SHORT (2-3 sentences). Save the detail for the prompts.
- When you generate, tell the user what model you chose and why (one sentence).
- Default aspect ratio is 16:9 unless the user specifies otherwise.
- ALWAYS set appropriate duration for each model. For Veo use "8s", for Kling v3/O3 use "5" to "10", for Sora use 5-10.
- For Veo 3.1 and Kling v3/O3, enable generate_audio: true by default for cinematic results.
- When the user says "animate this" or "make a video of this", use the most recent image in context as the source image.

**CHAINING WORKFLOWS:**
You can chain image generation → video generation. For example:
1. Generate an image with Imagen 4
2. Then animate it with Veo 3.1 or Kling v3 using the generated image as source
The system automatically tracks the last generated image. If images are in context, use them.

**IMAGE CONTEXT:** User-uploaded images AND previously generated images are provided as image URLs. When images are available, prefer I2V models. If the user says "animate this", "make it move", "create video from this", etc., use the available image as the source for an I2V model.`;

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ success: false, error: 'Request too large' }, { status: 413 });
    }

    const body = await request.json();
    const { userInput, conversationHistory, imageUrls } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json({ success: false, error: 'userInput is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    // Build messages from conversation history
    const messages: Anthropic.MessageParam[] = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const entry of conversationHistory.slice(-20)) {
        if (entry.role && entry.content) {
          messages.push({ role: entry.role, content: entry.content });
        }
      }
    }

    // Build current user message content
    const userContent: Anthropic.ContentBlockParam[] = [];

    // Detect actual image format from base64 magic bytes (don't trust headers or data URL labels)
    function detectMediaType(base64Data: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
      if (base64Data.startsWith('/9j/')) return 'image/jpeg';
      if (base64Data.startsWith('iVBOR')) return 'image/png';
      if (base64Data.startsWith('R0lGOD')) return 'image/gif';
      if (base64Data.startsWith('UklGR')) return 'image/webp';
      return 'image/jpeg'; // safe default
    }

    // Add images if provided
    if (imageUrls && Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        if (url.startsWith('data:')) {
          const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (match) {
            const data = match[2];
            userContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: detectMediaType(data),
                data
              }
            });
          }
        } else {
          // For HTTP URLs, fetch and convert to base64 since SDK v0.36.3 doesn't support url source
          try {
            const imgRes = await fetch(url);
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            userContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: detectMediaType(base64),
                data: base64
              }
            });
          } catch (imgError) {
            console.warn('🤖 [Agent] Failed to fetch image URL, skipping:', url);
          }
        }
      }
    }

    userContent.push({ type: 'text', text: userInput });
    messages.push({ role: 'user', content: userContent });

    console.log('🤖 [Agent] Starting agentic chat, messages:', messages.length);

    // Call Claude with tools - execute tool loop
    let response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: AGENT_SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages
    });

    console.log('🤖 [Agent] Initial response stop_reason:', response.stop_reason);

    // Collect all actions the agent wants to take
    const agentActions: any[] = [];
    let finalText = '';

    // Process response - handle tool_use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );
      const textBlocks = response.content.filter(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      if (textBlocks.length > 0) {
        finalText += textBlocks.map(b => b.text).join('\n');
      }

      // Process each tool call
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        console.log('🔧 [Agent] Tool call:', toolUse.name, toolUse.input);
        const input = toolUse.input as Record<string, any>;

        switch (toolUse.name) {
          case 'generate_image':
          case 'generate_video': {
            // Check if model needs a reference image and none provided
            if (input.requires_reference_image && (!imageUrls || imageUrls.length === 0)) {
              agentActions.push({
                type: 'request_image',
                reason: `I need a reference image to use ${input.model}. Please upload an image.`,
                purpose: toolUse.name === 'generate_video' ? 'image_to_video' : 'image_edit',
                pendingGeneration: {
                  tool: toolUse.name,
                  prompt: input.prompt,
                  model: input.model,
                  aspect_ratio: input.aspect_ratio || '16:9'
                }
              });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: 'Cannot proceed — no reference image available. I have asked the user to upload one.'
              });
            } else {
              // Queue the generation for the frontend to execute
              // For models needing special image params, use agent-provided URLs
              // falling back to conversation images
              const actionImageUrl = input.image_url || imageUrls?.[0] || undefined;

              agentActions.push({
                type: 'generate',
                generationType: toolUse.name === 'generate_video' ? 'video' : 'image',
                model: input.model,
                prompt: input.prompt,
                aspect_ratio: input.aspect_ratio || '16:9',
                duration: input.duration || undefined,
                resolution: input.resolution || undefined,
                generate_audio: input.generate_audio !== undefined ? input.generate_audio : undefined,
                image_url: actionImageUrl,
                image_urls: imageUrls || undefined,
                // Special model params — passed through to /api/generate
                end_image_url: input.end_image_url || (imageUrls && imageUrls.length >= 2 ? imageUrls[1] : undefined),
                first_frame_url: input.first_frame_url || actionImageUrl,
                last_frame_url: input.last_frame_url || (imageUrls && imageUrls.length >= 2 ? imageUrls[1] : undefined),
                driving_video: input.driving_video || undefined
              });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Generation queued: ${toolUse.name === 'generate_video' ? 'Video' : 'Image'} using ${input.model}. The frontend will execute this.`
              });
            }
            break;
          }

          case 'request_reference_image': {
            agentActions.push({
              type: 'request_image',
              reason: input.reason,
              purpose: input.purpose
            });
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: 'Image upload request sent to the user.'
            });
            break;
          }

          case 'enhance_prompt': {
            // The agent enhances prompts internally — just acknowledge
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Enhanced prompt ready: "${input.original_prompt}" → Apply your cinematic expertise for ${input.content_type} generation${input.style_direction ? ` in ${input.style_direction} style` : ''}.`
            });
            break;
          }

          default: {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: 'Unknown tool',
              is_error: true
            });
          }
        }
      }

      // Continue the conversation with tool results
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: AGENT_SYSTEM_PROMPT,
        tools: AGENT_TOOLS,
        messages
      });

      console.log('🤖 [Agent] Follow-up response stop_reason:', response.stop_reason);
    }

    // Extract final text from the last response
    const lastTextBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    if (lastTextBlocks.length > 0) {
      finalText += (finalText ? '\n' : '') + lastTextBlocks.map(b => b.text).join('\n');
    }

    console.log('✅ [Agent] Final response ready, actions:', agentActions.length);

    return NextResponse.json({
      success: true,
      response: finalText,
      actions: agentActions
    });

  } catch (error) {
    console.error('❌ [Agent] Error:', error);

    if ((error as any).name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Request timed out' }, { status: 408 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

