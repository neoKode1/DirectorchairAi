import { validateGenerateInput } from '@/lib/input-validation';
import { logger } from '@/lib/logger';

export const AR_TO_DIMS: Record<string, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:3': { width: 1024, height: 768 },
  '3:4': { width: 768, height: 1024 },
  '1:1': { width: 1024, height: 1024 },
};

export type PreparedFalGeneration = {
  prompt: string;
  model: string;
  input: Record<string, any>;
  isVideoModel: boolean;
  isImageModel: boolean;
};

export type PrepareFalGenerationResult =
  | { valid: true; prepared: PreparedFalGeneration }
  | { valid: false; error: string };

type GenerationLogger = Pick<typeof logger, 'debug' | 'warn'>;

async function convertLocalhostToBase64(url: string): Promise<string> {
  if (!url.startsWith('http://localhost:') && !url.startsWith('http://127.0.0.1:')) return url;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      logger.warn({ status: response.status, url: url.slice(0, 80) }, 'Localhost image fetch returned error');
      return url;
    }
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 100) {
      logger.warn({ size: arrayBuffer.byteLength, url: url.slice(0, 80) }, 'Localhost image too small');
      return url;
    }
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    logger.warn({ err: error }, 'Failed to convert localhost URL to base64');
    return url;
  }
}

const normalizeDuration = (value: unknown, fallback: string | number) =>
  value === undefined || value === null || value === '' ? fallback : value;

const clampStringDuration = (value: unknown, valid: string[], fallback: string) => {
  const dStr = normalizeDuration(value, fallback).toString().replace(/s$/, '');
  return valid.includes(dStr) ? dStr : fallback;
};

export function normalizeFalMediaResult(data: any) {
  const images = data?.images || [];
  const videos = data?.videos || (data?.video ? [data.video] : []);
  const audios = data?.audios || (data?.audio ? [data.audio] : []);
  return { images, videos, audios };
}

export async function prepareFalGenerationInput(
  body: Record<string, any>,
  log: GenerationLogger = logger,
): Promise<PrepareFalGenerationResult> {
  const validation = validateGenerateInput(body);
  if (!validation.valid) return { valid: false, error: validation.error || 'Invalid generation input' };

  const { prompt, model } = validation.sanitized!;
  const isVideoModel = model.includes('video') || model.includes('veo') || model.includes('kling') ||
    model.includes('minimax') || model.includes('dreamactor') || model.includes('endframe') ||
    model.includes('ovi/') || model.includes('seedance-2.0');
  const isImageModel = model.includes('flux') || model.includes('imagen') || model.includes('stable-diffusion') ||
    model.includes('dreamina') || model.includes('ideogram') || model.includes('photon') ||
    model.includes('recraft') || model.includes('nano-banana') || model.includes('gemini') ||
    model.includes('seedream') || model.includes('qwen') || model.includes('grok-imagine-image') ||
    (model.includes('wan') && !model.includes('video'));

  const input: Record<string, any> = { prompt: prompt.trim() };
  if (isVideoModel) {
    input.aspect_ratio = body.aspect_ratio || '16:9';
    input.duration = normalizeDuration(body.duration, 6);
  }
  if (body.image_url) input.image_url = await convertLocalhostToBase64(body.image_url);
  if (Array.isArray(body.image_urls)) input.image_urls = await Promise.all(body.image_urls.map((url: string) => convertLocalhostToBase64(url)));
  if (body.style_image_url) {
    const styleUrl = await convertLocalhostToBase64(body.style_image_url);
    if (model.includes('flux-krea-lora')) {
      if (input.image_url) input.image_urls = [input.image_url];
      input.image_url = styleUrl;
    } else {
      input.style_image_url = styleUrl;
    }
  }
  if (body.aspect_ratio) input.aspect_ratio = body.aspect_ratio;
  if (body.duration) input.duration = body.duration;
  if (body.resolution) input.resolution = body.resolution;
  if (body.negative_prompt) input.negative_prompt = body.negative_prompt;
  if (body.seed !== undefined) input.seed = body.seed;

  if (model.includes('nano-banana')) {
    if (body.aspect_ratio) input.ratio = body.aspect_ratio;
  }
  if (model.includes('wan/v2.7')) {
    if (!input.image_urls && input.image_url) input.image_urls = [input.image_url];
    input.image_size = 'square_hd';
    delete input.aspect_ratio; delete input.size; delete input.duration; delete input.resolution;
  }
  if (model.includes('seedream')) {
    if (!input.image_urls && input.image_url) input.image_urls = [input.image_url];
    input.image_size = model.includes('seedream/v5') ? 'auto_2K' : (AR_TO_DIMS[body.aspect_ratio || '16:9'] || AR_TO_DIMS['16:9']);
    delete input.aspect_ratio; delete input.size;
  }
  if (model.includes('flux') || model.includes('stable-diffusion') || model.includes('imagen')) {
    if (body.aspect_ratio) { input.aspect_ratio = body.aspect_ratio; input.size = body.aspect_ratio; }
  }
  if ((model.includes('gemini') && model.includes('edit')) || model.includes('grok-imagine-image') || model.includes('qwen')) {
    if (!input.image_url && Array.isArray(body.image_urls) && body.image_urls.length > 0) input.image_url = await convertLocalhostToBase64(body.image_urls[0]);
    if (model.includes('grok-imagine-image') || model.includes('qwen')) {
      delete input.size; delete input.ratio; delete input.resolution; delete input.duration;
    }
  }
  if (model.includes('dreamina')) {
    input.image_size = AR_TO_DIMS[body.aspect_ratio || '16:9'] || AR_TO_DIMS['16:9'];
    delete input.aspect_ratio; delete input.size;
  }
  if (model.includes('veo3')) {
    input.duration = ['4s', '6s', '8s'].includes(`${String(normalizeDuration(body.duration, '8')).replace(/s$/, '')}s`) ? `${String(normalizeDuration(body.duration, '8')).replace(/s$/, '')}s` : '8s';
    input.resolution = ['720p', '1080p', '4k'].includes(body.resolution) ? body.resolution : '720p';
    if (!['auto', '16:9', '9:16'].includes(input.aspect_ratio)) input.aspect_ratio = '16:9';
    input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
    if (model.includes('first-last-frame-to-video')) {
      input.first_frame_url = body.first_frame_url ? await convertLocalhostToBase64(body.first_frame_url) : input.image_url;
      if (body.last_frame_url) input.last_frame_url = await convertLocalhostToBase64(body.last_frame_url);
      else if (Array.isArray(body.image_urls) && body.image_urls.length >= 2) input.last_frame_url = await convertLocalhostToBase64(body.image_urls[1]);
      delete input.image_url; delete input.image_urls;
    }
  }
  if (model.includes('minimax/hailuo') || model.includes('minimax-hailuo') || model.includes('endframe')) {
    const d = String(normalizeDuration(body.duration, '6'));
    input.duration = d.includes('10') ? '10' : '6';
    if (model.includes('hailuo-2.3')) { input.prompt_optimizer = body.prompt_optimizer !== undefined ? body.prompt_optimizer : true; delete input.resolution; }
    else input.resolution = body.resolution === '512P' ? '512P' : '768P';
  }
  if (model.includes('kling-video')) {
    const isKlingV3OrO3 = model.includes('/v3/') || model.includes('/o3/');
    input.duration = clampStringDuration(body.duration, isKlingV3OrO3 ? ['3','4','5','6','7','8','9','10','11','12','13','14','15'] : ['5','10'], '5');
    if (model.includes('image-to-video')) {
      if (input.image_url) { input.start_image_url = input.image_url; delete input.image_url; }
      if (body.end_image_url) input.end_image_url = await convertLocalhostToBase64(body.end_image_url);
      else if (Array.isArray(body.image_urls) && body.image_urls.length >= 2) input.end_image_url = await convertLocalhostToBase64(body.image_urls[1]);
      delete input.image_urls;
    }
    if (model.includes('video-to-video/edit')) {
      if (body.video_url) input.video_url = body.video_url;
      if (Array.isArray(body.image_urls) && body.image_urls.length > 0) input.image_urls = body.image_urls;
      if (Array.isArray(body.elements) && body.elements.length > 0) input.elements = body.elements;
      input.keep_audio = body.keep_audio !== undefined ? body.keep_audio : true;
      input.shot_type = body.shot_type || 'customize';
      delete input.start_image_url; delete input.image_url; delete input.duration; delete input.aspect_ratio;
    }
    if (model.includes('motion-control')) {
      if (body.video_url) input.video_url = body.video_url;
      input.character_orientation = body.character_orientation || 'video';
      input.keep_original_sound = body.keep_original_sound !== undefined ? body.keep_original_sound : true;
      delete input.start_image_url; delete input.duration; delete input.aspect_ratio;
    }
    if (model.includes('/v2.6/') && model.includes('image-to-video')) input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
    if (isKlingV3OrO3) {
      input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
      if (!['16:9', '9:16'].includes(input.aspect_ratio)) input.aspect_ratio = '16:9';
      input.negative_prompt ||= 'blur, distort, and low quality';
      if (body.cfg_scale !== undefined) input.cfg_scale = body.cfg_scale;
    }
  }
  if (model.includes('pixverse')) {
    const dNum = parseInt(String(normalizeDuration(body.duration, 5)).replace(/s$/, ''), 10);
    input.duration = Number.isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 15);
    input.resolution = ['360p', '540p', '720p', '1080p'].includes(body.resolution) ? body.resolution : '720p';
    if (body.generate_audio !== undefined) { input.generate_audio_switch = body.generate_audio; delete input.generate_audio; }
    if (['anime', '3d_animation', 'clay', 'comic', 'cyberpunk'].includes(body.style)) input.style = body.style;
    delete input.aspect_ratio;
  }
  if (model.includes('seedance-2.0')) {
    input.duration = clampStringDuration(body.duration, ['auto','4','5','6','7','8','9','10','11','12','13','14','15'], '5');
    input.resolution = ['480p', '720p'].includes(body.resolution) ? body.resolution : '720p';
    input.aspect_ratio = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16', 'auto'].includes(body.aspect_ratio) ? body.aspect_ratio : 'auto';
    input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
    if (model.includes('image-to-video')) { if (body.end_image_url) input.end_image_url = await convertLocalhostToBase64(body.end_image_url); delete input.image_urls; delete input.size; }
    else if (model.includes('reference-to-video')) {
      if (input.image_url && (!input.image_urls || input.image_urls.length === 0)) input.image_urls = [input.image_url];
      else if (input.image_urls?.length > 9) input.image_urls = input.image_urls.slice(0, 9);
      if (Array.isArray(body.video_urls)) input.video_urls = body.video_urls.slice(0, 3); else if (body.video_url) input.video_urls = [body.video_url];
      if (Array.isArray(body.audio_urls)) input.audio_urls = body.audio_urls.slice(0, 3); else if (body.audio_url) input.audio_urls = [body.audio_url];
      delete input.image_url; delete input.end_image_url; delete input.size;
    } else { delete input.image_url; delete input.image_urls; delete input.end_image_url; delete input.size; }
  } else if (model.includes('seedance')) {
    input.duration = clampStringDuration(body.duration, ['4','5','6','7','8','9','10','11','12'], '5');
    input.resolution = ['480p', '720p', '1080p'].includes(body.resolution) ? body.resolution : '720p';
    input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
    if (body.end_image_url) input.end_image_url = await convertLocalhostToBase64(body.end_image_url);
  }
  if (model.includes('sora-2')) {
    if (!['16:9', '9:16'].includes(input.aspect_ratio)) input.aspect_ratio = '16:9';
    const dNum = parseInt(String(normalizeDuration(body.duration, 4)).replace(/s$/, ''), 10);
    input.duration = [4, 8, 12, 16, 20].reduce((prev, curr) => Math.abs(curr - (Number.isNaN(dNum) ? 4 : dNum)) < Math.abs(prev - (Number.isNaN(dNum) ? 4 : dNum)) ? curr : prev);
    input.resolution = ['auto', '720p'].includes(body.resolution) ? body.resolution : '720p';
    if (model.includes('video-to-video/remix')) { if (body.video_url) input.video_url = body.video_url; delete input.image_url; delete input.image_urls; }
  }
  if (model.includes('image-to-video') && (model.includes('wan-pro') || model.includes('wan/v2') || model.includes('wan-25'))) {
    const dNum = parseInt(String(normalizeDuration(body.duration, 4)).replace(/s$/, ''), 10);
    input.duration = [4, 8, 12, 16, 20].reduce((prev, curr) => Math.abs(curr - dNum) < Math.abs(prev - dNum) ? curr : prev);
    input.resolution = ['auto', '720p'].includes(body.resolution) ? body.resolution : '720p';
  }
  if (model.includes('dreamactor')) {
    if (input.image_url) { input.source_image = input.image_url; delete input.image_url; }
    if (body.driving_video || body.video_url) input.driving_video = body.driving_video || body.video_url;
    delete input.image_urls; delete input.aspect_ratio; delete input.duration;
  }
  if (model.includes('luma-dream-machine') && !['16:9', '9:16', '4:3', '3:4'].includes(input.aspect_ratio)) input.aspect_ratio = '16:9';
  if (model.includes('grok-imagine-video')) {
    const dNum = parseInt(String(normalizeDuration(body.duration, 6)).replace(/s$/, ''), 10);
    input.duration = Number.isNaN(dNum) ? 6 : dNum;
    if (!['480p', '720p'].includes(input.resolution)) input.resolution = '720p';
  }
  if (model.includes('ovi/')) {
    const dNum = parseInt(String(normalizeDuration(body.duration, 5)).replace(/s$/, ''), 10);
    input.duration = Number.isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 10);
    input.generate_audio = body.generate_audio !== undefined ? body.generate_audio : true;
  }
  if (model.includes('hunyuan-video')) {
    delete input.image_url; delete input.image_urls;
    const dNum = parseInt(String(normalizeDuration(body.duration, 5)).replace(/s$/, ''), 10);
    input.duration = Number.isNaN(dNum) ? 5 : Math.min(Math.max(dNum, 1), 10);
  }

  log.debug({ model, isVideoModel, isImageModel, ar: input.aspect_ratio, res: input.resolution, dur: input.duration }, 'Prepared FAL input');
  return { valid: true, prepared: { prompt, model, input, isVideoModel, isImageModel } };
}

export function buildNanoBananaFallbackInput(input: Record<string, any>, body: Record<string, any>) {
  const fallbackInput = { ...input };
  if (body.aspect_ratio) {
    fallbackInput.image_size = AR_TO_DIMS[body.aspect_ratio] || AR_TO_DIMS['16:9'];
    delete fallbackInput.aspect_ratio;
  }
  return fallbackInput;
}

export function isRecoverableNanoBananaFailure(error: any, model: string, body: Record<string, any>) {
  const isContentPolicyViolation = error?.status === 422 ||
    error?.body?.detail?.some?.((d: any) => d?.msg?.includes?.('Gemini could not generate an image'));
  return isContentPolicyViolation && model === 'fal-ai/nano-banana/edit' && (body.image_url || body.image_urls);
}