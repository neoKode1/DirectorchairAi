"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EnhancedLoadingModal } from '@/components/enhanced-loading-modal';
import { ModelSelectionModal } from '@/components/model-selection-modal';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  Sparkles,
  RefreshCw,
  Shuffle,
  FileImage,
  CloudUpload,
  Settings,
  Monitor
} from 'lucide-react';
import { contentStorage } from '@/lib/content-storage';
import { compressImage, validateImageFile, formatFileSize } from '@/lib/image-compression';
import { processFile, validateFile, formatFileSize as formatFileSizeUtil } from '@/lib/file-processing';

interface SimpleChatInterfaceProps {
  onContentGenerated: (generationData: any) => Promise<any>;
  onGenerationStarted?: () => void;
  onGenerationComplete?: () => void;
  onImageInjected?: (imageUrl: string) => void;
}

export const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({
  onContentGenerated,
  onGenerationStarted,
  onGenerationComplete,
  onImageInjected
}) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    media?: {
      type: 'image' | 'video' | 'audio';
      url: string;
      filename?: string;
    };
    suggestions?: string[];
  }>>([]);
  
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingSuggestions, setFloatingSuggestions] = useState<string[]>([]);
  const [showFloatingDialog, setShowFloatingDialog] = useState(false);
  const [endFrameMode, setEndFrameMode] = useState(false);
  const { toast } = useToast();
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [duration, setDuration] = useState(4);
  const [preferredVideoModel, setPreferredVideoModel] = useState<string>('fal-ai/nano-banana/edit');
  const [forceVideoGeneration, setForceVideoGeneration] = useState<boolean>(false);
  const [userIntent, setUserIntent] = useState<'image' | 'video' | 'auto'>('image');
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Helper function to get image limits for multi-image models
  const getModelImageLimits = (model: string): { min: number; max: number; optimal: number; description: string } => {
    const multiImageLimits: Record<string, { min: number; max: number; optimal: number; description: string }> = {
      // Exactly 2 images required
      'fal-ai/dreamomni2/edit': { min: 2, max: 2, optimal: 2, description: 'Source image + Style reference' },
      'endframe/minimax-hailuo-02': { min: 2, max: 2, optimal: 2, description: 'Start frame + End frame' },
      
      // 1-2 images
      'fal-ai/wan-25-preview/image-to-image': { min: 1, max: 2, optimal: 1, description: 'Single edit or multi-ref fusion' },
      
      // 1-4 images
      'fal-ai/reve/remix': { min: 1, max: 4, optimal: 2, description: 'Combine reference images' },
      'fal-ai/flux-pro/kontext/max/multi': { min: 2, max: 4, optimal: 2, description: 'Multi-context editing' },
      'fal-ai/flux-pro/kontext/multi': { min: 1, max: 4, optimal: 1, description: 'Create variations' },
      
      // 1-10 images
      'fal-ai/nano-banana/edit': { min: 1, max: 10, optimal: 2, description: 'Gemini multi-image editing' },
      'fal-ai/bytedance/seedream/v4/edit': { min: 1, max: 10, optimal: 4, description: 'Professional multi-image editing' },
      
      // Multiple reference images
      'fal-ai/veo3.1/reference-to-video': { min: 1, max: 10, optimal: 3, description: 'Reference images for video' },
      'fal-ai/meshy/v5/multi-image-to-3d': { min: 2, max: 10, optimal: 4, description: '3D from multiple angles' },
      'fal-ai/veo3.1/first-last-frame-to-video': { min: 2, max: 2, optimal: 2, description: 'First frame + Last frame' },
      'fal-ai/veo3.1/fast/first-last-frame-to-video': { min: 2, max: 2, optimal: 2, description: 'First frame + Last frame' },
    };
    
    return multiImageLimits[model] || { min: 1, max: 1, optimal: 1, description: 'Single image' };
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);


  // Model descriptions mapping
  const modelDescriptions: Record<string, string> = {
    'fal-ai/imagen4/preview': "Google's highest quality image generation model with enhanced detail and lighting",
    'fal-ai/flux-pro/kontext/max/text-to-image': "FLUX.1 Kontext [max] - Maximum performance with greatly improved prompt adherence",
    'fal-ai/flux-krea-lora/stream': "Super fast FLUX.1 [dev] with LoRA support for rapid, high-quality image generation",
    'fal-ai/recraft/v3/text-to-image': "SOTA text-to-image model with long text generation, vector art, and brand style capabilities",
    'fal-ai/hidream-i1-full': "High-detail dream-like image generation with advanced artistic capabilities",
    'fal-ai/kandinsky5/text-to-video': "Kandinsky-style video generation with artistic motion and transitions",
    'fal-ai/pixverse/v5/image-to-video': "Advanced image-to-video generation with smooth motion and high quality",
    'fal-ai/dreamomni2/edit': "Advanced image editing with DreamOmni2's powerful modification capabilities",
    'fal-ai/moondream3-preview/detect': "Object detection and analysis with MoonDream3's advanced vision capabilities",
    'fal-ai/ovi': "Audio-video generation with synchronized sound and motion",
    'fal-ai/wan-alpha': "Generate videos with transparent backgrounds",
    'fal-ai/reve/text-to-image': "Reve's text-to-image model with strong aesthetic quality and accurate text rendering",
    'fal-ai/reve/edit': "Reve's edit model for transforming existing images via text prompts",
    'fal-ai/reve/remix': "Reve's remix model for combining multiple reference images with text prompts",
    'fal-ai/luma-dream-machine': "Luma's flagship video generation with high-quality motion and detail",
    'fal-ai/wan-25-preview/text-to-image': "Wan 2.5 text-to-image with enhanced quality and artistic styles",
    'fal-ai/wan-25-preview/text-to-video': "Wan 2.5 text-to-video with best visual quality and motion stability",
    'fal-ai/wan-25-preview/image-to-video': "Wan 2.5 image-to-video with smooth motion generation from images",
    'fal-ai/wan-25-preview/image-to-image': "Wan 2.5 image editing with subject-consistent modifications",
    'fal-ai/veo3.1': "Veo 3.1 by Google, the most advanced AI video generation model in the world. With sound on!",
    'fal-ai/veo3.1/fast': "Faster and more cost effective version of Google's Veo 3.1!",
    'fal-ai/veo3.1/image-to-video': "Veo 3.1 is the latest state-of-the art video generation model from Google DeepMind",
    'fal-ai/veo3.1/fast/image-to-video': "Generate videos from your image prompts using Veo 3.1 fast",
    'fal-ai/veo3.1/first-last-frame-to-video': "Generate videos from a first and last framed using Google's Veo 3.1",
    'fal-ai/veo3.1/fast/first-last-frame-to-video': "Generate videos from a first/last frame using Google's Veo 3.1 Fast",
    'fal-ai/veo3.1/reference-to-video': "Generate Videos from Ingredients using Google's Veo 3.1",
    'fal-ai/sora-2/text-to-video': "Text-to-video endpoint for Sora 2, OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images",
    'fal-ai/sora-2/text-to-video/pro': "Text-to-video endpoint for Sora 2 Pro, OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images",
    'fal-ai/sora-2/image-to-video': "Image-to-video endpoint for Sora 2, OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images",
    'fal-ai/sora-2/image-to-video/pro': "Image-to-video endpoint for Sora 2 Pro, OpenAI's state-of-the-art video model capable of creating richly detailed, dynamic clips with audio from natural language or images",
    'fal-ai/sora-2/video-to-video/remix': "Video-to-video remix endpoint for Sora 2, OpenAI's advanced model that transforms existing videos based on new text or image prompts allowing rich edits, style changes, and creative reinterpretations while preserving motion and structure",
    'fal-ai/kling-video/v2.1/master/text-to-video': "Kling 2.1 Master text-to-video with professional quality",
    'fal-ai/kling-video/v2.1/master/image-to-video': "Kling 2.1 Master image-to-video with smooth motion",
    'fal-ai/kling-video/v2.5-turbo/pro/text-to-video': "Kling 2.5 Turbo Pro text-to-video with enhanced speed",
    'fal-ai/kling-video/v2.5-turbo/pro/image-to-video': "Kling 2.5 Turbo Pro image-to-video with fast processing",
    'fal-ai/minimax/hailuo-02/standard/image-to-video': "Minimax Hailuo 02 standard image-to-video generation",
    'fal-ai/hunyuan-video': "Hunyuan video generation with high quality and consistency",
    'fal-ai/wan/v2.2-a14b/image-to-video': "Wan v2.2-A14B image-to-video with advanced capabilities",
    'fal-ai/ovi/image-to-video': "Ovi image-to-video with synchronized audio generation",
    'fal-ai/luma-dream-machine/ray-2/image-to-video': "Luma Ray 2 image-to-video with enhanced quality",
    'fal-ai/luma-dream-machine/image-to-video': "Luma Dream Machine image-to-video generation",
    'fal-ai/luma-dream-machine/ray-2': "Luma Ray 2 with advanced video generation capabilities",
    'fal-ai/luma-dream-machine/ray-2-flash': "Luma Ray 2 Flash for fast video generation",
    'fal-ai/luma-dream-machine/ray-2-flash/image-to-video': "Luma Ray 2 Flash image-to-video with speed optimization",
    'fal-ai/ltxv-13b-098-distilled/image-to-video': "LTX Video 0.9.8 13B distilled image-to-video",
    'decart/lucy-14b/image-to-video': "Lucy-14B lightning fast image-to-video generation",
    'fal-ai/wan/v2.2-a14b/image-to-video/lora': "Wan 2.2 I2V with LoRA support for customization",
    'fal-ai/bytedance/omnihuman': "ByteDance OmniHuman for human-focused video generation",
    'fal-ai/kling-video/v1/pro/ai-avatar': "Kling AI Avatar Pro for avatar video generation",
    'fal-ai/sync-lipsync/v2': "Sync Lipsync v2 for synchronized lip movement",
    'veed/lipsync': "VEED Lipsync for professional lip synchronization",
    'endframe/minimax-hailuo-02': "EndFrame for smooth transitions between start and end frames",
    'fal-ai/luma-dream-machine/ray-2/modify': "Luma Ray 2 image modification with advanced editing",
    'fal-ai/luma-dream-machine/ray-2-flash/modify': "Luma Ray 2 Flash fast image modification",
    'fal-ai/luma-dream-machine/ray-2/reframe': "Luma Ray 2 image reframing with aspect ratio changes",
    'fal-ai/luma-dream-machine/ray-2-flash/reframe': "Luma Ray 2 Flash fast image reframing",
    'fal-ai/minimax-music/v1.5': "MiniMax Music v1.5 for AI music generation with style control",
    'fal-ai/minimax-music': "MiniMax Music for AI music generation",
    'fal-ai/meshy/v5/multi-image-to-3d': "Meshy V5 multi-image-to-3D model generation",
    'fal-ai/nano-banana/edit': "Nano Banana Edit for advanced image editing capabilities",
    'fal-ai/bytedance/seedream/v4/edit': "Seedream 4.0 Edit for professional image modification",
    'fal-ai/qwen-image-edit/image-to-image': "Qwen Image Edit with superior text editing capabilities",
    'fal-ai/luma-photon/flash/reframe': "Luma Photon Flash reframing with intelligent content expansion",
    'fal-ai/flux-kontext-lora': "Flux Kontext LoRA with enhanced context understanding",
    'fal-ai/flux-kontext-lora/text-to-image': "Flux Kontext LoRA text-to-image with context enhancement",
    'fal-ai/flux-kontext-lora/inpaint': "Flux Kontext LoRA inpainting with context-aware filling",
    'fal-ai/flux-pro/kontext/text-to-image': "Flux Pro Kontext text-to-image with advanced context",
    'fal-ai/flux-pro/kontext/max': "Flux Pro Kontext Max with maximum context performance",
    'fal-ai/flux-pro/kontext/max/multi': "Flux Pro Kontext Max Multi with multi-context capabilities",
    'fal-ai/flux-pro/kontext/multi': "Flux Pro Kontext Multi with enhanced multi-context support",
    'fal-ai/wan-trainer/t2v-14b': "Wan Trainer T2V 14B with 14B parameter text-to-video",
    'fal-ai/wan-trainer/t2v': "Wan Trainer T2V for text-to-video training and generation",
    'fal-ai/wan-trainer/i2v-720p': "Wan Trainer I2V 720p for image-to-video at 720p resolution"
  };

  // Organize models by category
  const modelsByCategory: Record<string, Array<{value: string; label: string; icon: string; isNew?: boolean; disabled?: boolean; description?: string}>> = {
    'text-to-image': [
      { value: 'fal-ai/reve/text-to-image', label: 'Reve (Text Rendering)', icon: '/Gen4.png', isNew: true, description: modelDescriptions['fal-ai/reve/text-to-image'] },
      { value: 'fal-ai/reve/edit', label: 'Reve Edit (I2I)', icon: '/Gen4.png', isNew: true, description: modelDescriptions['fal-ai/reve/edit'] },
      { value: 'fal-ai/reve/remix', label: 'Reve Remix 🖼️×4', icon: '/Gen4.png', isNew: true, description: modelDescriptions['fal-ai/reve/remix'] },
      { value: 'fal-ai/wan-25-preview/text-to-image', label: 'Wan 2.5 Text-to-Image', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-25-preview/text-to-image'] },
      { value: 'fal-ai/imagen4/preview', label: 'Imagen 4 (Google)', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/imagen4/preview'] },
      { value: 'fal-ai/flux-pro/v1.1-ultra', label: 'Flux Pro Ultra', icon: '/flux.svg', description: 'Flux Pro Ultra with enhanced quality and prompt adherence' },
      { value: 'fal-ai/recraft/v3/text-to-image', label: 'Recraft V3 (SOTA)', icon: '/ideogram.svg', isNew: true, description: modelDescriptions['fal-ai/recraft/v3/text-to-image'] },
      { value: 'fal-ai/hidream-i1-full', label: 'HiDream-I1 (17B)', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['fal-ai/hidream-i1-full'] },
      { value: 'fal-ai/flux-krea-lora/stream', label: 'Flux Krea LoRA Stream', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-krea-lora/stream'] },
      { value: 'fal-ai/qwen-image-edit/image-to-image', label: 'Qwen Image Edit (I2I)', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['fal-ai/qwen-image-edit/image-to-image'] },
      { value: 'fal-ai/wan-25-preview/image-to-image', label: 'Wan 2.5 I2I 🖼️×2', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-25-preview/image-to-image'] },
      { value: 'fal-ai/nano-banana/edit', label: 'Nano Banana 🖼️×10', icon: '/gemini-color.svg', description: modelDescriptions['fal-ai/nano-banana/edit'] },
      { value: 'fal-ai/bytedance/seedream/v4/edit', label: 'Seedream 4.0 🖼️×10', icon: '/bytedance-color.svg', description: modelDescriptions['fal-ai/bytedance/seedream/v4/edit'] },
      { value: 'fal-ai/dreamomni2/edit', label: 'DreamOmni2 🖼️×2', icon: '/bytedance-color.svg', isNew: true, description: modelDescriptions['fal-ai/dreamomni2/edit'] },
      { value: 'fal-ai/luma-photon/flash/reframe', label: 'Luma Photon Flash Reframe', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-photon/flash/reframe'] },
      { value: 'fal-ai/flux-kontext-lora', label: 'Flux Kontext LoRA', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-kontext-lora'] },
      { value: 'fal-ai/flux-kontext-lora/text-to-image', label: 'Flux Kontext LoRA T2I', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-kontext-lora/text-to-image'] },
      { value: 'fal-ai/flux-kontext-lora/inpaint', label: 'Flux Kontext Inpaint', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-kontext-lora/inpaint'] },
      { value: 'fal-ai/flux-pro/kontext/max/text-to-image', label: 'Flux Pro Kontext Max T2I', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-pro/kontext/max/text-to-image'] },
      { value: 'fal-ai/flux-pro/kontext/text-to-image', label: 'Flux Pro Kontext T2I', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-pro/kontext/text-to-image'] },
      { value: 'fal-ai/flux-pro/kontext/max', label: 'Flux Pro Kontext Max', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-pro/kontext/max'] },
      { value: 'fal-ai/flux-pro/kontext/max/multi', label: 'Kontext Max Multi 🖼️×4', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-pro/kontext/max/multi'] },
      { value: 'fal-ai/flux-pro/kontext/multi', label: 'Kontext Multi 🖼️×4', icon: '/flux.svg', isNew: true, description: modelDescriptions['fal-ai/flux-pro/kontext/multi'] },
    ],
    'text-to-video': [
      { value: 'fal-ai/wan-alpha', label: 'Wan Alpha (Transparent BG)', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-alpha'] },
      { value: 'fal-ai/wan-25-preview/text-to-video', label: 'Wan 2.5 Text-to-Video', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-25-preview/text-to-video'] },
      { value: 'fal-ai/veo3.1', label: 'Veo 3.1', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1'] },
      { value: 'fal-ai/veo3.1/fast', label: 'Veo 3.1 Fast', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1/fast'] },
      { value: 'fal-ai/sora-2/text-to-video', label: 'Sora 2 Text-to-Video', icon: '/openai.svg', isNew: true, description: modelDescriptions['fal-ai/sora-2/text-to-video'] },
      { value: 'fal-ai/sora-2/text-to-video/pro', label: 'Sora 2 Pro Text-to-Video', icon: '/openai.svg', isNew: true, description: modelDescriptions['fal-ai/sora-2/text-to-video/pro'] },
      { value: 'fal-ai/kandinsky5/text-to-video', label: 'Kandinsky 5.0 T2V', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['fal-ai/kandinsky5/text-to-video'] },
      { value: 'fal-ai/kandinsky5/text-to-video/distill', label: 'Kandinsky 5.0 Distilled', icon: '/deepseek-color.svg', isNew: true, description: 'Kandinsky 5.0 distilled version for faster generation' },
      { value: 'fal-ai/ovi', label: 'Ovi (Audio-Video)', icon: '/Gen4.png', isNew: true, description: modelDescriptions['fal-ai/ovi'] },
      { value: 'fal-ai/luma-dream-machine', label: 'Luma Dream Machine v1.5', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine'] },
      { value: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video', label: 'Kling 2.5 Turbo Pro T2V', icon: '/kling-color.svg', isNew: true, description: modelDescriptions['fal-ai/kling-video/v2.5-turbo/pro/text-to-video'] },
      { value: 'fal-ai/kling-video/v2.1/master/text-to-video', label: 'Kling 2.1 Master T2V', icon: '/kling-color.svg', isNew: true, description: modelDescriptions['fal-ai/kling-video/v2.1/master/text-to-video'] },
      { value: 'fal-ai/veo3.1/reference-to-video', label: 'Veo 3.1 Reference 🖼️×10', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1/reference-to-video'] },
      { value: 'fal-ai/wan-trainer/t2v-14b', label: 'Wan Trainer T2V 14B', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-trainer/t2v-14b'] },
      { value: 'fal-ai/wan-trainer/t2v', label: 'Wan Trainer T2V', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-trainer/t2v'] },
      { value: 'fal-ai/bytedance/omnihuman', label: 'OmniHuman (Avatar)', icon: '/bytedance-color.svg', isNew: true, description: modelDescriptions['fal-ai/bytedance/omnihuman'] },
    ],
    'image-to-video': [
      { value: 'fal-ai/veo3.1/image-to-video', label: 'Veo 3.1 (I2V)', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1/image-to-video'] },
      { value: 'fal-ai/veo3.1/fast/image-to-video', label: 'Veo 3.1 Fast (I2V)', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1/fast/image-to-video'] },
      { value: 'fal-ai/veo3.1/first-last-frame-to-video', label: 'Veo 3.1 First/Last 🖼️×2', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1/first-last-frame-to-video'] },
      { value: 'fal-ai/veo3.1/fast/first-last-frame-to-video', label: 'Veo 3.1 Fast FL 🖼️×2', icon: '/gemini-color.svg', isNew: true, description: modelDescriptions['fal-ai/veo3.1/fast/first-last-frame-to-video'] },
      { value: 'fal-ai/sora-2/image-to-video', label: 'Sora 2 (I2V)', icon: '/openai.svg', description: modelDescriptions['fal-ai/sora-2/image-to-video'] },
      { value: 'fal-ai/sora-2/image-to-video/pro', label: 'Sora 2 Pro (I2V)', icon: '/openai.svg', description: modelDescriptions['fal-ai/sora-2/image-to-video/pro'] },
      { value: 'fal-ai/veo3/image-to-video', label: 'Veo 3 (I2V)', icon: '/Gen4.png', description: 'Veo 3 image-to-video generation with advanced capabilities' },
      { value: 'fal-ai/kling-video/v2.1/master/image-to-video', label: 'Kling v2.1 Master (I2V)', icon: '/kling-color.svg', description: modelDescriptions['fal-ai/kling-video/v2.1/master/image-to-video'] },
      { value: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', label: 'Kling V2.5 Turbo Pro (I2V)', icon: '/kling-color.svg', description: modelDescriptions['fal-ai/kling-video/v2.5-turbo/pro/image-to-video'] },
      { value: 'fal-ai/minimax/hailuo-02/standard/image-to-video', label: 'Minimax Hailuo 02 (I2V)', icon: '/minimax-color.svg', description: modelDescriptions['fal-ai/minimax/hailuo-02/standard/image-to-video'] },
      { value: 'endframe/minimax-hailuo-02', label: 'EndFrame 🖼️×2', icon: '/minimax-color.svg', description: modelDescriptions['endframe/minimax-hailuo-02'] },
      { value: 'fal-ai/hunyuan-video', label: 'Hunyuan Video (I2V)', icon: '/bytedance-color.svg', description: modelDescriptions['fal-ai/hunyuan-video'] },
      { value: 'fal-ai/wan/v2.2-a14b/image-to-video', label: 'Wan v2.2-A14B (I2V)', icon: '/alibaba-color.svg', description: modelDescriptions['fal-ai/wan/v2.2-a14b/image-to-video'] },
      { value: 'fal-ai/ovi/image-to-video', label: 'Ovi (I2V with Audio)', icon: '/Gen4.png', description: modelDescriptions['fal-ai/ovi/image-to-video'] },
      { value: 'fal-ai/luma-dream-machine/ray-2/image-to-video', label: 'Luma Ray 2 (I2V)', icon: '/dreammachine.svg', description: modelDescriptions['fal-ai/luma-dream-machine/ray-2/image-to-video'] },
      { value: 'fal-ai/wan-25-preview/image-to-video', label: 'Wan 2.5 (I2V)', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-25-preview/image-to-video'] },
      { value: 'fal-ai/luma-dream-machine/image-to-video', label: 'Luma Dream Machine (I2V)', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/image-to-video'] },
      { value: 'fal-ai/luma-dream-machine/ray-2', label: 'Luma Ray 2', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2'] },
      { value: 'fal-ai/luma-dream-machine/ray-2-flash', label: 'Luma Ray 2 Flash', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2-flash'] },
      { value: 'fal-ai/luma-dream-machine/ray-2-flash/image-to-video', label: 'Luma Ray 2 Flash (I2V)', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2-flash/image-to-video'] },
      { value: 'fal-ai/pixverse/v5/image-to-video', label: 'PixVerse V5 (I2V)', icon: '/kling-color.svg', isNew: true, description: modelDescriptions['fal-ai/pixverse/v5/image-to-video'] },
      { value: 'fal-ai/ltxv-13b-098-distilled/image-to-video', label: 'LTX Video 0.9.8 13B', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['fal-ai/ltxv-13b-098-distilled/image-to-video'] },
      { value: 'decart/lucy-14b/image-to-video', label: 'Lucy-14B (Lightning Fast)', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['decart/lucy-14b/image-to-video'] },
      { value: 'fal-ai/wan/v2.2-a14b/image-to-video/lora', label: 'Wan 2.2 I2V (LoRA)', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan/v2.2-a14b/image-to-video/lora'] },
      { value: 'fal-ai/bytedance/omnihuman', label: 'OmniHuman (Avatar)', icon: '/bytedance-color.svg', isNew: true, description: modelDescriptions['fal-ai/bytedance/omnihuman'] },
      { value: 'fal-ai/kling-video/v1/pro/ai-avatar', label: 'Kling AI Avatar Pro ⏰', icon: '/kling-color.svg', description: 'Kling AI Avatar Pro - Premium avatar generation (⚠️ ~20 min processing time)' },
      // DISABLED: Sync Lipsync v2 - Proxy routing issue (404 error)
      // { value: 'fal-ai/sync-lipsync/v2', label: 'Sync Lipsync v2', icon: '/sync.svg', disabled: true, description: 'Sync Lipsync v2 (temporarily disabled - use VEED Lipsync instead)' },
      { value: 'veed/lipsync', label: 'VEED Lipsync', icon: '/veed.svg', isNew: true, description: modelDescriptions['veed/lipsync'] },
      { value: 'fal-ai/wan-pro/image-to-video', label: 'Wan Pro (I2V) - Disabled', icon: '/alibaba-color.svg', disabled: true, description: 'Wan Pro image-to-video (currently disabled)' },
      { value: 'fal-ai/wan-trainer/i2v-720p', label: 'Wan Trainer I2V 720p', icon: '/alibaba-color.svg', isNew: true, description: modelDescriptions['fal-ai/wan-trainer/i2v-720p'] },
    ],
    'video-to-video': [
      { value: 'fal-ai/sora-2/video-to-video/remix', label: 'Sora 2 Video Remix', icon: '/openai.svg', isNew: true, description: modelDescriptions['fal-ai/sora-2/video-to-video/remix'] },
      { value: 'fal-ai/luma-dream-machine/ray-2/modify', label: 'Luma Ray 2 Modify', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2/modify'] },
      { value: 'fal-ai/luma-dream-machine/ray-2-flash/modify', label: 'Luma Ray 2 Flash Modify', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2-flash/modify'] },
      { value: 'fal-ai/luma-dream-machine/ray-2/reframe', label: 'Luma Ray 2 Reframe', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2/reframe'] },
      { value: 'fal-ai/luma-dream-machine/ray-2-flash/reframe', label: 'Luma Ray 2 Flash Reframe', icon: '/dreammachine.svg', isNew: true, description: modelDescriptions['fal-ai/luma-dream-machine/ray-2-flash/reframe'] },
    ],
    'audio': [
      { value: 'fal-ai/minimax-music/v1.5', label: 'MiniMax Music v1.5', icon: '/minimax-color.svg', isNew: true, description: modelDescriptions['fal-ai/minimax-music/v1.5'] },
      { value: 'fal-ai/minimax-music', label: 'MiniMax Music', icon: '/minimax-color.svg', isNew: true, description: modelDescriptions['fal-ai/minimax-music'] },
    ],
    '3d': [
      { value: 'fal-ai/meshy/v5/multi-image-to-3d', label: 'Meshy V5 3D 🖼️×10', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['fal-ai/meshy/v5/multi-image-to-3d'] },
    ],
    'specialized': [
      { value: 'fal-ai/moondream3-preview/detect', label: 'MoonDream3 Detect', icon: '/deepseek-color.svg', isNew: true, description: modelDescriptions['fal-ai/moondream3-preview/detect'] },
    ],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get model icon
  const getModelIcon = (model: string) => {
    if (model.includes('sora')) return '/openai.svg'; // Use OpenAI icon for Sora
    if (model.includes('nano-banana')) return '/gemini-color.svg';
    if (model.includes('flux')) return '/flux.svg';
    if (model.includes('kling')) return '/kling-color.svg';
    if (model.includes('minimax')) return '/minimax-color.svg';
    if (model.includes('seedream') || model.includes('bytedance')) return '/bytedance-color.svg';
    if (model.includes('hunyuan')) return '/bytedance-color.svg'; // Using ByteDance icon for Hunyuan
    if (model.includes('wan-pro') || model.includes('wan/v2.2-a14b') || model.includes('wan-25-preview')) return '/alibaba-color.svg'; // Using Alibaba icon for Wan models
    if (model.includes('veo3')) return '/Gen4.png'; // Using Gen4 for Veo 3
    if (model.includes('ovi')) return '/Gen4.png'; // Using Gen4 for Ovi
    if (model.includes('kling') && model.includes('avatar')) return '/kling-color.svg'; // Using Kling icon for AI Avatar
    if (model.includes('luma')) return '/dreammachine.svg'; // Using Dream Machine SVG for Luma
    if (model.includes('imagen')) return '/Gen4.png';
    if (model.includes('photon')) return '/ideogram.svg';
    if (model.includes('recraft')) return '/ideogram.svg';
    return '/gemini-color.svg'; // Default fallback
  };

  // Helper function to get supported durations for each model
  const getSupportedDurations = (model: string) => {
    if (model.includes('sora-2')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 8, label: '8 seconds' },
        { value: 12, label: '12 seconds' }
      ];
    }
    if (model.includes('veo3')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 8, label: '8 seconds' },
        { value: 12, label: '12 seconds' }
      ];
    }
    if (model.includes('kling')) {
      if (model.includes('v2.5-turbo')) {
        return [
          { value: 5, label: '5 seconds' },
          { value: 10, label: '10 seconds' }
        ];
      }
      return [
        { value: 5, label: '5 seconds' },
        { value: 10, label: '10 seconds' }
      ];
    }
    if (model.includes('minimax')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 6, label: '6 seconds' },
        { value: 8, label: '8 seconds' }
      ];
    }
    if (model.includes('hunyuan')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 6, label: '6 seconds' },
        { value: 8, label: '8 seconds' }
      ];
    }
    if (model.includes('wan-pro')) {
      return [
        { value: 6, label: '6 seconds' }
      ];
    }
    if (model.includes('ovi')) {
      return [
        { value: 4, label: '4 seconds' },
        { value: 6, label: '6 seconds' },
        { value: 8, label: '8 seconds' }
      ];
    }
    if (model.includes('luma')) {
      return [
        { value: 5, label: '5 seconds' },
        { value: 9, label: '9 seconds' }
      ];
    }
    if (model.includes('wan-25-preview')) {
      return [
        { value: 5, label: '5 seconds' },
        { value: 10, label: '10 seconds' }
      ];
    }
    // Default for image models or unknown models
    return [
      { value: 4, label: '4 seconds' },
      { value: 6, label: '6 seconds' },
      { value: 8, label: '8 seconds' }
    ];
  };

  // Helper function to check if model supports duration
  const isVideoModel = (model: string) => {
    return model.includes('video') || 
           model.includes('sora') || 
           model.includes('veo') || 
           model.includes('kling') || 
           model.includes('minimax') || 
           model.includes('luma') ||
           model.includes('endframe');
  };

  // Helper function to detect user intent from prompt and context
  const detectUserIntent = (prompt: string, imageCount: number): 'endframe' | 'character-addition' | 'scene-editing' | 'multi-composition' | 'unknown' => {
    const lowerPrompt = prompt.toLowerCase();
    
    // EndFrame transition keywords
    const endFrameKeywords = [
      'transition', 'morph', 'transform', 'change from', 'evolve', 'become',
      'start frame', 'end frame', 'beginning', 'ending', 'before and after',
      'animate between', 'interpolate', 'blend', 'fade from', 'fade to'
    ];
    
    // Character addition keywords
    const characterKeywords = [
      'add character', 'add person', 'add people', 'insert character', 'put character',
      'add figure', 'add human', 'add person to', 'character in', 'person in scene',
      'add someone', 'include character', 'place character', 'character walking',
      'person standing', 'add man', 'add woman', 'add child'
    ];
    
    // Scene editing keywords
    const sceneEditKeywords = [
      'edit', 'modify', 'change', 'alter', 'adjust', 'enhance', 'improve',
      'remove', 'delete', 'replace', 'swap', 'fix', 'correct', 'update',
      'make it', 'turn into', 'convert to', 'transform to', 'change to'
    ];
    
    // Multi-composition keywords
    const compositionKeywords = [
      'combine', 'merge', 'blend', 'mix', 'fuse', 'join', 'unite',
      'create from', 'make from', 'build from', 'construct from',
      'elements from', 'parts from', 'pieces from', 'components from'
    ];
    
    // Check for EndFrame intent
    if (imageCount === 2 && endFrameKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      return 'endframe';
    }
    
    // Check for character addition intent
    if (characterKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      return 'character-addition';
    }
    
    // Check for scene editing intent
    if (sceneEditKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      return 'scene-editing';
    }
    
    // Check for multi-composition intent
    if (imageCount > 1 && compositionKeywords.some(keyword => lowerPrompt.includes(keyword))) {
      return 'multi-composition';
    }
    
    // Default fallback based on image count
    if (imageCount === 2) {
      return 'endframe'; // Default to EndFrame for 2 images
    }
    
    return 'unknown';
  };

  // Helper function to get recommended model based on intent
  const getRecommendedModel = (intent: string): string => {
    switch (intent) {
      case 'endframe':
        return 'endframe/minimax-hailuo-02';
      case 'character-addition':
        return 'fal-ai/nano-banana/edit';
      case 'scene-editing':
        return 'fal-ai/bytedance/seedream/v4/edit';
      case 'multi-composition':
        return 'fal-ai/wan-25-preview/image-to-image';
      default:
        return 'fal-ai/nano-banana/edit'; // Default fallback
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('allmodelsai-chat-messages');
    const savedLastImage = localStorage.getItem('allmodelsai-last-generated-image');
    const savedSettings = localStorage.getItem('allmodelsai-settings');
    
    // Skip loading messages from localStorage to prevent quota exceeded errors
    // Messages will start fresh on each page load
    console.log('📝 [Chat] Starting with empty message history to prevent localStorage quota issues');
    
    // Clear any existing messages on page load to ensure fresh start
    setMessages([]);
    
    if (savedLastImage) {
      setLastGeneratedImage(savedLastImage);
    }
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAspectRatio(settings.aspectRatio || '16:9');
        setResolution(settings.resolution || '1080p');
        setDuration(settings.duration || 4);
        setPreferredVideoModel(settings.preferredVideoModel || 'fal-ai/nano-banana/edit');
        setUserIntent(settings.userIntent || 'image');
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Auto-cleanup old messages to prevent localStorage quota exceeded errors
  useEffect(() => {
    if (messages.length > 25) {
      // Keep only the last 25 messages to prevent quota exceeded
      const messagesToKeep = messages.slice(-25);
      setMessages(messagesToKeep);
      console.log(`🧹 [Chat] Cleaned up old messages, kept last ${messagesToKeep.length} messages`);
    }
  }, [messages.length]);

  // Additional cleanup for messages with images (they take up the most space)
  useEffect(() => {
    const messagesWithImages = messages.filter(msg => msg.media && msg.media.url);
    if (messagesWithImages.length > 10) {
      // If we have more than 10 messages with images, remove the oldest ones
      const messagesWithoutOldImages = messages.filter((msg, index) => {
        if (msg.media && msg.media.url) {
          // Keep only the last 10 messages with images
          const imageMessageIndex = messagesWithImages.findIndex(imgMsg => imgMsg.id === msg.id);
          return imageMessageIndex >= messagesWithImages.length - 10;
        }
        return true; // Keep all messages without images
      });
      setMessages(messagesWithoutOldImages);
      console.log(`🧹 [Chat] Cleaned up old messages with images, kept last 10 image messages`);
    }
  }, [messages]);

  // Disable localStorage saving for messages to prevent quota exceeded errors
  // Messages will be lost on page refresh, but this prevents the app from breaking
  useEffect(() => {
    // Only save a minimal message count for debugging purposes
    if (messages.length > 0) {
      try {
        const messageCount = messages.length;
        localStorage.setItem('allmodelsai-message-count', messageCount.toString());
      } catch (error) {
        console.error('Error saving message count to localStorage:', error);
      }
    }
  }, [messages]);

  // Save last generated image to localStorage whenever it changes
  useEffect(() => {
    if (lastGeneratedImage) {
      try {
        localStorage.setItem('allmodelsai-last-generated-image', lastGeneratedImage);
      } catch (error) {
        console.error('Error saving last generated image to localStorage:', error);
      }
    }
  }, [lastGeneratedImage]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const settings = {
        aspectRatio,
        resolution,
        duration,
        preferredVideoModel,
        userIntent
      };
      localStorage.setItem('allmodelsai-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [aspectRatio, resolution, duration, preferredVideoModel, userIntent]);

  // Event listener for model selection changes
  const handleModelSelectionChange = (newModel: string) => {
    // ============================================
    // 🎯 USER SELECTED NEW MODEL
    // ============================================
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 USER MODEL SELECTION`);
    console.log(`${'='.repeat(80)}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`🔄 Previous Model: ${preferredVideoModel || 'None'}`);
    console.log(`🤖 New Model: ${newModel}`);
    console.log(`📊 Model Type: ${isVideoModel(newModel) ? 'VIDEO' : 'IMAGE'}`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Update the preferred model
    setPreferredVideoModel(newModel);
    
    // Set user intent based on model selection
    if (isVideoModel(newModel)) {
      setUserIntent('video'); // User explicitly wants video
      console.log('✅ Intent set to VIDEO - user selected video model');
      
      // Adjust duration to a valid value for the new model
      const supportedDurations = getSupportedDurations(newModel);
      const currentDurationValid = supportedDurations.some(d => d.value === duration);
      
      if (!currentDurationValid) {
        // Set to the first available duration for the new model
        const newDuration = supportedDurations[0].value;
        console.log(`🔧 Adjusting duration from ${duration}s to ${newDuration}s for ${newModel}`);
        setDuration(newDuration);
      }
    } else {
      setUserIntent('image'); // User explicitly wants image (default behavior)
      console.log('✅ Intent set to IMAGE - user selected image model');
    }
  };


  const processFiles = useCallback(async (files: FileList) => {
    setIsProcessingImages(true);
    setIsProcessingAudio(true);
    
    try {
      // Get limits for current model
      const limits = getModelImageLimits(preferredVideoModel);
      
      // Count image files being uploaded
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      const newImageTotal = uploadedImages.length + imageFiles.length;
      
      // Validate total count before processing
      if (newImageTotal > limits.max && imageFiles.length > 0) {
        toast({
          title: "Too Many Images",
          description: `${preferredVideoModel} accepts maximum ${limits.max} images. You have ${uploadedImages.length} uploaded. You can add ${limits.max - uploadedImages.length} more.`,
          variant: "destructive"
        });
        setIsProcessingImages(false);
        setIsProcessingAudio(false);
        return;
      }
      
      for (const file of Array.from(files)) {
        try {
          // Validate the file first
          const validation = validateFile(file);
          if (!validation.isValid) {
            console.error('❌ [Chat] File validation failed:', validation.error);
            alert(`File upload failed: ${validation.error}`);
            continue;
          }

          console.log(`📁 [Chat] Processing ${validation.fileType}: ${file.name} (${formatFileSizeUtil(file.size)})`);
          
          // Process the file (image or audio)
          const result = await processFile(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            maxSizeKB: 1024, // 1MB limit for images
            maxAudioSizeKB: 5120 // 5MB limit for audio
          });

          console.log(`✅ [Chat] ${validation.fileType} processed: ${formatFileSizeUtil(result.originalSize)} → ${formatFileSizeUtil(result.processedSize)} (${result.compressionRatio.toFixed(2)}x compression)`);
          
          // Add to appropriate state based on file type
          if (result.fileType === 'image') {
            setUploadedImages(prev => [...prev, result.processedDataUrl]);
          } else if (result.fileType === 'audio') {
            setUploadedAudio(result.processedDataUrl);
          }
          
        } catch (error) {
          console.error('❌ [Chat] File processing failed:', error);
          alert(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } finally {
      setIsProcessingImages(false);
      setIsProcessingAudio(false);
    }
  }, [preferredVideoModel, uploadedImages.length, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    processFiles(files);
  }, [processFiles]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearChatHistory = () => {
    setMessages([]);
    setLastGeneratedImage(null);
    try {
      // Clear all AllModelsAI-related localStorage items
      localStorage.removeItem('allmodelsai-chat-messages');
      localStorage.removeItem('allmodelsai-last-generated-image');
      localStorage.removeItem('allmodelsai-settings');
      // Also clear any content gallery items that might be taking up space
      localStorage.removeItem('allmodelsai-content-gallery');
      console.log('✅ [Chat] Chat history and localStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Utility function to handle localStorage quota exceeded
  const handleStorageQuotaExceeded = () => {
    console.warn('⚠️ [Chat] localStorage quota exceeded, clearing old data...');
    try {
      // Clear all AllModelsAI localStorage items
      localStorage.removeItem('allmodelsai-chat-messages');
      localStorage.removeItem('allmodelsai-last-generated-image');
      localStorage.removeItem('allmodelsai-content-gallery');
      // Keep settings as they're small
      console.log('✅ [Chat] localStorage cleared due to quota exceeded');
      
      // Also clear the current messages state to prevent immediate re-saving
      setMessages([]);
    } catch (error) {
      console.error('Error clearing localStorage after quota exceeded:', error);
    }
  };

  const injectImage = (imageUrl: string) => {
    console.log('🖼️ [Chat] Injecting image:', imageUrl);
    setUploadedImages([imageUrl]);
    // Scroll to bottom to show the injected image
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Expose injectImage function and setChatInput to parent component
  useEffect(() => {
    if (onImageInjected) {
      // Store the injectImage function in a way that parent can access it
      (window as any).injectImageToChat = injectImage;
      // Store the setUserInput function for setting chat input
      (window as any).setChatInput = setUserInput;
      // Store the getChatInput function for getting current input
      (window as any).getChatInput = () => userInput;
      // Store the setForceVideoGeneration function for forcing video generation
      (window as any).setForceVideoGeneration = setForceVideoGeneration;
    }
  }, [onImageInjected, userInput]);

  // Detect when multiple images are uploaded and analyze user intent
  useEffect(() => {
    if (uploadedImages.length >= 2 && userInput.trim()) {
      const intent = detectUserIntent(userInput, uploadedImages.length);
      const recommendedModel = getRecommendedModel(intent);
      
      // Auto-select the recommended model based on intent
      setPreferredVideoModel(recommendedModel);
      
      // Show intelligent recommendation
      const intentMessages = {
        'endframe': '🎬 EndFrame transition detected! Creating video between your start and end frames.',
        'character-addition': '👤 Character addition detected! Adding characters to your scene.',
        'scene-editing': '✏️ Scene editing detected! Modifying your image.',
        'multi-composition': '🎨 Multi-image composition detected! Combining elements from your images.',
        'unknown': '🤔 Multiple images detected! Choose your preferred model for the best results.'
      };
      
      toast({
        title: "Intent Detected",
        description: intentMessages[intent] || intentMessages['unknown'],
      });
      
      setEndFrameMode(intent === 'endframe');
    } else if (uploadedImages.length >= 2) {
      // Multiple images but no prompt yet - show general options
      setEndFrameMode(false);
      toast({
        title: "Multiple Images Ready",
        description: "Describe what you want to do with these images for intelligent model selection.",
      });
    } else {
      setEndFrameMode(false);
    }
  }, [uploadedImages.length, userInput, toast]);

  // Handle EndFrame generation
  const handleEndFrameGeneration = async () => {
    if (uploadedImages.length !== 2) {
      toast({
        title: "Error",
        description: "EndFrame requires exactly two images (start frame and end frame)",
        variant: "destructive",
      });
      return;
    }

    if (!userInput.trim()) {
      toast({
        title: "Error", 
        description: "Please describe the transition between your start and end frames",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🎬 Starting EndFrame generation...');
      console.log('📝 Prompt:', userInput);
      console.log('🖼️ Start frame (first image):', uploadedImages[0]);
      console.log('🖼️ End frame (second image):', uploadedImages[1]);

      // Convert images to base64 for the API
      const startFrameBase64 = uploadedImages[0].split(',')[1]; // Remove data:image/...;base64, prefix
      const endFrameBase64 = uploadedImages[1].split(',')[1];

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'endframe/minimax-hailuo-02',
          prompt: userInput.trim(),
          image_url: uploadedImages[0], // Use first image as the primary image
          duration: 6, // Minimax only accepts 6 or 10 seconds
          resolution: '768P'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'EndFrame generation failed');
      }

      // Handle async task - need to poll for completion
      if (data.success && data.taskId && data.status === 'IN_PROGRESS') {
        console.log('⏳ EndFrame task created, polling for completion:', data.taskId);
        
        // Poll for task completion
        const maxPolls = 60; // Max 60 polls (5 minutes at 5s intervals)
        const pollInterval = 5000; // 5 seconds
        let pollCount = 0;
        
        while (pollCount < maxPolls) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          pollCount++;
          
          console.log(`🔄 Polling attempt ${pollCount}/${maxPolls}...`);
          
          const statusResponse = await fetch(`/api/endframe?taskId=${data.taskId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.success && statusData.videoUrl) {
            console.log('✅ EndFrame video ready:', statusData.videoUrl);
            
            // Video is ready, proceed to add to gallery
            await addVideoToGallery(statusData.videoUrl);
            return;
          } else if (statusData.status === 'failed') {
            throw new Error('EndFrame generation failed during processing');
          }
          // Otherwise, continue polling
        }
        
        throw new Error('EndFrame generation timeout - please try again');
      }

      // Handle immediate completion (if video URL is returned directly)
      if (data.success && data.videoUrl) {
        console.log('✅ EndFrame video generated successfully:', data.videoUrl);
        await addVideoToGallery(data.videoUrl);
        return;
      }
      
      throw new Error(data.error || 'No video URL returned');
    } catch (error) {
      console.error('❌ EndFrame generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'EndFrame generation failed';
      
      toast({
        title: "EndFrame Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Add error message to chat
      const errorChatMessage = {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: `❌ EndFrame generation failed: ${errorMessage}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to add video to gallery and chat
  const addVideoToGallery = async (videoUrl: string) => {
    console.log('📦 Adding EndFrame video to gallery and center panel:', videoUrl);
    
    // Add to gallery storage
    if (typeof window !== 'undefined') {
      const { contentStorage } = await import('@/lib/content-storage');
      const endFrameContent = {
        id: `endframe-${Date.now()}`,
        type: 'video' as const,
        url: videoUrl,
        title: `EndFrame: ${userInput.substring(0, 50)}...`,
        prompt: userInput || 'EndFrame transition',
        timestamp: new Date(),
        metadata: {
          format: 'MiniMax EndFrame',
          model: 'MiniMax-Hailuo-02',
          duration: 6
        }
      };
      
      contentStorage.addContent(endFrameContent);
      console.log('✅ EndFrame content added to storage');
      
      // Dispatch event to update gallery
      window.dispatchEvent(new CustomEvent('contentUpdated'));
      console.log('✅ Gallery update event dispatched');
    }

    // Update lastGeneratedImage to the video URL (for reference in other operations)
    setLastGeneratedImage(videoUrl);
    console.log('✅ Updated lastGeneratedImage state');

    // Show success toast
    toast({
      title: "EndFrame Video Generated!",
      description: "Your start-to-end frame video has been created successfully.",
    });

    // Clear input after successful generation
    setUserInput('');
    setUploadedImages([]);
    setEndFrameMode(false);
    
    // Add success message to chat with video preview
    const successMessage = {
      id: Date.now().toString(),
      type: 'assistant' as const,
      content: `🎬 EndFrame video generated successfully! The transition from your start frame to end frame has been created.`,
      timestamp: new Date(),
      media: {
        type: 'video' as const,
        url: videoUrl,
        filename: `endframe-${Date.now()}.mp4`
      }
    };
    
    setMessages(prev => [...prev, successMessage]);
    console.log('✅ EndFrame success message added to chat');
    
    // Trigger onContentGenerated callback to update center panel
    try {
      console.log('✅ Calling onContentGenerated callback for center panel');
      
      // Create the proper data structure that handleGenerate expects
      const endFrameResult = {
        data: {
          videos: [{ url: videoUrl }],
          video: { url: videoUrl }
        },
        videos: [{ url: videoUrl }],
        timestamp: new Date().toISOString(),
        prompt: userInput || 'EndFrame transition',
        model: 'endframe/minimax-hailuo-02'
      };
      
      await onContentGenerated(endFrameResult);
      console.log('✅ Center panel updated with EndFrame video');
    } catch (error) {
      console.error('❌ Error updating center panel:', error);
      // Non-blocking error - video is still in gallery and chat
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && uploadedImages.length === 0) return;

    // Handle EndFrame generation when EndFrame model is selected or when intent is detected as EndFrame
    if (preferredVideoModel === 'endframe/minimax-hailuo-02' || endFrameMode) {
      await handleEndFrameGeneration();
      return;
    }

    // Validate multi-image model requirements
    const limits = getModelImageLimits(preferredVideoModel);
    if (uploadedImages.length > 0) {
      if (uploadedImages.length > limits.max) {
        alert(`${preferredVideoModel} accepts maximum ${limits.max} images. Please remove ${uploadedImages.length - limits.max} image(s).`);
        return;
      }
      if (uploadedImages.length < limits.min) {
        alert(`${preferredVideoModel} requires at least ${limits.min} images. Please upload ${limits.min - uploadedImages.length} more image(s).`);
        return;
      }
    }

    // Validate Kling AI Avatar requirements (⚠️ ~20 min processing time)
    if (preferredVideoModel === 'fal-ai/kling-video/v1/pro/ai-avatar') {
      if (uploadedImages.length === 0) {
        alert('Please upload an image for the AI Avatar.');
        return;
      }
      if (!uploadedAudio) {
        alert('Please upload an audio file for the AI Avatar.');
        return;
      }
      // Warning about long processing time
      const confirmed = confirm('⚠️ Kling AI Avatar Pro takes approximately 20 minutes to generate. Continue?');
      if (!confirmed) {
        return;
      }
    }

    // Validate Sora 2 image-to-video requirements
    if (preferredVideoModel.includes('sora-2/image-to-video')) {
      if (uploadedImages.length === 0 && !lastGeneratedImage) {
        alert('Sora 2 requires an image. Please upload an image or generate one first using an image model like Nano Banana Edit.');
        return;
      }
    }

    // Detect if user wants video generation based on keywords (very specific to avoid false positives)
    const videoKeywords = [
      // Explicit video/animation terms
      'animate', 'animation', 'video', 'motion', 'cinematic', 'film', 'movie',
      
      // Specific camera movements and shots (only when explicitly mentioned)
      'tracking dolly shot', 'dolly shot', 'dolly in', 'dolly out', 'push in', 'pull out',
      'low-angle shot', 'low angle shot', 'low-angle tracking', 'low angle tracking',
      'high-angle shot', 'high angle shot', 'high-angle tracking', 'high angle tracking',
      'pedestal up shot', 'pedestal upshot', 'pedestal up', 'pedestal down shot', 'pedestal down',
      'pan right shot', 'pan right', 'panning right', 'pan to right',
      'pan left shot', 'pan left', 'panning left', 'pan to left',
      'tilt up shot', 'tilt up', 'tilting up', 'tilt to up',
      'tilt down shot', 'tilt down', 'tilting down', 'tilt to down',
      'zoom in shot', 'zoom in', 'zooming in', 'zoom into',
      'zoom out shot', 'zoom out', 'zooming out', 'zoom away',
      'crane shot', 'crane up', 'crane down', 'crane movement',
      'handheld shot', 'handheld', 'shaky cam', 'shaky camera',
      'steady cam', 'steadicam',
      'close-up shot', 'close up shot', 'establishing shot',
      'wide shot', 'wide angle shot', 'medium shot', 'medium close-up', 'medium close up',
      'over-the-shoulder shot', 'over the shoulder shot', 'over shoulder',
      'point of view shot', 'pov shot', 'first person shot',
      'bird\'s eye view', 'birds eye view', 'aerial shot', 'top down',
      'worm\'s eye view', 'worms eye view', 'ground level',
      
      // Advanced camera techniques
      'rack focus', 'focus pull', 'shallow depth of field', 'bokeh',
      'slow motion', 'slow-mo', 'time-lapse', 'fast motion',
      'freeze frame', 'bullet time', 'matrix effect',
      
      // Video-specific transitions and effects
      'fade in', 'fade out', 'crossfade', 'dissolve', 'wipe',
      'action sequence', 'streaming', 'playing', 'looping',
      
      // File formats and playback
      'gif', 'mp4', 'mov', 'avi', 'playback', 'replay', 'preview', 'trailer',
      'duration', 'seconds', 'minutes', 'timeline', 'sequence'
    ];
    
    // Special trigger words that force video generation (image-to-video only)
    const videoTriggers = [
      'make video', 'create video', 'generate video', 'video of', 
      'animate this', 'make it move', 'animate the image', 'bring to life',
      'animate this image', 'make this move', 'bring this to life',
      'create animation', 'make animation', 'generate animation',
      'turn into video', 'convert to video', 'make a video',
      'animate with', 'animate using', 'animate the character', 'animate this character',
      'make the character', 'bring the character', 'animate the scene',
      // Cinematic shot triggers
      'tracking dolly shot', 'low-angle tracking dolly shot', 'low-angle shot',
      'tracking shot', 'pull out shot', 'push in shot', 'pedestal up shot',
      'pedestal down shot', 'pan right shot', 'pan left shot'
    ];
    
    const hasVideoTrigger = videoTriggers.some(trigger => 
      userInput.toLowerCase().includes(trigger)
    );
    
    const matchedVideoKeywords = videoKeywords.filter(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
    const hasVideoKeywords = matchedVideoKeywords.length > 0;
    
    // Determine if user wants video based on intent
    let wantsVideo = false;
    
    if (userIntent === 'video') {
      // User explicitly selected a video model - always generate video
      wantsVideo = true;
      console.log('🎬 [Chat] Video generation forced by user intent (video model selected)');
    } else {
      // User selected an image model (default) - always generate images
      wantsVideo = false;
      console.log('🎬 [Chat] Image generation forced by user intent (image model selected)');
    }
    
    console.log('🎬 [Chat] Intent-based video detection:', {
      userInput: userInput.toLowerCase(),
      userIntent,
      hasVideoTrigger,
      hasVideoKeywords,
      matchedVideoKeywords,
      wantsVideo,
      preferredVideoModel,
      forceVideoGeneration,
      videoTriggers: videoTriggers.filter(trigger => userInput.toLowerCase().includes(trigger))
    });

    // Detect if user is referencing a previously generated image or injected image
    const imageReferenceKeywords = ['that character', 'that image', 'this character', 'this image', 'the character', 'the image', 'behind that', 'over the shoulder', 'close-up', 'detail shot', 'low-angle', 'different angle', 'another angle', 'variation', 'edit this', 'modify this', 'generate video', 'create video', 'animate', 'make video'];
    const isReferencingPreviousImage = imageReferenceKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    ) && (lastGeneratedImage || uploadedImages.length > 0);

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: userInput.trim(),
      timestamp: new Date(),
      media: uploadedImages.length > 0 ? {
        type: 'image' as const,
        url: uploadedImages[0],
        filename: 'uploaded-image'
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    
    setUserInput('');
    setUploadedImages([]);
    setIsGenerating(true);
    onGenerationStarted?.();

    try {
      // Prepare generation data with proper defaults
      let model: string;
      let imageToUse: string | undefined;
      let imagesToUse: string[] | undefined;

      // Determine which image to use (uploaded/injected or referenced)
      console.log('🖼️ [Chat] Uploaded images state:', uploadedImages);
      console.log('🖼️ [Chat] Last generated image:', lastGeneratedImage);
      console.log('🖼️ [Chat] Is referencing previous image:', isReferencingPreviousImage);
      
      if (uploadedImages.length > 0) {
        // Priority 1: Use injected/uploaded images
        imageToUse = uploadedImages[0];
        imagesToUse = uploadedImages;
        console.log('🖼️ [Chat] Using uploaded/injected image:', imageToUse);
      } else if (isReferencingPreviousImage && lastGeneratedImage) {
        // Priority 2: Use last generated image when referencing
        imageToUse = lastGeneratedImage;
        imagesToUse = [lastGeneratedImage];
        console.log('🖼️ [Chat] Using last generated image:', imageToUse);
      }

      // Use the selected model directly
      model = preferredVideoModel;
      console.log('🎯 [Chat] Using selected model:', model);

      // Use a simple default prompt if user didn't provide one but has images
      let finalPrompt = userInput.trim();
      if (!finalPrompt && (imageToUse || (imagesToUse && imagesToUse.length > 0))) {
        finalPrompt = 'Animate this image';
        console.log('📝 [Chat] No prompt provided, using default:', finalPrompt);
      }

      const generationData = {
        model,
        prompt: finalPrompt,
        image_url: imageToUse,
        image_urls: imagesToUse,
        aspect_ratio: aspectRatio,
        // Add audio_url for Kling AI Avatar (⚠️ ~20 min processing)
        ...(model === 'fal-ai/kling-video/v1/pro/ai-avatar' && uploadedAudio && {
          audio_url: uploadedAudio
        }),
        // Add required video parameters for video models
        ...(wantsVideo && {
          duration: model.includes('sora-2') ? 4 : '5s', // Sora 2 expects number, others expect string
          resolution: model.includes('sora-2') ? 'auto' : resolution // Sora 2 defaults to 'auto'
        })
      };

      // Set the current model for the spinning icon
      setCurrentModel(model);

      console.log('🎯 [Chat] Final model selection:', {
        selectedModel: model,
        wantsVideo,
        preferredVideoModel,
        hasImage: !!imageToUse
      });

      console.log('🎯 [Chat] Final generation data:', {
        ...generationData,
        hasImage: !!imageToUse,
        imageUrl: imageToUse,
        imagesCount: imagesToUse?.length || 0
      });

      console.log('🎯 [Chat] Generation data being sent:', {
        model,
        aspect_ratio: aspectRatio,
        resolution: resolution,
        duration: duration,
        wantsVideo,
        preferredVideoModel,
        allSettings: { aspectRatio, resolution, duration, preferredVideoModel },
        userAspectRatio: aspectRatio,
        userResolution: resolution,
        detectionReason: hasVideoTrigger ? 'explicit trigger' : hasVideoKeywords ? 'video keywords' : 'default image',
        userInput: userInput,
        hasVideoTrigger,
        hasVideoKeywords,
        videoKeywords: videoKeywords.filter(keyword => userInput.toLowerCase().includes(keyword))
      });

      // Call the generation API directly
      try {
        const result = await onContentGenerated(generationData);
        console.log('✅ [Chat] Generation completed successfully:', result);
        
        // Add success message to chat
        const successMessage = {
          id: (Date.now() + 0.5).toString(),
          type: 'assistant' as const,
          content: wantsVideo 
            ? `✅ Video generated successfully! Check the center panel and gallery.`
            : `✅ Image generated successfully! Check the center panel and gallery.`,
          timestamp: new Date()
        };
        setMessages(prev => prev.slice(0, -1).concat([successMessage]));
        
        // Reset force video generation flag
        setForceVideoGeneration(false);
        
        // Track the last generated image for future references
        if (result?.data?.images?.[0]) {
          setLastGeneratedImage(result.data.images[0].url);
          
          // Show floating suggestions for images (image-to-video workflow)
          showFloatingSuggestions([
            "Animate this character walking",
            "Make video of this character dancing", 
            "Bring this character to life",
            "Animate the image with motion",
            "Create a cinematic video of this character"
          ]);
        }

        // Save to gallery storage
        if (typeof window !== 'undefined') {
          try {
            // Debug: Log the full result to see what we're getting
            console.log('🔍 [Chat] Full generation result:', {
              hasVideos: !!result?.data?.videos,
              videosCount: result?.data?.videos?.length || 0,
              hasImages: !!result?.data?.images,
              imagesCount: result?.data?.images?.length || 0,
              videos: result?.data?.videos,
              images: result?.data?.images
            });

            // Get the URL from the result
            const generatedUrl = result?.data?.videos?.[0]?.url || result?.data?.images?.[0]?.url;
            
            // Only add to storage if we have a valid URL
            if (generatedUrl) {
              const contentToStore = {
                id: `generated-${Date.now()}`,
                type: (result?.data?.videos?.length > 0 ? 'video' : 'image') as 'image' | 'video',
                url: generatedUrl,
                title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
                prompt: userInput,
                timestamp: new Date(),
                metadata: {
                  format: generationData.model,
                  duration: typeof generationData.duration === 'number' ? generationData.duration : 4,
                  aspect_ratio: generationData.aspect_ratio,
                  resolution: generationData.resolution
                }
              };

              console.log('💾 [Chat] Adding content to gallery storage:', contentToStore);
              console.log('💾 [Chat] Current gallery items before add:', contentStorage.loadContent().length);
              contentStorage.addContent(contentToStore);
              console.log('💾 [Chat] Current gallery items after add:', contentStorage.loadContent().length);
            } else {
              console.warn('⚠️ [Chat] No valid URL found in result, skipping gallery storage:', {
                hasVideos: !!result?.data?.videos,
                hasImages: !!result?.data?.images,
                result: result
              });
            }
            
            // Trigger a custom event to notify GalleryView to refresh
            window.dispatchEvent(new CustomEvent('contentUpdated'));
          } catch (error) {
            console.error('❌ [Chat] Failed to save to gallery storage:', error);
          }
        }
        
        onGenerationComplete?.();
        
      } catch (error: any) {
        // If we get a content policy violation with Nano Banana Edit, try Seedream 4.0 Edit as fallback
        if (error.message?.includes('content policy') && 
            error.message?.includes('violation') && 
            generationData.model === 'fal-ai/nano-banana/edit' &&
            imageToUse) {
          
          console.log('🔄 [Chat] Content policy violation detected, trying Seedream 4.0 Edit as fallback...');
          
          // Retry with Seedream 4.0 Edit
          const fallbackGenerationData = {
            ...generationData,
            model: 'fal-ai/bytedance/seedream/v4/edit'
          };
          
          // Set image_size to auto for Seedream 4.0 Edit (maintains input aspect ratio)
          (fallbackGenerationData as any).image_size = "auto";
          delete (fallbackGenerationData as any).aspect_ratio; // Remove aspect_ratio as Seedream uses image_size
          console.log('🔄 [Chat] Set image_size to auto for Seedream queue fallback');
          
          try {
            const result = await onContentGenerated(fallbackGenerationData);
            console.log('✅ [Chat] Fallback generation completed successfully:', result);
            
            const successMessage = {
              id: (Date.now() + 0.5).toString(),
              type: 'assistant' as const,
              content: `✅ Image generated successfully (using fallback model)! Check the center panel and gallery.`,
              timestamp: new Date()
            };
            setMessages(prev => prev.slice(0, -1).concat([successMessage]));
            
            // Reset force video generation flag
            setForceVideoGeneration(false);
            
            // Track the last generated image for future references
            if (result?.data?.images?.[0]) {
              setLastGeneratedImage(result.data.images[0].url);
              
              // Show floating suggestions for images (image-to-video workflow)
              showFloatingSuggestions([
                "Animate this character walking",
                "Make video of this character dancing", 
                "Bring this character to life",
                "Animate the image with motion",
                "Create a cinematic video of this character"
              ]);
            }

            // Save to gallery storage (fallback generation)
            if (typeof window !== 'undefined') {
              try {
                // Get the URL from the fallback result
                const generatedUrl = result?.data?.videos?.[0]?.url || result?.data?.images?.[0]?.url;
                
                // Only add to storage if we have a valid URL
                if (generatedUrl) {
                  const contentToStore = {
                    id: `generated-fallback-${Date.now()}`,
                    type: (result?.data?.videos?.length > 0 ? 'video' : 'image') as 'image' | 'video',
                    url: generatedUrl,
                    title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
                    prompt: userInput,
                    timestamp: new Date(),
                    metadata: {
                      format: fallbackGenerationData.model,
                      duration: typeof fallbackGenerationData.duration === 'number' ? fallbackGenerationData.duration : 4,
                      aspect_ratio: fallbackGenerationData.aspect_ratio,
                      resolution: fallbackGenerationData.resolution,
                      fallback: true
                    }
                  };

                  console.log('💾 [Chat] Adding fallback content to gallery storage:', contentToStore);
                  contentStorage.addContent(contentToStore);
                  
                  // Trigger a custom event to notify GalleryView to refresh
                  window.dispatchEvent(new CustomEvent('contentUpdated'));
                } else {
                  console.warn('⚠️ [Chat] No valid URL found in fallback result, skipping gallery storage');
                }
              } catch (error) {
                console.error('❌ [Chat] Failed to save fallback content to gallery storage:', error);
              }
            }
            
            onGenerationComplete?.();
            return;
          } catch (fallbackError) {
            throw fallbackError;
          }
        } else {
          throw error; // Re-throw if it's not a content policy issue or not the right model
        }
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key press to submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (userInput.trim() || uploadedImages.length > 0)) {
        handleSubmit(e as any);
      }
    }
  }, [isGenerating, userInput, uploadedImages.length, handleSubmit]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    // Auto-submit the suggestion
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }, 100);
  };

  const showFloatingSuggestions = (suggestions: string[]) => {
    setFloatingSuggestions(suggestions);
    setShowFloatingDialog(true);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      setShowFloatingDialog(false);
      // Clear suggestions after animation
      setTimeout(() => {
        setFloatingSuggestions([]);
      }, 300);
    }, 8000);
  };

  const handleFloatingSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    setShowFloatingDialog(false);
    // Auto-submit the suggestion
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }, 100);
  };

  const handleVary = async (imageUrl: string, prompt: string) => {
    setIsGenerating(true);
    try {
      // Define 4 specific cinematic shot variations
      const variationPrompts = [
        'extreme close-up of the character\'s face, cinematic lighting, dramatic focus',
        'extreme close-up of the character\'s midsection, detailed framing, professional cinematography',
        'extreme close-up of something in the character\'s environment, atmospheric details, cinematic composition',
        'wide shot of the character, establishing perspective, cinematic framing'
      ];

      for (const variationPrompt of variationPrompts) {
        // Prioritize user's prompt first, then add the specific shot variation
        const enhancedPrompt = `${prompt}. ${variationPrompt}`;
        
        const generationData = {
          model: 'fal-ai/nano-banana/edit', // Nano Banana Edit for image variations
          prompt: enhancedPrompt,
          image_urls: [imageUrl],
          aspect_ratio: '16:9'
        };

        let result;
        try {
          result = await onContentGenerated(generationData);
        } catch (error: any) {
          // If we get a content policy violation with Nano Banana Edit, try Seedream 4.0 Edit as fallback
          if (error.message?.includes('content policy') && 
              error.message?.includes('violation') && 
              generationData.model === 'fal-ai/nano-banana/edit') {
            
            console.log('🔄 [Chat] Content policy violation detected in variation, trying Seedream 4.0 Edit as fallback...');
            
            // Retry with Seedream 4.0 Edit
            const fallbackGenerationData = {
              ...generationData,
              model: 'fal-ai/bytedance/seedream/v4/edit'
            };
            
            // Set image_size to auto for Seedream 4.0 Edit (maintains input aspect ratio)
            (fallbackGenerationData as any).image_size = "auto";
            delete (fallbackGenerationData as any).aspect_ratio; // Remove aspect_ratio as Seedream uses image_size
            console.log('🔄 [Chat] Set image_size to auto for Seedream fallback');
            
            result = await onContentGenerated(fallbackGenerationData);
          } else {
            throw error; // Re-throw if it's not a content policy issue or not the right model
          }
        }
        
        const images = result.data?.images || result.images || [];
        if (images?.[0]) {
          // Track this as the latest generated image
          setLastGeneratedImage(images[0].url);
          
          // Create descriptive labels for each variation
          const variationLabels = [
            'Extreme Close-up (Face)',
            'Extreme Close-up (Midsection)', 
            'Extreme Close-up (Environment)',
            'Wide Shot (Character)'
          ];
          
          const currentIndex = variationPrompts.indexOf(variationPrompt);
          const variationLabel = variationLabels[currentIndex] || 'Cinematic Variation';
          
          const variationMessage = {
            id: (Date.now() + Math.random()).toString(),
            type: 'assistant' as const,
            content: `✅ Generated ${variationLabel} variation! Check the center panel and gallery.`,
            timestamp: new Date()
            // Removed media property - variations go to center panel and gallery, not chat
          };
          setMessages(prev => [...prev, variationMessage]);
        }
      }
    } catch (error) {
      console.error('Variation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to get a friendly model display name from a model id/endpoint
  const getFriendlyModelName = (modelId: string): string => {
    if (!modelId) return '';
    // Known friendly mappings first
    const map: Record<string, string> = {
      'fal-ai/nano-banana/edit': 'Nano Banana Edit',
      'fal-ai/bytedance/seedream/v4/edit': 'Seedream 4.0 Edit',
      'fal-ai/reve/text-to-image': 'Reve Text-to-Image',
      'fal-ai/reve/edit': 'Reve Edit',
      'fal-ai/reve/remix': 'Reve Remix',
      'fal-ai/veo3.1': 'Veo 3.1',
      'fal-ai/veo3.1/fast': 'Veo 3.1 Fast',
      'fal-ai/veo3.1/image-to-video': 'Veo 3.1 (I2V)',
      'fal-ai/veo3.1/first-last-frame-to-video': 'Veo 3.1 First/Last',
      'fal-ai/veo3.1/fast/first-last-frame-to-video': 'Veo 3.1 Fast First/Last',
      'fal-ai/veo3.1/reference-to-video': 'Veo 3.1 Reference',
      'fal-ai/sora-2/text-to-video': 'Sora 2 (T2V)',
      'fal-ai/sora-2/text-to-video/pro': 'Sora 2 Pro (T2V)',
      'fal-ai/sora-2/image-to-video': 'Sora 2 (I2V)',
      'fal-ai/sora-2/image-to-video/pro': 'Sora 2 Pro (I2V)',
      'fal-ai/kling-video/v1/pro/ai-avatar': 'Kling AI Avatar Pro',
      'fal-ai/kling-video/v2.1/master/text-to-video': 'Kling 2.1 Master (T2V)',
      'fal-ai/kling-video/v2.1/master/image-to-video': 'Kling 2.1 Master (I2V)',
      'fal-ai/kling-video/v2.5-turbo/pro/text-to-video': 'Kling 2.5 Turbo Pro (T2V)',
      'fal-ai/kling-video/v2.5-turbo/pro/image-to-video': 'Kling 2.5 Turbo Pro (I2V)',
      'fal-ai/wan-25-preview/text-to-image': 'Wan 2.5 (T2I)',
      'fal-ai/wan-25-preview/image-to-image': 'Wan 2.5 (I2I)',
      'fal-ai/wan-25-preview/text-to-video': 'Wan 2.5 (T2V)',
      'fal-ai/wan-25-preview/image-to-video': 'Wan 2.5 (I2V)',
      'endframe/minimax-hailuo-02': 'EndFrame',
    };
    if (map[modelId]) return map[modelId];
    // Fallback: extract the last segment after the last '/'
    const parts = modelId.split('/');
    const last = parts[parts.length - 1] || modelId;
    // Replace hyphens with spaces and capitalize words
    return last
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Models AI</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Describe your idea to generate content</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Model Preferences Dropdown */}
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelSelector(true)}
                className="w-40 h-8 text-xs justify-between"
              >
                <span className="truncate">
                  {(() => {
                    const currentModel = modelsByCategory[Object.keys(modelsByCategory).find(category => 
                      modelsByCategory[category].find(model => model.value === preferredVideoModel)
                    ) || 'text-to-image']?.find(model => model.value === preferredVideoModel);
                    if (currentModel) return currentModel.label;
                    return 'Select Model';
                  })()}
                </span>
                <Sparkles className="h-3 w-3 text-purple-500" />
              </Button>
              {/* Duration indicator for video models */}
              {isVideoModel(preferredVideoModel) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {duration}s
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Clear chat history"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-sm">Start a conversation to generate content</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-3`}>
                <p className="text-sm">{message.content}</p>
                
                
                {message.media && (
                  <div className="mt-2">
                    {message.media.type === 'image' ? (
                      <div className="relative group">
                        <img 
                          src={message.media.url} 
                          alt={message.content}
                          className="w-full h-auto rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleDownload(message.media!.url, message.media!.filename || 'download')}
                              className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                            >
                              <Download className="w-3 h-3 inline mr-1" />
                              Download
                            </button>
                            <button 
                              onClick={() => handleVary(message.media!.url, message.content)}
                              className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                            >
                              <Shuffle className="w-3 h-3 inline mr-1" />
                              Vary
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : message.media.type === 'video' ? (
                      <video 
                        src={message.media.url} 
                        controls
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <audio 
                        src={message.media.url} 
                        controls
                        className="w-full"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {/* Enhanced Loading Modal */}
        <EnhancedLoadingModal 
          isOpen={isGenerating} 
          model={currentModel}
          onClose={() => setIsGenerating(false)}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length === 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions:</p>
          <div className="space-y-2">
            {[
              "Create a cinematic shot with dramatic lighting",
              "Generate a character portrait",
              "Make a nature landscape scene",
              "Animate this image with smooth motion",
              "Create a cinematic video with camera movement"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setUserInput(suggestion)}
                className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {/* Contextual Help for Multi-Image Models */}
        {(() => {
          const limits = getModelImageLimits(preferredVideoModel);
          const isMultiImageModel = limits.max > 1;
          
          if (!isMultiImageModel || uploadedImages.length >= limits.min) return null;
          
          const helpMessages: Record<string, string> = {
            'fal-ai/reve/remix': '💡 Upload 1-4 reference images to combine into a beautiful new composition',
            'fal-ai/dreamomni2/edit': '💡 Upload 2 images: First = source to edit, Second = style reference',
            'endframe/minimax-hailuo-02': '💡 Upload exactly 2 images: First = start frame, Second = end frame',
            'fal-ai/nano-banana/edit': '💡 Upload 1-10 images to edit and combine with Gemini AI',
            'fal-ai/bytedance/seedream/v4/edit': '💡 Upload 1-10 images for professional multi-image editing',
            'fal-ai/wan-25-preview/image-to-image': '💡 Upload 1-2 images for subject-consistent editing or fusion',
            'fal-ai/flux-pro/kontext/max/multi': '💡 Upload 2-4 images for multi-context editing',
            'fal-ai/flux-pro/kontext/multi': '💡 Upload 1-4 images to create variations',
            'fal-ai/veo3.1/reference-to-video': '💡 Upload 1+ reference images for consistent video generation',
            'fal-ai/meshy/v5/multi-image-to-3d': '💡 Upload 2-10 images from different angles for 3D model generation',
            'fal-ai/veo3.1/first-last-frame-to-video': '💡 Upload 2 images: First = start frame, Second = end frame',
            'fal-ai/veo3.1/fast/first-last-frame-to-video': '💡 Upload 2 images: First = start frame, Second = end frame',
          };
          
          return (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Multi-Image Model:</strong> {helpMessages[preferredVideoModel] || 
                    `This model supports ${limits.min}-${limits.max} images. Upload ${limits.optimal} for best results.`}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Uploaded Images Preview with Multi-Image Support */}
        {uploadedImages.length > 0 && (
          <div className="mb-4">
            {(() => {
              const limits = getModelImageLimits(preferredVideoModel);
              const isMultiImageModel = limits.max > 1;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploaded Images: {uploadedImages.length}
                      {isMultiImageModel && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                          (Max: {limits.max}, Recommended: {limits.optimal})
                        </span>
                      )}
                    </p>
                    
                    {isMultiImageModel && (
                      <div className="flex gap-1" title={`${uploadedImages.length}/${limits.max} images uploaded`}>
                        {Array.from({ length: limits.max }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i < uploadedImages.length ? 'bg-green-500' :
                              i < limits.min ? 'bg-red-300' :
                              'bg-gray-300'
                            }`}
                            title={
                              i < uploadedImages.length ? 'Uploaded' :
                              i < limits.min ? 'Required' :
                              'Optional'
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image, index) => {
                const sizeKB = Math.round((image.length * 3) / 4 / 1024);
                return (
                <div key={index} className="relative group">
                        <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">
                          {index + 1}
                        </div>
                  <img 
                    src={image} 
                    alt={`Uploaded ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors"
                  />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {sizeKB}KB
                    </div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                );
              })}
            </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Intelligent Intent Detection Indicator */}
        {uploadedImages.length >= 2 && userInput.trim() && (
          (() => {
            const intent = detectUserIntent(userInput, uploadedImages.length);
            const intentConfig = {
              'endframe': {
                icon: '🎬',
                title: 'EndFrame Transition Detected',
                description: 'Creating video between your start and end frames',
                bgColor: 'from-purple-50 to-blue-50',
                borderColor: 'border-purple-200',
                textColor: 'text-purple-800',
                dotColor: 'bg-purple-500'
              },
              'character-addition': {
                icon: '👤',
                title: 'Character Addition Detected',
                description: 'Adding characters to your scene using Nano Banana',
                bgColor: 'from-green-50 to-emerald-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                dotColor: 'bg-green-500'
              },
              'scene-editing': {
                icon: '✏️',
                title: 'Scene Editing Detected',
                description: 'Modifying your image using Seedream 4.0',
                bgColor: 'from-orange-50 to-amber-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-800',
                dotColor: 'bg-orange-500'
              },
              'multi-composition': {
                icon: '🎨',
                title: 'Multi-Image Composition Detected',
                description: 'Combining elements from your images using Wan 2.5',
                bgColor: 'from-pink-50 to-rose-50',
                borderColor: 'border-pink-200',
                textColor: 'text-pink-800',
                dotColor: 'bg-pink-500'
              },
              'unknown': {
                icon: '🤔',
                title: 'Multiple Images Ready',
                description: 'Choose your preferred model for the best results',
                bgColor: 'from-gray-50 to-slate-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-800',
                dotColor: 'bg-gray-500'
              }
            };
            
            const config = intentConfig[intent] || intentConfig['unknown'];
            
            return (
              <div className={`mb-4 p-3 bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-lg`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${config.dotColor} rounded-full animate-pulse`}></div>
                  <p className={`text-sm font-medium ${config.textColor}`}>
                    {config.icon} {config.title}
                  </p>
                </div>
                <p className={`text-xs ${config.textColor.replace('800', '600')} mt-1`}>
                  {config.description}
                </p>
                <p className={`text-xs ${config.textColor.replace('800', '500')} mt-1`}>
                  Model: {getFriendlyModelName(getRecommendedModel(intent))}
                </p>
              </div>
            );
          })()
        )}

        {/* Audio Upload for Kling AI Avatar (⚠️ ~20 min processing time) */}
        {preferredVideoModel === 'fal-ai/kling-video/v1/pro/ai-avatar' && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Audio File (Required for AI Avatar):
            </p>
            <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                ⏰ <strong>Note:</strong> Kling AI Avatar Pro takes approximately 20 minutes to process
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              {uploadedAudio ? (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600">🎵</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Audio file uploaded</span>
                  <button
                    onClick={() => setUploadedAudio(null)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-gray-500">🎵</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drop audio file here or click to upload</p>
                  <p className="text-xs text-gray-400">Supports: MP3, WAV, M4A, AAC (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Row */}
          <div className="flex space-x-3">
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImages || isProcessingAudio}
              className={`flex-shrink-0 p-3 border rounded-lg transition-all duration-200 group ${
                isProcessingImages || isProcessingAudio
                  ? 'text-gray-400 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:text-gray-400 dark:border-gray-600 dark:hover:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-gray-800'
              }`}
              title={isProcessingImages || isProcessingAudio ? "Processing files..." : "Upload images and audio"}
            >
              <div className="flex flex-col items-center">
                {(isProcessingImages || isProcessingAudio) ? (
                  <RefreshCw className="w-5 h-5 mb-1 animate-spin" />
                ) : (
                <FileImage className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-medium">
                  {(isProcessingImages || isProcessingAudio) ? 'Processing...' : 'Upload'}
                </span>
              </div>
            </button>

            {/* Text Input with Drop Zone */}
            <div className="flex-1 relative">
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative"
              >
                {/* Drop Zone Visual Overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950 bg-opacity-90 rounded-lg flex items-center justify-center z-10 border-2 border-blue-400 dark:border-blue-500">
                    <div className="text-center">
                      <CloudUpload className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-2 animate-bounce" />
                      <p className="text-blue-600 dark:text-blue-400 font-medium">Drop images here</p>
                    </div>
                  </div>
                )}

                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your idea... or drag and drop images here (Press Enter to send)"
                  className={`min-h-[80px] resize-none border-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 pr-12 transition-all duration-200 dark:bg-gray-900 dark:text-white ${
                    isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : ''
                  }`}
                  disabled={isGenerating}
                />
                
                {/* Send Button */}
                <Button 
                  type="submit" 
                  disabled={isGenerating || (!userInput.trim() && uploadedImages.length === 0)}
                  size="sm"
                  className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>I'll automatically optimize your prompt for best results</span>
            <span>Supports: JPG, PNG, WebP</span>
          </div>

          {/* Settings and Queue Buttons */}
          <div className="flex justify-center gap-2 mt-3">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Generation Settings</DialogTitle>
                  <DialogDescription>
                    Configure your preferred aspect ratio, resolution, and video model.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="3:4">3:4 (Portrait Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p (HD)</SelectItem>
                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                        <SelectItem value="1440p">1440p (2K)</SelectItem>
                        <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration Control - Only show for video models */}
                  {isVideoModel(preferredVideoModel) && (
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (seconds)</Label>
                      <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSupportedDurations(preferredVideoModel).map((durationOption) => (
                            <SelectItem key={durationOption.value} value={durationOption.value.toString()}>
                              {durationOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Duration options for {preferredVideoModel.includes('sora') ? 'Sora 2' : 
                        preferredVideoModel.includes('veo') ? 'Veo 3' :
                        preferredVideoModel.includes('kling') ? (preferredVideoModel.includes('v2.5-turbo') ? 'Kling V2.5 Turbo Pro' : 'Kling') :
                        preferredVideoModel.includes('minimax') ? 'Minimax' :
                        preferredVideoModel.includes('hunyuan') ? 'Hunyuan' :
                        preferredVideoModel.includes('wan-pro') ? 'Wan Pro' :
                        preferredVideoModel.includes('wan/v2.2-a14b') ? 'Wan v2.2-A14B' :
                        preferredVideoModel.includes('wan-25-preview') ? 'Wan 2.5 Preview' :
                        preferredVideoModel.includes('ovi') ? 'Ovi' :
                        preferredVideoModel.includes('luma') ? 'Luma Ray 2' : 'this model'}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="video-model">Preferred Model</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowModelSelector(true)}
                    >
                      <span className="flex items-center gap-2">
                        <img 
                          src={getModelIcon(preferredVideoModel)} 
                          alt="Current model" 
                          className="w-4 h-4" 
                        />
                        {(() => {
                          for (const category in modelsByCategory) {
                            const model = modelsByCategory[category]?.find(m => m.value === preferredVideoModel);
                            if (model) return model.label;
                          }
                          return 'Select a model';
                        })()}
                      </span>
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    </Button>
                    <p className="text-xs text-gray-500">
                      Click to browse models by category
                    </p>
                    {preferredVideoModel && (() => {
                      for (const category in modelsByCategory) {
                        const model = modelsByCategory[category]?.find(m => m.value === preferredVideoModel);
                        if (model && model.description) {
                          return (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                              {model.description}
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>




                </div>
              </DialogContent>
            </Dialog>

            {/* Model Selection Modal */}
            <ModelSelectionModal
              isOpen={showModelSelector}
              onClose={() => setShowModelSelector(false)}
              currentModel={preferredVideoModel}
              onModelSelect={handleModelSelectionChange}
              models={modelsByCategory}
            />

          </div>
        </form>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <p className="text-xs text-gray-400 mt-2">
          Chat Mode can make mistakes. Double check responses.
        </p>
      </div>

      {/* Floating Suggestions Dialog */}
      {showFloatingDialog && floatingSuggestions.length > 0 && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showFloatingDialog ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">💡 Quick Actions</h3>
              <button
                onClick={() => setShowFloatingDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {floatingSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleFloatingSuggestionClick(suggestion)}
                  className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-200 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click any suggestion to animate your image with video
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
