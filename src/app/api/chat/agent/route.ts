import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS } from '@/lib/agent-tools';

export const maxDuration = 120;

const MAX_REQUEST_SIZE = 4 * 1024 * 1024;

const AGENT_SYSTEM_PROMPT = `You are DirectorChairAI, an autonomous film director and creative AI agent.

**MANDATORY BEHAVIOR — YOU MUST FOLLOW THIS:**
- When a user asks you to create, generate, make, draw, produce, design, render, or build ANY image or video, you MUST call the generate_image or generate_video tool. NEVER just describe what you would do — ALWAYS call the tool.
- Do NOT ask for confirmation before generating. The user came here to generate content. Just do it.
- Do NOT explain what model you're going to use without also calling the tool in the same response.
- If the user gives you a prompt like "a samurai on a mountain" or "create a cinematic shot of...", that is a DIRECT ORDER to generate. Call the tool immediately.
- The ONLY time you should respond with text only (no tool call) is when the user asks a question, wants to have a conversation, or says something that clearly isn't a generation request.

**YOUR ROLE:**
You are the Director. When a user describes what they want, you:
1. Immediately choose the optimal AI model
2. Craft a cinematic, professional-grade prompt
3. Call generate_image or generate_video RIGHT NOW — do not hesitate
4. If you need reference images, use request_reference_image to ask for them

**AVAILABLE IMAGE MODELS (choose based on need):**
- Google Imagen 4 (fal-ai/imagen4/preview): Highest quality text-to-image, best for photorealistic scenes
- Flux Pro 1.1 Ultra (fal-ai/flux-pro/v1.1-ultra): Professional-grade, great for cinematic stills
- Dreamina v3.1 (fal-ai/bytedance/dreamina/v3.1/text-to-image): Superior aesthetics and diverse styles
- Seedream 5.0 Lite (fal-ai/bytedance/seedream/v5/lite/text-to-image): Latest ByteDance text-to-image, high quality 2K output, great typography rendering. No reference image needed.
- Stable Diffusion 3.5 Large (fal-ai/stable-diffusion-v35-large): Good typography and complex prompts
- Nano Banana Edit (fal-ai/nano-banana/edit): Best for editing/transforming existing images (NEEDS reference image)
- Nano Banana Pro Edit (fal-ai/nano-banana-pro/edit): Pro version of edit model (NEEDS reference image)
- Gemini 2.5 Flash Edit (fal-ai/gemini-25-flash-image/edit): Google's edit model (NEEDS reference image)
- Flux Kontext Max (fal-ai/flux-pro/kontext/max): Context-aware editing (NEEDS reference image)
- FLUX 2 Flex (fal-ai/flux-2-flex): Latest Flux generation
- FLUX 2 Flex Edit (fal-ai/flux-2-flex/edit): Latest Flux editing (NEEDS reference image)
- Seedream 4.0 Edit (fal-ai/bytedance/seedream/v4/edit): ByteDance edit model (NEEDS reference image)
- Seedream 5.0 Lite Edit (fal-ai/bytedance/seedream/v5/lite/edit): Latest ByteDance multi-image editor. Accepts up to 10 input images via image_urls. Best for complex edits referencing multiple images (e.g. "replace product in Figure 1 with Figure 2, add logo from Figure 3"). NEEDS reference image(s).
- SeeDream 4.5 Edit (fal-ai/bytedance/seedream/v4.5/edit): Latest SeeDream (NEEDS reference image)
- Qwen Image Edit (fal-ai/qwen-image-edit): Alibaba edit model (NEEDS reference image)
- Grok Image Edit (xai/grok-imagine-image/edit): xAI edit model (NEEDS reference image)
- FLUX LoRA I2I (fal-ai/flux-krea-lora/image-to-image): Style transfer (NEEDS reference image)
- Wan 2.7 Edit (fal-ai/wan/v2.7/edit): Text-guided image editing, 1-4 reference images via image_urls. Reference as "image 1", "image 2" etc in prompt. Supports Chinese & English. (NEEDS reference image)
- Wan 2.7 Pro Edit (fal-ai/wan/v2.7/pro/edit): Premium version, precise professional-grade edits. Same params as Wan 2.7 Edit. (NEEDS reference image)
- Wan 2.7 Pro T2I (fal-ai/wan/v2.7/pro/text-to-image): Premium text-to-image, superior detail and composition. No reference image needed.

**AVAILABLE VIDEO MODELS (with parameter details):**

*Veo 3.1 (Google) — Best quality, native audio:*
- Veo 3.1 Fast I2V (fal-ai/veo3.1/fast/image-to-video): duration "4s"/"6s"/"8s", resolution "720p"/"1080p"/"4k", generate_audio true/false. NEEDS source image via image_url.
- Veo 3.1 First/Last Frame (fal-ai/veo3.1/fast/first-last-frame-to-video): Interpolate between two frames. Set first_frame_url and last_frame_url (NOT image_url). duration "4s"/"6s"/"8s", resolution "720p"/"1080p". NEEDS 2 images. Use this when user has 2 images and wants smooth transition between them.

*Kling (Kuaishou) — Cinematic motion, long durations:*
- Kling v2.6 Pro I2V (fal-ai/kling-video/v2.6/pro/image-to-video): Cinematic visuals, duration "5"/"10", generate_audio true (native audio with speech). Uses start_image_url. Supports end_image_url. Great for dialogue scenes — put speech in prompt with quotes.
- Kling v2.6 Motion Control Standard (fal-ai/kling-video/v2.6/standard/motion-control): Transfer movements from a reference VIDEO to an IMAGE. Requires image_url + video_url + character_orientation ("video" or "image"). "video" = orientation matches reference video (max 30s, better for complex motions). "image" = orientation matches reference image (max 10s, better for camera movements). NEEDS both source image AND reference video.
- Kling v2.6 Motion Control Pro (fal-ai/kling-video/v2.6/pro/motion-control): Same as Standard but higher quality output. Ideal for complex dance moves and gestures. NEEDS both source image AND reference video.
- Kling O1 Video Edit Pro (fal-ai/kling-video/o1/video-to-video/edit): Edit existing videos — replace subjects, settings, style while retaining motion. Reference @Element1/@Image1 in prompt. 3-10s input, 720-2160px. NEEDS source video.
- Kling O3 Video Edit Standard (fal-ai/kling-video/o3/standard/video-to-video/edit): Budget V2V editing with @refs, same features as Pro but cheaper ($0.126/s vs $0.168/s). NEEDS source video.
- Kling O3 Video Edit Pro (fal-ai/kling-video/o3/pro/video-to-video/edit): Edit existing videos with text prompts. Reference video as @Video1, images as @Image1/@Image2, character elements as @Element1. Supports keep_audio, image_urls for style refs, elements with frontal_image_url + reference_image_urls. NEEDS source video.
- Kling v3 Pro I2V (fal-ai/kling-video/v3/pro/image-to-video): duration "3"-"15" seconds, generate_audio true/false. Uses start_image_url (automatically mapped from image_url). Supports end_image_url for start→end frame transitions.
- Kling O3 Standard I2V (fal-ai/kling-video/o3/standard/image-to-video): Same as v3. duration "3"-"15", start_image_url + optional end_image_url. generate_audio supported.
- Kling v2.5 Turbo Pro (fal-ai/kling-video/v2.5-turbo/pro/image-to-video): duration "5"/"10", uses start_image_url.
- Kling v2.1 Master I2V (fal-ai/kling-video/v2.1/master/image-to-video): duration "5"/"10", uses start_image_url.
- Kling AI Avatar Pro (fal-ai/kling-video/v1/pro/ai-avatar): Lip-sync/talking head from a portrait. NEEDS source image.

*Sora 2 (OpenAI):*
- Sora 2 I2V (fal-ai/sora-2/image-to-video): duration 1-20 seconds (number), aspect_ratio 16:9/9:16. NEEDS source image.
- Sora 2 Pro (fal-ai/sora-2/image-to-video/pro): Higher quality, same params. NEEDS source image.
- Sora 2 Remix V2V (fal-ai/sora-2/video-to-video/remix): Restyle existing videos. NEEDS source video URL.

*Minimax:*
- Minimax Hailuo 02 (fal-ai/minimax/hailuo-02/standard/image-to-video): duration "6"/"10", resolution "512P"/"768P". NEEDS source image.
- Minimax Hailuo 2.3 (fal-ai/minimax/hailuo-2.3/standard/image-to-video): Latest Hailuo, 768p, duration "6"/"10". prompt_optimizer on by default. NEEDS source image.
- EndFrame Minimax (endframe/minimax-hailuo-02): Smooth transitions. NEEDS source image.

*Pixverse V6 — Style presets, long duration, audio:*
- Pixverse V6 I2V (fal-ai/pixverse/v6/image-to-video): duration 1-15 seconds (integer), resolution "360p"/"540p"/"720p"/"1080p", generate_audio true/false. Has style presets: "anime", "3d_animation", "clay", "comic", "cyberpunk". Supports multi-clip. NEEDS source image.

*Seedance (ByteDance) — Native audio, start+end frame:*
- Seedance 1.5 Pro I2V (fal-ai/bytedance/seedance/v1.5/pro/image-to-video): duration "4"-"12", resolution "480p"/"720p"/"1080p", generate_audio true/false, supports end_image_url. NEEDS source image. Great for dialogue/speech scenes with native audio.

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
- ALWAYS call a tool when the user wants content generated. NEVER respond with only text when a generation is requested.
- Models marked "NEEDS source image" require an image. If the user hasn't provided one, use request_reference_image FIRST.
- For text-to-image without a reference, use Imagen 4 (fal-ai/imagen4/preview) as default.
- For text-to-video without an image, use Grok Video T2V or Hunyuan Video.
- ALWAYS craft detailed cinematic prompts — don't just pass through the user's raw text.
- Keep text responses to 1-2 sentences MAX. Your job is to generate, not to talk.
- Default aspect ratio is 16:9 unless the user specifies otherwise.
- ALWAYS set appropriate duration for each model:
  • Veo 3.1: "8s" (valid: "4s"/"6s"/"8s")
  • Kling v3/O3 I2V: "5" to "10" (valid: "3"-"15")
  • Kling v2.6/v2.5/v2.1: "5" or "10"
  • Sora 2: 5-10 (number, max 20)
  • Hailuo 02/2.3: "6" or "10" (strings, NO "5")
  • Pixverse V6: 5 (integer 1-15)
  • Seedance 1.5: "5" (valid: "4"-"12")
  • Grok Video: 6 (number, max ~10)
  • Ovi I2V: 5 (number, max 10)
  • Hunyuan: 5 (number)
- For Veo 3.1, Kling v3/O3, Seedance, and Ovi, enable generate_audio: true by default.
- Grok Video resolution is LIMITED to "480p" or "720p" — NEVER send "1080p".
- Hailuo resolution is LIMITED to "512P" or "768P" (uppercase P) — NEVER send "1080p" or "720p".
- When the user says "animate this" or "make a video of this", use the most recent image in context as the source.

**CHAINING WORKFLOWS:**
You can chain image → video. Generate an image first, then animate it. The system tracks the last generated image automatically.

**MEDIA CONTEXT:** User-uploaded AND previously generated images are provided as image URLs. When images are available, prefer I2V models for video requests. If a video URL is provided, it means the user uploaded a reference video for V2V or motion transfer.

**MODEL/UPLOAD MISMATCH RULES — ENFORCE THESE:**
1. V2V Edit models (video-to-video/edit, remix) NEED a source video. If user selects a V2V model but only uploaded an image (no video), tell them: "You selected a video-to-video model but uploaded an image. Please upload an .mp4/.mov video (3-10 seconds, max 200MB) or switch to an I2V model."
2. Motion Control models NEED both a source image AND a reference video. If missing either, explain what's needed.
3. I2V models NEED a source image. If user only uploaded a video, tell them: "You selected an image-to-video model but uploaded a video. Please upload a reference image instead, or switch to a V2V model like Kling O3 Video Edit or Sora 2 Remix."
4. T2I/T2V models don't need uploads — but if the user provides media, acknowledge it and suggest a more appropriate model if relevant.
5. When the user uploads a video, prefer V2V or motion control models unless they explicitly ask for something else.
6. Video requirements for V2V models: .mp4/.mov only, 3-10 seconds, 720-2160px resolution, max 200MB.`;

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ success: false, error: 'Request too large' }, { status: 413 });
    }

    const body = await request.json();
    const { userInput, conversationHistory, imageUrls, videoUrl, userSettings } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json({ success: false, error: 'userInput is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 500 });
    }

    // Extract user's UI settings for defaults
    const userAspectRatio = userSettings?.aspectRatio || '16:9';
    const userResolution = userSettings?.resolution || '1080p';
    const userPreferredModel = userSettings?.preferredVideoModel || 'none';
    const userCreativeDirection = userSettings?.creativeDirection || 'cinematic';

    // ─── MODEL PARAMETER RESOLVER ───
    // Resolve what the selected model ACTUALLY accepts so the agent sends correct params.
    // The backend route.ts also clamps, but the agent should be smart from the start.
    type ModelParams = {
      validResolutions: string[];
      defaultResolution: string;
      validDurations: string[];
      defaultDuration: string;
      durationFormat: 'string' | 'number' | 'string_with_s';
      validAspectRatios: string[];
      supportsAudio: boolean;
      needsImage: boolean;
      needsVideo: boolean;
      notes: string;
    };

    const MODEL_PARAM_MAP: Record<string, ModelParams> = {
      // ── Veo 3.1 ──
      'veo3.1': { validResolutions: ['720p','1080p','4k'], defaultResolution: '720p', validDurations: ['4s','6s','8s'], defaultDuration: '8s', durationFormat: 'string_with_s', validAspectRatios: ['16:9','9:16','auto'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Duration MUST end with "s". First/last frame variant needs 2 images.' },
      'first-last-frame': { validResolutions: ['720p','1080p'], defaultResolution: '720p', validDurations: ['4s','6s','8s'], defaultDuration: '8s', durationFormat: 'string_with_s', validAspectRatios: ['16:9','9:16','auto'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Use first_frame_url and last_frame_url, NOT image_url.' },
      // ── Kling v3/O3 I2V ──
      'kling-video/v3': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['3','4','5','6','7','8','9','10','11','12','13','14','15'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Uses start_image_url (auto-mapped). Supports end_image_url.' },
      'kling-video/o3/standard/image': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['3','4','5','6','7','8','9','10','11','12','13','14','15'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Same as Kling v3.' },
      // ── Kling v2.6 I2V ──
      'kling-video/v2.6/pro/image': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5','10'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Great for dialogue — put speech in prompt with quotes.' },
      // ── Kling v2.5/v2.1 I2V ──
      'kling-video/v2.5': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5','10'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Uses start_image_url.' },
      'kling-video/v2.1': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5','10'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Uses start_image_url.' },
      // ── Kling V2V Edit ──
      'video-to-video/edit': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: [], supportsAudio: false, needsImage: false, needsVideo: true, notes: 'Do NOT send duration, resolution, or aspect_ratio. Use @Element1/@Image1 refs in prompt. keep_audio defaults to true.' },
      // ── Kling Motion Control ──
      'motion-control': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: [], supportsAudio: false, needsImage: true, needsVideo: true, notes: 'Needs image_url + video_url + character_orientation. Do NOT send duration.' },
      // ── Kling Avatar ──
      'ai-avatar': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5','10'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Lip-sync/talking head. Uses image_url directly (NOT start_image_url).' },
      // ── Sora 2 I2V ──
      'sora-2/image': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'], defaultDuration: '5', durationFormat: 'number', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Duration is a number 1-20.' },
      // ── Sora 2 Remix ──
      'sora-2/video-to-video': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'], defaultDuration: '5', durationFormat: 'number', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: false, needsVideo: true, notes: 'V2V remix — needs video_url. No image_url.' },
      // ── Hailuo 02/2.3 ──
      'hailuo': { validResolutions: ['512P','768P'], defaultResolution: '768P', validDurations: ['6','10'], defaultDuration: '6', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Resolution is UPPERCASE "P" (512P/768P). Duration "6" or "10" only — NEVER "5".' },
      'endframe': { validResolutions: ['512P','768P'], defaultResolution: '768P', validDurations: ['6','10'], defaultDuration: '6', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Same params as Hailuo.' },
      // ── Pixverse V6 ──
      'pixverse': { validResolutions: ['360p','540p','720p','1080p'], defaultResolution: '720p', validDurations: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'], defaultDuration: '5', durationFormat: 'number', validAspectRatios: [], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Duration is integer 1-15. No aspect_ratio — remove it. Uses generate_audio_switch.' },
      // ── Seedance 1.5 ──
      'seedance': { validResolutions: ['480p','720p','1080p'], defaultResolution: '720p', validDurations: ['4','5','6','7','8','9','10','11','12'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'Supports end_image_url for start→end frame transitions.' },
      // ── Grok Video ──
      'grok-imagine-video': { validResolutions: ['480p','720p'], defaultResolution: '720p', validDurations: ['3','4','5','6','7','8','9','10'], defaultDuration: '6', durationFormat: 'number', validAspectRatios: ['16:9','9:16'], supportsAudio: true, needsImage: false, needsVideo: false, notes: 'Max resolution 720p — NEVER 1080p. T2V needs no image. I2V needs image_url.' },
      // ── Luma Ray 2 ──
      'luma-dream-machine': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5','10'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16','4:3','3:4'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'Also supports 4:3 and 3:4 aspect ratios.' },
      // ── Wan I2V ──
      'wan-pro': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: '' },
      'wan/v2.2': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: '' },
      'wan-25': { validResolutions: ['720p','1080p'], defaultResolution: '1080p', validDurations: ['5'], defaultDuration: '5', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: '' },
      // ── DreamActor ──
      'dreamactor': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: [], supportsAudio: false, needsImage: true, needsVideo: true, notes: 'Uses source_image + driving_video. No duration/resolution/aspect_ratio.' },
      // ── Hunyuan ──
      'hunyuan-video': { validResolutions: ['720p','1080p'], defaultResolution: '720p', validDurations: ['5'], defaultDuration: '5', durationFormat: 'number', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: false, needsVideo: false, notes: 'Pure T2V — no image needed.' },
      // ── Ovi ──
      'ovi/': { validResolutions: ['720p','1080p'], defaultResolution: '720p', validDurations: ['3','4','5','6','7','8','9','10'], defaultDuration: '5', durationFormat: 'number', validAspectRatios: ['16:9','9:16'], supportsAudio: true, needsImage: true, needsVideo: false, notes: 'I2V with synchronized audio.' },
      // ── Image models (no duration/resolution, just aspect_ratio + image needs) ──
      'imagen4': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16','4:3','3:4','1:1'], supportsAudio: false, needsImage: false, needsVideo: false, notes: 'T2I — no image needed. Just prompt.' },
      'flux-pro': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16','4:3','3:4','1:1'], supportsAudio: false, needsImage: false, needsVideo: false, notes: 'T2I — no image needed.' },
      'flux-2-flex/edit': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I Edit — NEEDS source image.' },
      'flux-2-flex': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16','4:3','3:4','1:1'], supportsAudio: false, needsImage: false, needsVideo: false, notes: 'T2I — no image needed.' },
      'nano-banana': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16','4:3','3:4'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I Edit — NEEDS source image + edit prompt.' },
      'gemini': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I Edit — NEEDS source image.' },
      'grok-imagine-image': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I Edit — NEEDS source image.' },
      'qwen': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I Edit — NEEDS source image.' },
      'flux-krea-lora': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I style transfer — NEEDS source image.' },
      'flux-pro/kontext': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16'], supportsAudio: false, needsImage: true, needsVideo: false, notes: 'I2I Edit — NEEDS source image. Precise local edits.' },
      'stable-diffusion': { validResolutions: [], defaultResolution: '', validDurations: [], defaultDuration: '', durationFormat: 'string', validAspectRatios: ['16:9','9:16','4:3','3:4','1:1'], supportsAudio: false, needsImage: false, needsVideo: false, notes: 'T2I — no image needed.' },
    };

    // Find the matching model params for the selected model
    function resolveModelParams(model: string): ModelParams | null {
      // Check most specific first, then general
      const keys = Object.keys(MODEL_PARAM_MAP).sort((a, b) => b.length - a.length);
      for (const key of keys) {
        if (model.includes(key)) return MODEL_PARAM_MAP[key];
      }
      return null;
    }

    // Resolve the best resolution for this model given user preference
    function resolveResolution(model: string, userRes: string): string {
      const params = resolveModelParams(model);
      if (!params || params.validResolutions.length === 0) return userRes;
      if (params.validResolutions.includes(userRes)) return userRes;
      return params.defaultResolution;
    }

    // Resolve the best duration for this model
    function resolveDuration(model: string): string {
      const params = resolveModelParams(model);
      if (!params) return '5';
      return params.defaultDuration;
    }

    // Resolve aspect ratio for this model
    function resolveAspectRatio(model: string, userAR: string): string {
      const params = resolveModelParams(model);
      if (!params || params.validAspectRatios.length === 0) return userAR;
      if (params.validAspectRatios.includes(userAR)) return userAR;
      return params.validAspectRatios[0];
    }

    // Build resolved params for the selected model
    const resolvedRes = userPreferredModel !== 'none' ? resolveResolution(userPreferredModel, userResolution) : userResolution;
    const resolvedDuration = userPreferredModel !== 'none' ? resolveDuration(userPreferredModel) : '5';
    const resolvedAR = userPreferredModel !== 'none' ? resolveAspectRatio(userPreferredModel, userAspectRatio) : userAspectRatio;
    const resolvedParams = userPreferredModel !== 'none' ? resolveModelParams(userPreferredModel) : null;

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

    // Creative direction style descriptions for the AI
    const styleGuides: Record<string, string> = {
      'cinematic': 'CINEMATIC — Use film-grade composition: dramatic chiaroscuro lighting, shallow depth of field, anamorphic lens flares, golden hour warmth, Kodak film stock look. Think Villeneuve, Deakins, Lubezki.',
      'realistic': 'REALISTIC / PHOTOREALISTIC — Natural ambient lighting, true-to-life colors, no stylization. Documentary-quality, DSLR camera look, neutral color grading.',
      'surreal': 'SURREAL / DREAMLIKE — Otherworldly, impossible geometry, floating elements, ethereal glow, distorted reality, Salvador Dalí meets modern digital art. Vivid unnatural colors, soft atmospheric haze.',
      'noir': 'NOIR — High contrast black and white tones, deep dramatic shadows, venetian blind light patterns, rain-slicked streets, moody fog, 1940s detective aesthetic. Minimal color if any.',
      'anime': 'ANIME / STYLIZED — Japanese animation style, cel-shaded, vibrant saturated colors, expressive characters, dynamic action lines, Studio Ghibli or Makoto Shinkai inspired backgrounds.',
      'music-video': 'MUSIC VIDEO — Flashy, dynamic, heavy color grading (teal & orange, neon, monochrome), performance-driven energy, smoke/haze, concert-style lighting, fast cuts feel.',
      'fashion': 'FASHION / EDITORIAL — High-fashion studio lighting, clean backgrounds, editorial composition, Vogue-quality, beauty dish lighting, sharp focus on wardrobe and styling.',
      'horror': 'HORROR — Dark unsettling atmosphere, desaturated muted palette, long shadows, fog, tension-building composition, uncomfortable angles, dim practical lighting.',
      'scifi': 'SCI-FI / FUTURISTIC — Neon accent lighting, cyberpunk cityscapes, holographic UI elements, volumetric fog with colored light, chrome and glass surfaces, Blade Runner aesthetic.',
      'vintage': 'VINTAGE / RETRO — Analog film grain, faded warm tones, light leaks, muted pastels, 70s/80s color grading, Polaroid texture, vignette.',
      'epic': 'EPIC / FANTASY — Grand sweeping scale, mythical landscapes, dramatic stormy skies, volumetric god rays, Lord of the Rings grandeur, heroic composition.',
      'commercial': 'COMMERCIAL — Clean polished look, bright even lighting, product-focused, white/neutral backgrounds, crisp details, professional advertising quality.',
      'documentary': 'DOCUMENTARY — Handheld camera feel, raw and observational, available light, gritty realism, intimate close-ups, verité style.',
      'none': 'No specific style direction — choose what fits best for each individual prompt.'
    };

    const styleGuide = styleGuides[userCreativeDirection] || styleGuides['cinematic'];

    // Classify the user's preferred model to help the agent decide image vs video
    const videoModelPrefixes = ['kling', 'veo', 'sora', 'minimax', 'hailuo', 'seedance', 'pixverse', 'luma', 'hunyuan', 'dreamactor', 'grok-imagine-video', 'ovi', 'endframe'];
    // Wan models with 'video' in path are video; Wan 2.7 T2I/edit are image
    const isWanImageModel = userPreferredModel.includes('wan/v2.7') && !userPreferredModel.includes('video');
    const isVideoModelSelected = userPreferredModel !== 'none' && !isWanImageModel && videoModelPrefixes.some(p => userPreferredModel.includes(p));
    const isImageModelSelected = userPreferredModel !== 'none' && !isVideoModelSelected;

    // Inject user's current UI settings into the system prompt
    // Include RESOLVED params that the agent should ACTUALLY use — not raw user settings
    const modelParamGuidance = resolvedParams ? `
📋 **RESOLVED PARAMETERS FOR ${userPreferredModel}** (use these EXACT values):
- Resolution to send: ${resolvedRes || 'DO NOT SEND — model ignores it'}
- Duration to send: ${resolvedDuration || 'DO NOT SEND — model ignores it'} (format: ${resolvedParams.durationFormat})
- Aspect ratio to send: ${resolvedAR || 'DO NOT SEND — model ignores it'}
- Valid resolutions: ${resolvedParams.validResolutions.length > 0 ? resolvedParams.validResolutions.join(', ') : 'N/A — do not send resolution'}
- Valid durations: ${resolvedParams.validDurations.length > 0 ? resolvedParams.validDurations.join(', ') : 'N/A — do not send duration'}
- Audio support: ${resolvedParams.supportsAudio ? 'YES — set generate_audio: true' : 'NO'}
- Needs source image: ${resolvedParams.needsImage ? 'YES' : 'NO'}
- Needs source video: ${resolvedParams.needsVideo ? 'YES' : 'NO'}
${resolvedParams.notes ? `- ⚠️ ${resolvedParams.notes}` : ''}
${userResolution !== resolvedRes && resolvedRes ? `\n⚠️ User's resolution is ${userResolution} but this model only accepts: ${resolvedParams.validResolutions.join(', ')}. USE ${resolvedRes} instead.` : ''}` : '';

    const settingsContext = `\n\n**USER'S CURRENT SETTINGS:**
- User's preferred aspect ratio: ${userAspectRatio}
- User's preferred resolution: ${userResolution}
- Creative direction: ${userCreativeDirection}
- Images in context: ${imageUrls && imageUrls.length > 0 ? `${imageUrls.length} image(s) available` : 'none'}
- Video in context: ${videoUrl ? 'YES — user has uploaded a reference video' : 'none'}
- Selected model: ${userPreferredModel !== 'none' ? userPreferredModel : 'no preference (you choose)'}
${modelParamGuidance}
${isVideoModelSelected ? `\n⚠️ THE USER HAS A VIDEO MODEL SELECTED (${userPreferredModel}). This means they want VIDEO output. Use generate_video with this exact model unless they explicitly ask for an image. If this is an I2V (image-to-video) model and no source image is available, first generate an image with generate_image, then explain you need them to say "animate this" to create the video, OR use a text-to-video model instead.` : ''}
${isImageModelSelected ? `\n⚠️ THE USER HAS AN IMAGE MODEL SELECTED (${userPreferredModel}). This means they want IMAGE output. Use generate_image with this exact model.` : ''}
${userPreferredModel === 'none' ? `\nNo model preference set — you choose the best model. Use context clues: action words like "chase", "run", "walk", "fly", camera movements like "dolly", "pan", "tracking shot" suggest VIDEO. Static descriptions like "a portrait of", "a photo of", "design a" suggest IMAGE.` : ''}

**MODEL SELECTION RULES:**
1. If the user has a specific model selected, USE THAT MODEL. Do not substitute your own choice.
2. If the selected model is a video model, call generate_video (not generate_image).
3. If the selected model is an image model, call generate_image (not generate_video).
4. If no model is selected ("none"), YOU decide based on the prompt content.
5. Action verbs (chasing, running, dancing, flying, walking) = likely VIDEO.
6. Camera movements (dolly, pan, tracking, crane, tilt) = definitely VIDEO.
7. Static descriptions (portrait, photo, design, concept art) = likely IMAGE.
8. ALWAYS use the RESOLVED parameters from above — NOT the user's raw settings. The resolved params are already clamped to what the model accepts.

**CREATIVE DIRECTION — APPLY THIS STYLE TO EVERY PROMPT YOU CRAFT:**
${styleGuide}
Weave this visual style into your descriptions naturally.

IMPORTANT: Use the resolved aspect ratio (${resolvedAR}) for the selected model. Only change if the user explicitly requests a different one AND the model supports it.`;

    // Call Claude with tools - execute tool loop
    let response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: AGENT_SYSTEM_PROMPT + settingsContext,
      tools: AGENT_TOOLS,
      messages
    });

    console.log('🤖 [Agent] Initial response stop_reason:', response.stop_reason);
    console.log('🤖 [Agent] Response content types:', response.content.map(b => b.type));

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
                  aspect_ratio: input.aspect_ratio || userAspectRatio
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
                aspect_ratio: input.aspect_ratio || resolvedAR,
                duration: input.duration || resolvedDuration || undefined,
                resolution: input.resolution || resolvedRes || undefined,
                generate_audio: input.generate_audio !== undefined ? input.generate_audio : undefined,
                image_url: actionImageUrl,
                image_urls: imageUrls || undefined,
                // Special model params — passed through to /api/generate
                end_image_url: input.end_image_url || (imageUrls && imageUrls.length >= 2 ? imageUrls[1] : undefined),
                first_frame_url: input.first_frame_url || actionImageUrl,
                last_frame_url: input.last_frame_url || (imageUrls && imageUrls.length >= 2 ? imageUrls[1] : undefined),
                driving_video: input.driving_video || undefined,
                // V2V params — always prefer user-uploaded video over agent placeholder
                video_url: videoUrl || (input.video_url && !input.video_url.includes('{{') ? input.video_url : undefined),
                character_orientation: input.character_orientation || undefined,
                keep_audio: input.keep_audio !== undefined ? input.keep_audio : undefined,
                elements: input.elements || undefined
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
        system: AGENT_SYSTEM_PROMPT + settingsContext,
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

