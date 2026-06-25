/**
 * Model dropdown data and rendering for the chat interface.
 * Single source of truth for all model options displayed in dropdowns.
 */
import React from 'react';
import { SelectGroup, SelectItem, SelectLabel } from '@/components/ui/select';

const ICON_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

// Icon slug mapping for each company in model dropdowns
const COMPANY_ICONS: Record<string, { slug: string; color?: boolean }> = {
  "OpenAI": { slug: "openai" },
  "Google": { slug: "google", color: true },
  "xAI (Grok)": { slug: "xai" },
  "Kling": { slug: "kling", color: true },
  "ByteDance": { slug: "bytedance", color: true },
  "Black Forest Labs": { slug: "bfl" },
  "Minimax": { slug: "minimax", color: true },
  "Luma AI": { slug: "luma", color: true },
  "Tencent": { slug: "tencent", color: true },
  "Stability AI": { slug: "stability", color: true },
  "Alibaba": { slug: "alibaba", color: true },
};

export function CompanyIcon({ name }: { name: string }) {
  const icon = COMPANY_ICONS[name];
  if (!icon) return null;
  const file = icon.color ? `${icon.slug}-color.svg` : `${icon.slug}.svg`;
  return (
    <img
      src={`${ICON_CDN}/${file}`}
      alt=""
      className={`h-4 w-4 inline-block${!icon.color ? " dark:invert" : ""}`}
    />
  );
}

// ── Types ──
export type ModelOption = { value: string; label: string; detail?: string };
export type ModelGroup = { company: string; icon?: string; models: ModelOption[] };

// ── Model catalog ──
export const MODEL_GROUPS: ModelGroup[] = [
  { company: "OpenAI", icon: "OpenAI", models: [
    { value: "fal-ai/sora-2/image-to-video", label: "Sora 2 (I2V)", detail: "OpenAI's latest" },
    { value: "fal-ai/sora-2/image-to-video/pro", label: "Sora 2 Pro (I2V)", detail: "Premium 1080p" },
    { value: "fal-ai/sora-2/video-to-video/remix", label: "Sora 2 Remix (V2V)", detail: "Style changes" },
  ]},
  { company: "Google", icon: "Google", models: [
    { value: "fal-ai/veo3.1/fast/image-to-video", label: "Veo 3.1 Fast (I2V)", detail: "Latest video" },
    { value: "fal-ai/veo3.1/fast/first-last-frame-to-video", label: "Veo 3.1 First/Last Frame (I2V)" },
    { value: "fal-ai/imagen4/preview", label: "Imagen 4 (T2I)", detail: "Highest quality" },
    { value: "fal-ai/nano-banana-2/edit", label: "Nano Banana 2 (I2I Edit)", detail: "Latest, 0.5K-4K" },
    { value: "fal-ai/nano-banana-pro/edit", label: "Nano Banana Pro (I2I Edit)", detail: "1K-4K" },
    { value: "fal-ai/nano-banana/edit", label: "Nano Banana (I2I Edit)", detail: "Multi-image" },
    { value: "fal-ai/gemini-25-flash-image/edit", label: "Gemini 2.5 Flash (I2I Edit)", detail: "Blending" },
  ]},
  { company: "xAI (Grok)", icon: "xAI (Grok)", models: [
    { value: "xai/grok-imagine-video/text-to-video", label: "Grok Video (T2V)", detail: "Audio, 1-15s" },
    { value: "xai/grok-imagine-video/image-to-video", label: "Grok Video (I2V)", detail: "Audio, 1-15s" },
    { value: "xai/grok-imagine-video/v1.5/image-to-video", label: "Grok Video 1.5 (I2V)", detail: "Premium quality" },
    { value: "xai/grok-imagine-video/edit-video", label: "Grok Video Edit (V2V)", detail: "Edit video" },
    { value: "xai/grok-imagine-video/extend-video", label: "Grok Video Extend (V2V)", detail: "Extend 2-10s" },
    { value: "xai/grok-imagine-image/quality/text-to-image", label: "Grok Image Quality (T2I)", detail: "1K/2K" },
    { value: "xai/grok-imagine-image/quality/edit", label: "Grok Image Quality (I2I Edit)", detail: "Pro edit" },
    { value: "xai/grok-imagine-image/edit", label: "Grok Image (I2I Edit)", detail: "Realism" },
    { value: "xai/tts/v1", label: "xAI TTS v1", detail: "Voiceover" },
  ]},
  { company: "Kling", icon: "Kling", models: [
    { value: "fal-ai/kling-video/v3/pro/image-to-video", label: "Kling v3 Pro (I2V)", detail: "Cinematic, audio" },
    { value: "fal-ai/kling-video/v2.6/pro/image-to-video", label: "Kling v2.6 Pro (I2V)", detail: "Dialogue/speech" },
    { value: "fal-ai/kling-video/o3/standard/image-to-video", label: "Kling O3 (I2V)", detail: "Start/end frame" },
    { value: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video", label: "Kling v2.5 Turbo (I2V)", detail: "Fast motion" },
    { value: "fal-ai/kling-video/v2.1/master/image-to-video", label: "Kling v2.1 Master (I2V)" },
    { value: "fal-ai/kling-video/o1/video-to-video/edit", label: "Kling O1 (V2V Edit)", detail: "Replace subjects" },
    { value: "fal-ai/kling-video/o3/standard/video-to-video/edit", label: "Kling O3 Std (V2V Edit)", detail: "Budget" },
    { value: "fal-ai/kling-video/o3/pro/video-to-video/edit", label: "Kling O3 Pro (V2V Edit)", detail: "@refs" },
    { value: "fal-ai/kling-video/v2.6/standard/motion-control", label: "Kling v2.6 (Motion Ctrl)", detail: "Video→Image" },
    { value: "fal-ai/kling-video/v2.6/pro/motion-control", label: "Kling v2.6 Pro (Motion Ctrl)", detail: "HQ" },
    { value: "fal-ai/kling-video/v1/pro/ai-avatar", label: "Kling Avatar (Lip-sync)" },
  ]},
  { company: "ByteDance", icon: "ByteDance", models: [
    { value: "fal-ai/bytedance/seedream/v5/lite/text-to-image", label: "Seedream 5.0 Lite (T2I)", detail: "2K quality" },
    { value: "fal-ai/bytedance/dreamina/v3.1/text-to-image", label: "Dreamina v3.1 (T2I)", detail: "Aesthetics" },
    { value: "fal-ai/bytedance/seedream/v5/lite/edit", label: "Seedream 5.0 Lite (I2I Edit)", detail: "Multi-image" },
    { value: "fal-ai/bytedance/seedream/v4.5/edit", label: "Seedream 4.5 (I2I Edit)", detail: "10 images" },
    { value: "fal-ai/bytedance/seedream/v4/edit", label: "Seedream 4.0 (I2I Edit)" },
    { value: "bytedance/seedance-2.0/fast/text-to-video", label: "Seedance 2.0 Fast (T2V)", detail: "No image needed" },
    { value: "bytedance/seedance-2.0/fast/image-to-video", label: "Seedance 2.0 Fast (I2V)", detail: "Native audio, cinematic" },
    { value: "bytedance/seedance-2.0/fast/reference-to-video", label: "Seedance 2.0 Fast (Ref2V)", detail: "Character consistency" },
    { value: "bytedance/seedance-2.0/text-to-video", label: "Seedance 2.0 Premium (T2V)", detail: "Higher cost, 4K" },
    { value: "bytedance/seedance-2.0/image-to-video", label: "Seedance 2.0 Premium (I2V)", detail: "Higher cost, 4K" },
    { value: "bytedance/seedance-2.0/reference-to-video", label: "Seedance 2.0 Premium (Ref2V)", detail: "Refs, 4K" },
    { value: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video", label: "Seedance 1.5 Pro (I2V)", detail: "Audio, end frame" },
    { value: "fal-ai/bytedance/dreamactor/v2", label: "DreamActor v2 (Motion Ctrl)" },
  ]},
  { company: "Black Forest Labs", icon: "Black Forest Labs", models: [
    { value: "fal-ai/flux-pro/v1.1-ultra", label: "Flux Pro 1.1 Ultra (T2I)", detail: "Pro-grade" },
    { value: "fal-ai/flux-2-flex", label: "FLUX 2 Flex (T2I)", detail: "Typography" },
    { value: "fal-ai/flux-2-flex/edit", label: "FLUX 2 Flex (I2I Edit)", detail: "Multi-ref" },
    { value: "fal-ai/flux-pro/kontext/max", label: "Flux Kontext Max (I2I Edit)", detail: "Consistency" },
    { value: "fal-ai/flux-krea-lora/image-to-image", label: "FLUX LoRA (I2I)", detail: "Style transfer" },
  ]},
  { company: "Minimax", icon: "Minimax", models: [
    { value: "fal-ai/minimax/hailuo-2.3/standard/image-to-video", label: "Hailuo 2.3 (I2V)", detail: "Latest, 768p" },
    { value: "fal-ai/minimax/hailuo-02/standard/image-to-video", label: "Hailuo 02 (I2V)" },
  ]},
  { company: "Wan AI", models: [
    { value: "fal-ai/wan/v2.7/pro/text-to-image", label: "Wan 2.7 Pro (T2I)", detail: "Superior detail" },
    { value: "fal-ai/wan/v2.7/pro/edit", label: "Wan 2.7 Pro (I2I Edit)", detail: "Professional" },
    { value: "fal-ai/wan/v2.7/edit", label: "Wan 2.7 (I2I Edit)", detail: "Text-guided" },
    { value: "fal-ai/wan-pro/image-to-video", label: "Wan Pro (I2V)", detail: "1080p 30fps" },
    { value: "fal-ai/wan-25-preview/image-to-video", label: "Wan 2.5 Preview (I2V)" },
    { value: "fal-ai/wan/v2.2-a14b/image-to-video", label: "Wan v2.2-A14B (I2V)" },
  ]},
  { company: "Pixverse", icon: "Pixverse", models: [
    { value: "fal-ai/pixverse/v6/image-to-video", label: "Pixverse V6 (I2V)", detail: "Style presets, 1-15s" },
  ]},
  { company: "Luma AI", icon: "Luma AI", models: [
    { value: "fal-ai/luma-dream-machine/ray-2/image-to-video", label: "Luma Ray 2 (I2V)", detail: "Realistic motion" },
  ]},
  { company: "Tencent", icon: "Tencent", models: [
    { value: "fal-ai/hunyuan-video", label: "Hunyuan Video (T2V)" },
  ]},
  { company: "Stability AI", icon: "Stability AI", models: [
    { value: "fal-ai/stable-diffusion-v35-large", label: "SD 3.5 Large (T2I)" },
  ]},
  { company: "Alibaba", icon: "Alibaba", models: [
    { value: "fal-ai/qwen-image-edit", label: "Qwen (I2I Edit)", detail: "Text editing" },
  ]},
  { company: "Ovi", models: [
    { value: "fal-ai/ovi/image-to-video", label: "Ovi (I2V + Audio)" },
  ]},
];


/** Render model dropdown groups — `detailed` adds the detail suffix for the settings panel */
export function renderModelGroups(detailed: boolean) {
  return (
    <>
      {MODEL_GROUPS.map((group) => (
        <SelectGroup key={group.company}>
          <SelectLabel className="flex items-center gap-2">
            {group.icon && <CompanyIcon name={group.icon} />}
            {group.company}
          </SelectLabel>
          {group.models.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {detailed && m.detail ? `${m.label} - ${m.detail}` : m.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
      <SelectItem value="none">None (Ask me)</SelectItem>
    </>
  );
}