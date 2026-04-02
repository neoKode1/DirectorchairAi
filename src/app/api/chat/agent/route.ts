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

**AVAILABLE VIDEO MODELS:**
- Sora 2 I2V (fal-ai/sora-2/image-to-video): OpenAI's video model, great quality (NEEDS source image)
- Sora 2 Pro (fal-ai/sora-2/image-to-video/pro): Higher quality Sora (NEEDS source image)
- Veo 3.1 Fast I2V (fal-ai/veo3.1/fast/image-to-video): Google's latest, exceptional quality (NEEDS source image)
- Kling v3 Pro I2V (fal-ai/kling-video/v3/pro/image-to-video): Enhanced motion realism (NEEDS source image)
- Kling v2.1 Master I2V (fal-ai/kling-video/v2.1/master/image-to-video): Professional quality (NEEDS source image)
- Minimax Hailuo 02 I2V (fal-ai/minimax/hailuo-02/standard/image-to-video): High quality I2V (NEEDS source image)
- Luma Ray 2 I2V (fal-ai/luma-dream-machine/ray-2/image-to-video): Realistic visuals (NEEDS source image)
- Wan Pro I2V (fal-ai/wan-pro/image-to-video): Good quality I2V (NEEDS source image)
- Grok Video T2V (xai/grok-imagine-video/text-to-video): Text-to-video, no image needed
- Grok Video I2V (xai/grok-imagine-video/image-to-video): Image-to-video (NEEDS source image)
- Hunyuan Video (fal-ai/hunyuan-video): Tencent text-to-video
- Ovi I2V (fal-ai/ovi/image-to-video): Video with audio (NEEDS source image)

**CRITICAL RULES:**
- Models marked "NEEDS reference image" require an image. If the user hasn't provided one, use request_reference_image FIRST.
- For text-to-image requests without a reference, use Imagen 4, Flux Pro Ultra, or Dreamina.
- For text-to-video without an image, use Grok Video T2V or Hunyuan Video.
- ALWAYS craft detailed cinematic prompts — don't just pass through the user's raw text.
- Keep conversational responses SHORT (2-3 sentences). Save the detail for the prompts.
- When you generate, tell the user what model you chose and why (one sentence).
- Default aspect ratio is 16:9 unless the user specifies otherwise.

**CONTEXT:** The user's uploaded/injected images are provided as image URLs in the conversation. When images are available, prefer image-to-image or image-to-video models for best results.`;

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

    // Add images if provided
    if (imageUrls && Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        if (url.startsWith('data:')) {
          const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (match) {
            userContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: match[2]
              }
            });
          }
        } else {
          // For HTTP URLs, fetch and convert to base64 since SDK v0.36.3 doesn't support url source
          try {
            const imgRes = await fetch(url);
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            userContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: contentType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
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
              agentActions.push({
                type: 'generate',
                generationType: toolUse.name === 'generate_video' ? 'video' : 'image',
                model: input.model,
                prompt: input.prompt,
                aspect_ratio: input.aspect_ratio || '16:9',
                image_url: imageUrls?.[0] || undefined,
                image_urls: imageUrls || undefined
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

