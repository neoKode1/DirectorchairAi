"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Send,
  X,
  Download,
  Shuffle,
  FileImage,
  CloudUpload,
  Settings,
  Monitor
} from 'lucide-react';

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

function CompanyIcon({ name }: { name: string }) {
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
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<{ url: string; name: string; size: number } | null>(null);
  const showSuggestions = true;
  const [isDragOver, setIsDragOver] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingSuggestions, setFloatingSuggestions] = useState<string[]>([]);
  const [showFloatingDialog, setShowFloatingDialog] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [preferredVideoModel, setPreferredVideoModel] = useState<string>('fal-ai/sora-2/image-to-video');
  const [creativeDirection, setCreativeDirection] = useState<string>('cinematic');
  const [forceVideoGeneration, setForceVideoGeneration] = useState<boolean>(false);
  const [useDirectorAI, setUseDirectorAI] = useState<boolean>(true);
  const [agentHistory, setAgentHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [waitingForImage, setWaitingForImage] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<{ personaName: string; personaDescription: string; tags: string[] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styleFileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ─── PERSONA INJECTION ───
  // Check sessionStorage for an injected persona from the Personas page
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('directorchair-active-persona');
      if (!raw) return;
      const payload = JSON.parse(raw);
      // Only consume if injected recently (within 30 seconds)
      if (Date.now() - payload.injectedAt > 30_000) {
        sessionStorage.removeItem('directorchair-active-persona');
        return;
      }
      // Consume — remove so it doesn't re-inject on refresh
      sessionStorage.removeItem('directorchair-active-persona');

      // Inject reference images into the upload area
      if (payload.images && payload.images.length > 0) {
        setUploadedImages(payload.images);
      }

      // Set active persona state for UI banner
      setActivePersona({
        personaName: payload.personaName,
        personaDescription: payload.personaDescription,
        tags: payload.tags || [],
      });

      // Inject persona context into agent conversation history
      // so the AI knows what character it's working with
      const personaContext = [
        `[PERSONA LOADED] The user has loaded a character persona named "${payload.personaName}".`,
        payload.personaDescription ? `Character description: ${payload.personaDescription}` : '',
        payload.tags?.length ? `Tags: ${payload.tags.join(', ')}` : '',
        `${payload.images?.length || 0} reference image(s) have been uploaded to maintain character consistency.`,
        `When generating images or videos, use these reference images to keep the character's appearance consistent.`,
        `Treat all uploaded images as reference photos of the SAME character "${payload.personaName}".`,
      ].filter(Boolean).join(' ');

      setAgentHistory([{ role: 'user', content: personaContext }]);

      // Add a system message to the chat UI
      setMessages(prev => [...prev, {
        id: `persona-${Date.now()}`,
        type: 'assistant' as const,
        content: `🎭 **${payload.personaName}** loaded with ${payload.images?.length || 0} reference image(s). I'll use these to maintain character consistency across all generations. What would you like to create with this character?`,
        timestamp: new Date(),
      }]);
    } catch (e) {
      console.error('[PERSONA INJECT] Failed:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── MODEL PROMPT EXAMPLES ───
  // Cycling placeholder hints per model so users know how to prompt
  const MODEL_PROMPT_EXAMPLES: Record<string, string[]> = {
    // ── I2V models ──
    'sora-2/image-to-video': [
      'e.g. "Slow dolly-in on the subject, soft bokeh background gently shifts"',
      'e.g. "Camera pans right revealing a vast ocean, waves crash dramatically"',
      'e.g. "Subject turns toward camera and smiles, warm golden hour light"',
    ],
    'sora-2/video-to-video/remix': [
      'e.g. "Transform this into a Studio Ghibli anime style"',
      'e.g. "Restyle as a noir detective film, black and white, high contrast"',
      'e.g. "Make it look like a watercolor painting in motion"',
    ],
    'veo3.1': [
      'e.g. "Cinematic tracking shot through a neon-lit Tokyo alley at night"',
      'e.g. "Slow-motion close-up of raindrops hitting a window, ASMR audio"',
      'e.g. "Drone shot ascending over a misty mountain range at sunrise"',
    ],
    'first-last-frame': [
      'e.g. "Smooth transition from dawn to sunset over a cityscape"',
      'e.g. "Character walks from frame 1 position to frame 2 position"',
    ],
    'imagen4': [
      'e.g. "A photorealistic portrait of a woman in Renaissance attire, oil painting style"',
      'e.g. "Isometric 3D render of a cozy coffee shop, warm lighting, detailed interior"',
      'e.g. "Product photography of a luxury watch on black marble, studio lighting"',
    ],
    'kling-video/v3': [
      'e.g. "Subject walks forward confidently, camera tracks alongside, cinematic depth"',
      'e.g. "Dramatic zoom into subject\'s eyes, shallow DOF, emotional close-up"',
      'e.g. "Wide establishing shot, subject in center, wind blows through hair"',
    ],
    'kling-video/o3': [
      'e.g. "Subject walks forward confidently, camera tracks alongside, cinematic depth"',
      'e.g. "Dramatic zoom into subject\'s eyes, shallow DOF, emotional close-up"',
    ],
    'kling-video/v2.6/pro/image-to-video': [
      'e.g. "Subject speaks: \\"Welcome to the future\\" — dramatic pause, eye contact"',
      'e.g. "Gentle head turn, soft smile, natural hair movement, studio lighting"',
    ],
    'video-to-video/edit': [
      'e.g. "Transform @Element1 into a cyberpunk character with neon accents"',
      'e.g. "Change the background to a snowy mountain landscape, keep subject"',
      'e.g. "Make the scene look like it was shot on 35mm film, add grain"',
    ],
    'motion-control': [
      'e.g. Upload a dance video + character image → transfers the dance to your character',
      'e.g. Upload a gesture video + portrait → character mimics the gestures',
    ],
    'ai-avatar': [
      'e.g. "Subject speaks naturally with subtle head movements and expressions"',
      'e.g. "Talking head presentation style, professional, slight gestures"',
    ],
    'hailuo': [
      'e.g. "Smooth camera orbit around subject, soft ambient lighting, 6 seconds"',
      'e.g. "Subject looks up in wonder as particles float upward, dreamy atmosphere"',
    ],
    'pixverse': [
      'e.g. "Dynamic action scene, character leaps through the air, slow motion"',
      'e.g. "Magical transformation sequence with sparkle effects and color shift"',
    ],
    'seedance-2.0': [
      'e.g. "The character walks through a garden, soft sunlight, reference images maintain consistency"',
      'e.g. "Subject dances gracefully with flowing fabric, cinematic camera, 8 seconds"',
    ],
    'seedance': [
      'e.g. "Subject dances gracefully, flowing fabric, soft backlight, 8 seconds"',
      'e.g. "Character performs martial arts moves, dynamic camera angles"',
    ],
    'grok-imagine-video/text-to-video': [
      'e.g. "A cat wearing sunglasses surfing a wave at sunset, cinematic 4K"',
      'e.g. "Time-lapse of a flower blooming in a forest clearing, morning dew"',
    ],
    'grok-imagine-video/image-to-video': [
      'e.g. "Subject comes to life, subtle breathing motion, eyes blink naturally"',
      'e.g. "Zoom out slowly revealing the full scene, add gentle wind motion"',
    ],
    'luma-dream-machine': [
      'e.g. "Ethereal camera movement, subject bathed in volumetric light"',
      'e.g. "Dreamy slow-motion, particles floating, shallow depth of field"',
    ],
    'wan-pro': [
      'e.g. "Subject turns head slowly, natural hair physics, soft studio lighting"',
      'e.g. "Gentle zoom into portrait, subtle expression change, warm tones"',
    ],
    'hunyuan-video': [
      'e.g. "A futuristic cityscape with flying cars, neon reflections on wet streets"',
      'e.g. "Underwater scene with bioluminescent jellyfish, deep blue ambiance"',
    ],
    'dreamactor': [
      'e.g. Upload a portrait + driving video → face animation transfer',
      'e.g. Upload headshot + expression video → lip-sync and expression transfer',
    ],
    'ovi/': [
      'e.g. "Subject sings along to the music, natural lip sync, concert lighting"',
      'e.g. "Character speaks with emotion, synchronized audio, studio backdrop"',
    ],
    // ── Image models ──
    'flux-pro': [
      'e.g. "A hyperrealistic astronaut riding a horse on Mars, dramatic sky"',
      'e.g. "Minimalist logo design, clean lines, modern typography, white background"',
    ],
    'flux-2-flex': [
      'e.g. "Concept art of a steampunk airship over Victorian London"',
      'e.g. "Fashion editorial photo, model in avant-garde outfit, studio lighting"',
    ],
    'nano-banana': [
      'e.g. "Change the outfit to a red dress" or "Add sunglasses to the subject"',
      'e.g. "Replace the background with a tropical beach at sunset"',
    ],
    'gemini': [
      'e.g. "Edit this image: make the sky a dramatic purple sunset"',
      'e.g. "Add a reflection in the water, enhance the lighting"',
    ],
    'grok-imagine-image/edit': [
      'e.g. "Transform this portrait into a comic book style illustration"',
      'e.g. "Change the season to winter, add snow to the scene"',
    ],
    'seedream': [
      'e.g. "A photorealistic landscape with dramatic storm clouds, lightning"',
      'e.g. "Character design sheet, multiple angles, fantasy warrior, detailed armor"',
    ],
    'dreamina': [
      'e.g. "High-detail product rendering, glass material, caustic lighting"',
      'e.g. "Anime character portrait, vibrant colors, detailed eyes, soft shading"',
    ],
    'stable-diffusion': [
      'e.g. "A serene Japanese garden in autumn, koi pond, red maple leaves"',
      'e.g. "Sci-fi mech design, battle-worn, standing in a ruined city"',
    ],
    'recraft': [
      'e.g. "Vector illustration of a mountain landscape, flat design, vibrant colors"',
      'e.g. "Brand identity mockup, modern serif logo, earth tone palette"',
    ],
    'qwen': [
      'e.g. "Remove the background and replace with a gradient"',
      'e.g. "Enhance the colors, add cinematic color grading"',
    ],
    'ideogram': [
      'e.g. "Typography poster: \'DREAM BIG\' in 3D chrome letters, retro style"',
      'e.g. "Infographic layout with icons and data visualization, clean design"',
    ],
    'flux-krea-lora': [
      'e.g. "Apply the style of this reference to a new scene"',
      'e.g. "Transfer the artistic style, keep the composition"',
    ],
    'flux-pro/kontext': [
      'e.g. "Change the subject\'s hair color to platinum blonde"',
      'e.g. "Add a hat to the character, keep everything else the same"',
    ],
    'wan/v2.7': [
      'e.g. "Photorealistic portrait with dramatic Rembrandt lighting"',
      'e.g. "Surreal dreamscape, floating islands, aurora in the sky"',
    ],
  };

  // Resolve the prompt example for the current model
  const getModelPlaceholder = useCallback((): string => {
    if (!preferredVideoModel || preferredVideoModel === 'none') {
      return useDirectorAI
        ? 'Tell the Director what to create...'
        : 'Describe your idea... (Enter to send)';
    }
    // Find matching key (longest match first)
    const keys = Object.keys(MODEL_PROMPT_EXAMPLES).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (preferredVideoModel.includes(key)) {
        const examples = MODEL_PROMPT_EXAMPLES[key];
        // Cycle through examples based on a slow timer
        const idx = Math.floor(Date.now() / 8000) % examples.length;
        return examples[idx];
      }
    }
    return useDirectorAI
      ? 'Tell the Director what to create...'
      : 'Describe your idea... (Enter to send)';
  }, [preferredVideoModel, useDirectorAI]);

  // Cycling placeholder state
  const [placeholderText, setPlaceholderText] = useState('');
  useEffect(() => {
    setPlaceholderText(getModelPlaceholder());
    const interval = setInterval(() => {
      setPlaceholderText(getModelPlaceholder());
    }, 8000);
    return () => clearInterval(interval);
  }, [getModelPlaceholder]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Models that support a dedicated style reference image
  const STYLE_TRANSFER_MODELS = [
    'flux-krea-lora',     // FLUX LoRA I2I — image_url IS the style source
    'omni-zero',          // Omni Zero — has explicit style_image_url
    'style-transfer',     // fal-ai/image-editing/style-transfer
  ];
  const isStyleTransferModel = (model: string) =>
    STYLE_TRANSFER_MODELS.some(key => model.includes(key));

  // Helper function to get model icon
  const getModelIcon = (model: string) => {
    if (model.includes('nano-banana')) return '/gemini-color.svg';
    if (model.includes('flux')) return '/flux.svg';
    if (model.includes('kling')) return '/kling-color.svg';
    if (model.includes('minimax')) return '/minimax-color.svg';
    if (model.includes('seedream') || model.includes('bytedance')) return '/bytedance-color.svg';
    if (model.includes('veo3')) return '/Gen4.png'; // Using Gen4 for Veo 3
    if (model.includes('luma')) return '/dreammachine.png';
    if (model.includes('imagen')) return '/Gen4.png';
    if (model.includes('photon')) return '/ideogram.svg';
    if (model.includes('recraft')) return '/ideogram.svg';
    return '/gemini-color.svg'; // Default fallback
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedLastImage = localStorage.getItem('directorchair-last-generated-image');
    const savedSettings = localStorage.getItem('directorchair-settings');

    if (savedLastImage) setLastGeneratedImage(savedLastImage);

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const validRatios = ['16:9', '9:16', '4:3', '3:4'];
        setAspectRatio(validRatios.includes(settings.aspectRatio) ? settings.aspectRatio : '16:9');
        setResolution(settings.resolution || '1080p');
        setPreferredVideoModel(settings.preferredVideoModel || 'none');
        if (settings.creativeDirection) setCreativeDirection(settings.creativeDirection);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Auto-cleanup old messages to prevent localStorage quota exceeded errors
  // Single effect on messages.length to avoid re-render loops
  useEffect(() => {
    const MAX_MESSAGES = 25;
    const MAX_MEDIA_MESSAGES = 10;

    if (messages.length <= MAX_MESSAGES) return;

    // Start with the last MAX_MESSAGES
    let cleaned = messages.slice(-MAX_MESSAGES);

    // If still too many media messages, drop oldest media messages
    const mediaIds = new Set(
      cleaned
        .filter(msg => msg.media?.url)
        .slice(0, -MAX_MEDIA_MESSAGES) // oldest beyond limit
        .map(msg => msg.id)
    );

    if (mediaIds.size > 0) {
      cleaned = cleaned.filter(msg => !mediaIds.has(msg.id));
    }

    setMessages(cleaned);
    console.log(`🧹 [Chat] Cleanup: ${messages.length} → ${cleaned.length} msgs, dropped ${mediaIds.size} old media`);
  }, [messages.length]);

  // Save last generated image to localStorage whenever it changes
  useEffect(() => {
    if (lastGeneratedImage) {
      try {
        localStorage.setItem('directorchair-last-generated-image', lastGeneratedImage);
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
        preferredVideoModel,
        creativeDirection
      };
      localStorage.setItem('directorchair-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [aspectRatio, resolution, preferredVideoModel, creativeDirection]);


  // Compress/resize an image to stay under ~2MB base64
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_DIMENSION = 1920; // Cap at 1920px on longest side
        let { width, height } = img;

        // Scale down if needed
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }
        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG at 0.85 quality for good size/quality balance
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        console.log(`📸 [Chat] Compressed image: ${file.name} (${(file.size / 1024).toFixed(0)}KB → ${(dataUrl.length * 0.75 / 1024).toFixed(0)}KB, ${width}x${height})`);
        resolve(dataUrl);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
      img.src = url;
    });
  }, []);

  const MAX_VIDEO_SIZE_MB = 200;

  const processFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(async file => {
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(file);
          setUploadedImages(prev => [...prev, compressed]);
        } catch (err) {
          console.error('Failed to compress image:', err);
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) setUploadedImages(prev => [...prev, result]);
          };
          reader.readAsDataURL(file);
        }
      } else if (file.type.startsWith('video/')) {
        // Validate video: .mp4/.mov, max 200MB
        const validTypes = ['video/mp4', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
          alert('Only .mp4 and .mov video files are supported.');
          return;
        }
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          alert(`Video too large. Max size is ${MAX_VIDEO_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(0)}MB.`);
          return;
        }
        // Create a local object URL for preview/playback
        const videoUrl = URL.createObjectURL(file);
        setUploadedVideo({ url: videoUrl, name: file.name, size: file.size });
        console.log(`🎬 [Chat] Video uploaded: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      }
    });
  }, [compressImage]);

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
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
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

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Style image upload handler
  const handleStyleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file);
      setStyleImage(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) setStyleImage(result);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, []);

  const clearChatHistory = () => {
    setMessages([]);
    setLastGeneratedImage(null);
    try {
      // Clear all DirectorChair-related localStorage items
      localStorage.removeItem('directorchair-chat-messages');
      localStorage.removeItem('directorchair-last-generated-image');
      localStorage.removeItem('directorchair-settings');
      // Also clear any content gallery items that might be taking up space
      localStorage.removeItem('directorchair-content-gallery');
      console.log('✅ [Chat] Chat history and localStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
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

  // Agent mode submit handler
  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && uploadedImages.length === 0 && !uploadedVideo) return;

    const currentInput = userInput.trim();
    const currentImages = [...uploadedImages];
    const currentVideo = uploadedVideo;
    const currentStyleImage = styleImage;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: currentInput,
      timestamp: new Date(),
      media: currentVideo ? {
        type: 'video' as const,
        url: currentVideo.url,
        filename: currentVideo.name
      } : currentImages.length > 0 ? {
        type: 'image' as const,
        url: currentImages[0],
        filename: 'uploaded-image'
      } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setUploadedImages([]);
    setStyleImage(null);
    if (uploadedVideo?.url.startsWith('blob:')) URL.revokeObjectURL(uploadedVideo.url);
    setUploadedVideo(null);
    setIsGenerating(true);
    setWaitingForImage(null);
    onGenerationStarted?.();

    try {
      // Build image context for the agent:
      // 1. User-uploaded images take priority
      // 2. Fall back to last generated image if user is referencing previous content
      let agentImageUrls: string[] | undefined;
      if (currentImages.length > 0) {
        agentImageUrls = currentImages;
      } else if (lastGeneratedImage) {
        // Always include last generated image so the agent can chain workflows
        // (e.g., "generate image" → "animate this" → "make a video")
        agentImageUrls = [lastGeneratedImage];
      }

      // If user uploaded a video, convert blob URL to base64 data URI for the API
      let agentVideoUrl: string | undefined;
      if (currentVideo) {
        try {
          const videoBlob = await fetch(currentVideo.url).then(r => r.blob());
          agentVideoUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(videoBlob);
          });
        } catch (err) {
          console.error('Failed to convert video to data URI:', err);
        }
      }

      const res = await fetch('/api/chat/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: currentInput,
          conversationHistory: agentHistory,
          imageUrls: agentImageUrls,
          videoUrl: agentVideoUrl,
          styleImageUrl: currentStyleImage || undefined,
          userSettings: {
            aspectRatio,
            resolution,
            preferredVideoModel,
            creativeDirection
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Agent request failed' }));
        throw new Error(errData.error || `Agent error ${res.status}`);
      }

      const data = await res.json();

      // Update agent conversation history
      setAgentHistory(prev => [
        ...prev,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: data.response || '' }
      ]);

      // Process actions from the agent
      if (data.actions && Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.type === 'generate') {
            // Execute generation through the existing pipeline
            // Pass ALL model-specific params the agent may have set
            // IMPORTANT: User's dropdown settings ALWAYS take priority over agent choices
            const generationData: Record<string, any> = {
              model: action.model,
              prompt: action.prompt,
              image_url: action.image_url,
              image_urls: action.image_urls,
              aspect_ratio: action.aspect_ratio || aspectRatio, // Trust agent-resolved, fallback to dropdown
              ...(action.generationType === 'video' && {
                duration: action.duration || '5',
                resolution: action.resolution || resolution, // Trust agent-resolved, fallback to dropdown
                generate_audio: action.generate_audio
              }),
              // Special params for specific models
              ...(action.end_image_url && { end_image_url: action.end_image_url }),
              ...(action.first_frame_url && { first_frame_url: action.first_frame_url }),
              ...(action.last_frame_url && { last_frame_url: action.last_frame_url }),
              ...(action.driving_video && { driving_video: action.driving_video }),
              ...(action.video_url && { video_url: action.video_url }),
              ...(action.character_orientation && { character_orientation: action.character_orientation }),
              ...(action.keep_audio !== undefined && { keep_audio: action.keep_audio }),
              ...(action.elements && { elements: action.elements }),
              ...(action.style_image_url && { style_image_url: action.style_image_url }),
              ...(action.style && { style: action.style }),
              ...(action.negative_prompt && { negative_prompt: action.negative_prompt })
            };

            setCurrentModel(action.model);

            try {
              const result = await onContentGenerated(generationData);
              const images = result?.data?.images || result?.images || [];
              const videos = result?.data?.videos || (result?.data?.video ? [result.data.video] : result?.videos || []);

              if (images?.[0]) {
                setLastGeneratedImage(images[0].url);
                // Show generated image in chat
                const imgMsg = {
                  id: (Date.now() + 2).toString(),
                  type: 'assistant' as const,
                  content: `✅ Generated with ${action.model.split('/').pop()}`,
                  timestamp: new Date(),
                  media: { type: 'image' as const, url: images[0].url, filename: 'generated.png' }
                };
                setMessages(prev => [...prev, imgMsg]);
              } else if (videos?.[0]) {
                // Show generated video in chat
                const vidMsg = {
                  id: (Date.now() + 2).toString(),
                  type: 'assistant' as const,
                  content: `✅ Video generated with ${action.model.split('/').pop()}`,
                  timestamp: new Date(),
                  media: { type: 'video' as const, url: videos[0].url, filename: 'generated.mp4' }
                };
                setMessages(prev => [...prev, vidMsg]);
              }
            } catch (genError) {
              console.error('🤖 [Agent] Generation failed:', genError);
              const errMsg = {
                id: (Date.now() + 2).toString(),
                type: 'assistant' as const,
                content: `❌ Generation failed: ${genError instanceof Error ? genError.message : 'Unknown error'}`,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errMsg]);
            }
          } else if (action.type === 'request_image') {
            setWaitingForImage(action.reason);
          }
        }
      }

      // Add agent response to chat
      if (data.response) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

      onGenerationComplete?.();
    } catch (error) {
      console.error('🤖 [Agent] Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `Sorry, the Director AI encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && uploadedImages.length === 0) return;

    // Detect if user wants video generation based on keywords (very specific to avoid false positives)
    // Trigger words that force video generation (image-to-video only)
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
    const wantsVideo = hasVideoTrigger || forceVideoGeneration;

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
    setStyleImage(null);
    if (uploadedVideo?.url.startsWith('blob:')) URL.revokeObjectURL(uploadedVideo.url);
    setUploadedVideo(null);
    setIsGenerating(true);
    onGenerationStarted?.();

    try {
      // Prepare generation data with proper defaults
      let model: string;
      let imageToUse: string | undefined;
      let imagesToUse: string[] | undefined;

      // Determine which image to use (uploaded/injected or referenced)
      if (uploadedImages.length > 0) {
        imageToUse = uploadedImages[0];
        imagesToUse = uploadedImages;
      } else if (isReferencingPreviousImage && lastGeneratedImage) {
        imageToUse = lastGeneratedImage;
        imagesToUse = [lastGeneratedImage];
      }

      // MODEL SELECTION: Always respect the user's dropdown choice first
      if (preferredVideoModel && preferredVideoModel !== 'none') {
        model = preferredVideoModel;
      } else {
        if (wantsVideo) {
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant' as const,
            content: `⚠️ Please select a model from the dropdown above before generating.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsGenerating(false);
          onGenerationComplete?.();
          return;
        } else if (imageToUse) {
          model = 'fal-ai/nano-banana/edit';
        } else {
          model = 'fal-ai/flux-pro/v1.1-ultra';
        }
      }

      const generationData = {
        model,
        prompt: userInput.trim(),
        image_url: imageToUse,
        image_urls: imagesToUse,
        aspect_ratio: aspectRatio,
        ...(styleImage && { style_image_url: styleImage }),
        ...(wantsVideo && {
          duration: '5s',
          resolution: resolution
        })
      };

      setCurrentModel(model);
      console.log(`🎯 [Chat] Manual: ${model} | video=${wantsVideo} img=${!!imageToUse}`);

      // Call the generation API directly
      try {
        const result = await onContentGenerated(generationData);
        
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
        
        onGenerationComplete?.();
        
      } catch (error: any) {
        // Content policy fallback: Nano Banana → Seedream v4 (backend handles image_size conversion)
        if (error.message?.includes('content policy') &&
            generationData.model === 'fal-ai/nano-banana/edit' && imageToUse) {
          try {
            const result = await onContentGenerated({ ...generationData, model: 'fal-ai/bytedance/seedream/v4/edit' });
            const successMessage = {
              id: (Date.now() + 0.5).toString(),
              type: 'assistant' as const,
              content: `✅ Image generated successfully (using fallback model)! Check the center panel and gallery.`,
              timestamp: new Date()
            };
            setMessages(prev => prev.slice(0, -1).concat([successMessage]));
            setForceVideoGeneration(false);
            if (result?.data?.images?.[0]) {
              setLastGeneratedImage(result.data.images[0].url);
              showFloatingSuggestions([
                "Animate this character walking",
                "Make video of this character dancing",
                "Bring this character to life"
              ]);
            }
            onGenerationComplete?.();
            return;
          } catch (fallbackError) {
            throw fallbackError;
          }
        } else {
          throw error;
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

  // Handle Enter key press to submit — routes to agent or manual based on toggle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (userInput.trim() || uploadedImages.length > 0 || uploadedVideo)) {
        if (useDirectorAI) {
          handleAgentSubmit(e as any);
        } else {
          handleSubmit(e as any);
        }
      }
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    // Auto-submit the suggestion — route to correct handler
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      if (useDirectorAI) {
        handleAgentSubmit(fakeEvent);
      } else {
        handleSubmit(fakeEvent);
      }
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
        
        // Use user's selected model for variations, fallback to nano-banana/edit
        const variationModel = (preferredVideoModel && preferredVideoModel !== 'none')
          ? preferredVideoModel
          : 'fal-ai/nano-banana/edit';
        const generationData = {
          model: variationModel,
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
            
            // Convert aspect_ratio to image_size for Seedream 4.0 Edit
            if (generationData.aspect_ratio) {
              const aspectRatioToDimensions = (ratio: string) => {
                switch (ratio) {
                  case '16:9':
                    return { width: 1920, height: 1080 };
                  case '9:16':
                    return { width: 1080, height: 1920 };
                  case '4:3':
                    return { width: 1024, height: 768 };
                  case '3:4':
                    return { width: 768, height: 1024 };
                  default:
                    return { width: 1920, height: 1080 }; // Default to 16:9
                }
              };
              
              (fallbackGenerationData as any).image_size = aspectRatioToDimensions(generationData.aspect_ratio);
              // Remove aspect_ratio since Seedream uses image_size
              delete (fallbackGenerationData as any).aspect_ratio;
              
              console.log('🔄 [Chat] Converted aspect_ratio to image_size for Seedream fallback:', (fallbackGenerationData as any).image_size);
            }
            
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-medium tracking-tighter uppercase text-foreground">DirectorChair AI</h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => { clearChatHistory(); setAgentHistory([]); setWaitingForImage(null); setActivePersona(null); setUploadedImages([]); }}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 border border-border hover:border-border transition-colors tracking-wider uppercase"
                title="Clear chat history"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {/* Active Persona Banner */}
        {activePersona && (
          <div className="mb-3 px-3 py-2 border border-purple-500/40 bg-purple-500/10 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">🎭 {activePersona.personaName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{uploadedImages.length} reference image(s) loaded</p>
            </div>
            <button
              onClick={() => { setActivePersona(null); setUploadedImages([]); setAgentHistory([]); }}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 border border-border hover:border-ring transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
        )}
        {/* Director AI Toggle */}
        <button
          onClick={() => setUseDirectorAI(!useDirectorAI)}
          className={`w-full mb-3 px-3 py-1.5 text-xs tracking-wider uppercase border transition-all duration-200 ${
            useDirectorAI
              ? 'bg-primary text-primary-foreground border-white font-medium'
              : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-border'
          }`}
        >
          {useDirectorAI ? '⚡ Director AI — Active' : '○ Director AI — Off (Manual)'}
        </button>
        {/* Model Dropdown — full width, hidden in agent mode */}
        <div className={`flex items-center gap-2 ${useDirectorAI ? 'opacity-40 pointer-events-none' : ''}`}>
          <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={preferredVideoModel} onValueChange={setPreferredVideoModel}>
            <SelectTrigger className="w-full h-8 text-xs border-border bg-card text-foreground">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="OpenAI" />OpenAI</SelectLabel>
                    <SelectItem value="fal-ai/sora-2/image-to-video">Sora 2 (I2V)</SelectItem>
                    <SelectItem value="fal-ai/sora-2/image-to-video/pro">Sora 2 Pro (I2V)</SelectItem>
                    <SelectItem value="fal-ai/sora-2/video-to-video/remix">Sora 2 Remix (V2V)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Google" />Google</SelectLabel>
                    <SelectItem value="fal-ai/veo3.1/fast/image-to-video">Veo 3.1 Fast (I2V)</SelectItem>
                    <SelectItem value="fal-ai/veo3.1/fast/first-last-frame-to-video">Veo 3.1 First/Last Frame (I2V)</SelectItem>
                    <SelectItem value="fal-ai/imagen4/preview">Imagen 4 (T2I)</SelectItem>
                    <SelectItem value="fal-ai/nano-banana-pro/edit">Nano Banana Pro (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/nano-banana/edit">Nano Banana (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/gemini-25-flash-image/edit">Gemini 2.5 Flash (I2I Edit)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="xAI (Grok)" />xAI (Grok)</SelectLabel>
                    <SelectItem value="xai/grok-imagine-video/text-to-video">Grok Video (T2V)</SelectItem>
                    <SelectItem value="xai/grok-imagine-video/image-to-video">Grok Video (I2V)</SelectItem>
                    <SelectItem value="xai/grok-imagine-image/edit">Grok Image (I2I Edit)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Kling" />Kling</SelectLabel>
                    <SelectItem value="fal-ai/kling-video/v3/pro/image-to-video">Kling v3 Pro (I2V)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/v2.6/pro/image-to-video">Kling v2.6 Pro (I2V)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/o3/standard/image-to-video">Kling O3 (I2V)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/v2.5-turbo/pro/image-to-video">Kling v2.5 Turbo (I2V)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/v2.1/master/image-to-video">Kling v2.1 Master (I2V)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/o1/video-to-video/edit">Kling O1 (V2V Edit)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/o3/standard/video-to-video/edit">Kling O3 Std (V2V Edit)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/o3/pro/video-to-video/edit">Kling O3 Pro (V2V Edit)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/v2.6/standard/motion-control">Kling v2.6 (Motion Ctrl)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/v2.6/pro/motion-control">Kling v2.6 Pro (Motion Ctrl)</SelectItem>
                    <SelectItem value="fal-ai/kling-video/v1/pro/ai-avatar">Kling Avatar (Lip-sync)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="ByteDance" />ByteDance</SelectLabel>
                    <SelectItem value="fal-ai/bytedance/seedream/v5/lite/text-to-image">Seedream 5.0 Lite (T2I)</SelectItem>
                    <SelectItem value="fal-ai/bytedance/dreamina/v3.1/text-to-image">Dreamina v3.1 (T2I)</SelectItem>
                    <SelectItem value="fal-ai/bytedance/seedream/v5/lite/edit">Seedream 5.0 Lite (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/bytedance/seedream/v4.5/edit">Seedream 4.5 (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/bytedance/seedream/v4/edit">Seedream 4.0 (I2I Edit)</SelectItem>
                    <SelectItem value="bytedance/seedance-2.0/fast/text-to-video">Seedance 2.0 Fast (T2V)</SelectItem>
                    <SelectItem value="bytedance/seedance-2.0/fast/image-to-video">Seedance 2.0 Fast (I2V)</SelectItem>
                    <SelectItem value="bytedance/seedance-2.0/fast/reference-to-video">Seedance 2.0 Fast (Ref2V)</SelectItem>
                    <SelectItem value="fal-ai/bytedance/seedance/v1.5/pro/image-to-video">Seedance 1.5 Pro (I2V)</SelectItem>
                    <SelectItem value="fal-ai/bytedance/dreamactor/v2">DreamActor v2 (Motion Ctrl)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Black Forest Labs" />Black Forest Labs</SelectLabel>
                    <SelectItem value="fal-ai/flux-pro/v1.1-ultra">Flux Pro 1.1 Ultra (T2I)</SelectItem>
                    <SelectItem value="fal-ai/flux-2-flex">FLUX 2 Flex (T2I)</SelectItem>
                    <SelectItem value="fal-ai/flux-2-flex/edit">FLUX 2 Flex (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/flux-pro/kontext/max">Flux Kontext Max (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/flux-krea-lora/image-to-image">FLUX LoRA (I2I)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Minimax" />Minimax</SelectLabel>
                    <SelectItem value="fal-ai/minimax/hailuo-2.3/standard/image-to-video">Hailuo 2.3 (I2V)</SelectItem>
                    <SelectItem value="fal-ai/minimax/hailuo-02/standard/image-to-video">Hailuo 02 (I2V)</SelectItem>
                    <SelectItem value="endframe/minimax-hailuo-02">EndFrame Hailuo (I2V)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Wan AI</SelectLabel>
                    <SelectItem value="fal-ai/wan/v2.7/pro/text-to-image">Wan 2.7 Pro (T2I)</SelectItem>
                    <SelectItem value="fal-ai/wan/v2.7/pro/edit">Wan 2.7 Pro (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/wan/v2.7/edit">Wan 2.7 (I2I Edit)</SelectItem>
                    <SelectItem value="fal-ai/wan-pro/image-to-video">Wan Pro (I2V)</SelectItem>
                    <SelectItem value="fal-ai/wan-25-preview/image-to-video">Wan 2.5 Preview (I2V)</SelectItem>
                    <SelectItem value="fal-ai/wan/v2.2-a14b/image-to-video">Wan v2.2-A14B (I2V)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Pixverse" />Pixverse</SelectLabel>
                    <SelectItem value="fal-ai/pixverse/v6/image-to-video">Pixverse V6 (I2V)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Luma AI" />Luma AI</SelectLabel>
                    <SelectItem value="fal-ai/luma-dream-machine/ray-2/image-to-video">Luma Ray 2 (I2V)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Tencent" />Tencent</SelectLabel>
                    <SelectItem value="fal-ai/hunyuan-video">Hunyuan Video (T2V)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Stability AI" />Stability AI</SelectLabel>
                    <SelectItem value="fal-ai/stable-diffusion-v35-large">SD 3.5 Large (T2I)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Alibaba" />Alibaba</SelectLabel>
                    <SelectItem value="fal-ai/qwen-image-edit">Qwen (I2I Edit)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Ovi</SelectLabel>
                    <SelectItem value="fal-ai/ovi/image-to-video">Ovi (I2V + Audio)</SelectItem>
                  </SelectGroup>
                  <SelectItem value="none">None (Ask me)</SelectItem>
                </SelectContent>
              </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Start a conversation to generate content</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.type === 'user' ? 'bg-secondary text-foreground' : 'bg-card text-foreground'} p-3`}>
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
                        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownload(message.media!.url, message.media!.filename || 'download')}
                              className="bg-card text-card-foreground px-2 py-1 rounded text-xs font-medium hover:bg-muted"
                            >
                              <Download className="w-3 h-3 inline mr-1" />
                              Download
                            </button>
                            <button
                              onClick={() => handleVary(message.media!.url, message.content)}
                              className="bg-card text-card-foreground px-2 py-1 rounded text-xs font-medium hover:bg-muted"
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
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <img 
                  src={getModelIcon(currentModel)} 
                  alt="Model" 
                  className="w-5 h-5 animate-spin"
                />
                <span className="text-sm">Generating...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length === 0 && (
        <div className="p-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2">Suggestions</p>
          <div className="space-y-1">
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
                className="block w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-card p-2 transition-colors truncate"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waiting for Image Banner */}
      {waitingForImage && useDirectorAI && (
        <div className="mx-3 mt-2 p-3 bg-card border border-border text-xs text-foreground">
          <p className="font-medium text-foreground mb-1">📸 Director needs an image</p>
          <p>{waitingForImage}</p>
          <p className="text-muted-foreground mt-1">Drag & drop or click the upload button below.</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        {/* Uploaded Media Preview */}
        {(uploadedImages.length > 0 || uploadedVideo) && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-2">Uploaded</p>
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="w-16 h-16 object-cover border border-border hover:border-ring transition-colors"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-secondary text-foreground w-5 h-5 flex items-center justify-center text-xs hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Style Reference Slot — appears when image is uploaded */}
              {uploadedImages.length > 0 && (
                styleImage ? (
                  <div className="relative group">
                    <div className="relative">
                      <img
                        src={styleImage}
                        alt="Style reference"
                        className="w-16 h-16 object-cover border border-amber-600/60 hover:border-amber-500 transition-colors"
                      />
                      <span className="absolute bottom-0 left-0 right-0 bg-amber-600/80 text-[9px] text-foreground text-center py-0.5 font-medium tracking-wider uppercase">Style</span>
                    </div>
                    <button
                      onClick={() => setStyleImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-amber-700 text-foreground w-5 h-5 flex items-center justify-center text-xs hover:bg-amber-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => styleFileInputRef.current?.click()}
                    className="w-16 h-16 border border-dashed border-border hover:border-amber-600/60 bg-card/50 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-0.5 group"
                    title="Upload a style reference image"
                  >
                    <FileImage className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    <span className="text-[9px] text-muted-foreground group-hover:text-amber-500 font-medium tracking-wider uppercase transition-colors">Style</span>
                  </button>
                )
              )}

              {uploadedVideo && (
                <div className="relative group">
                  <div className="w-28 h-16 bg-card border border-border hover:border-ring transition-colors flex flex-col items-center justify-center overflow-hidden">
                    <video src={uploadedVideo.url} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] text-foreground bg-secondary/80 px-1.5 py-0.5 rounded">🎬 {(uploadedVideo.size / (1024 * 1024)).toFixed(1)}MB</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { if (uploadedVideo.url.startsWith('blob:')) URL.revokeObjectURL(uploadedVideo.url); setUploadedVideo(null); }}
                    className="absolute -top-1.5 -right-1.5 bg-secondary text-foreground w-5 h-5 flex items-center justify-center text-xs hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={useDirectorAI ? handleAgentSubmit : handleSubmit} className="space-y-3">
          {/* Input Row */}
          <div className="flex space-x-2">
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground border border-border hover:border-ring bg-card transition-all duration-200 group"
              title="Upload images or video"
            >
              <FileImage className="w-4 h-4" />
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
                  <div className="absolute inset-0 bg-card/90 flex items-center justify-center z-10 border border-ring">
                    <div className="text-center">
                      <CloudUpload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                      <p className="text-muted-foreground text-xs">Drop images or video here</p>
                    </div>
                  </div>
                )}

                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholderText}
                  className={`min-h-[60px] resize-none border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 pr-10 text-sm transition-all duration-200 ${
                    isDragOver ? 'border-ring' : ''
                  }`}
                  disabled={isGenerating}
                />

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={isGenerating || (!userInput.trim() && uploadedImages.length === 0)}
                  size="sm"
                  className="absolute bottom-2 right-2 bg-primary hover:bg-primary/80 text-primary-foreground h-7 w-7 p-0"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground"></div>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{useDirectorAI ? 'AI picks the best model' : 'Auto-optimized prompts'}</span>
            <span>JPG, PNG, WebP</span>
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

                  <div className="space-y-2">
                    <Label htmlFor="creative-direction">Creative Direction</Label>
                    <Select value={creativeDirection} onValueChange={setCreativeDirection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinematic">🎬 Cinematic — Film-grade, dramatic lighting, anamorphic</SelectItem>
                        <SelectItem value="realistic">📷 Realistic — Natural lighting, true-to-life</SelectItem>
                        <SelectItem value="surreal">🌀 Surreal — Dreamlike, otherworldly, ethereal</SelectItem>
                        <SelectItem value="noir">🖤 Noir — High contrast, deep shadows, moody</SelectItem>
                        <SelectItem value="anime">✨ Anime / Stylized — Cel-shaded, vibrant</SelectItem>
                        <SelectItem value="music-video">🎵 Music Video — Flashy, dynamic, color-graded</SelectItem>
                        <SelectItem value="fashion">👗 Fashion / Editorial — Studio lighting, editorial</SelectItem>
                        <SelectItem value="horror">👻 Horror — Dark, unsettling, atmospheric tension</SelectItem>
                        <SelectItem value="scifi">🚀 Sci-Fi / Futuristic — Neon, cyberpunk, volumetric</SelectItem>
                        <SelectItem value="vintage">📼 Vintage / Retro — Film grain, muted tones, 70s/80s</SelectItem>
                        <SelectItem value="epic">⚔️ Epic / Fantasy — Grand scale, mythical, sweeping</SelectItem>
                        <SelectItem value="commercial">💎 Commercial — Clean, polished, product-focused</SelectItem>
                        <SelectItem value="documentary">🎥 Documentary — Handheld, raw, observational</SelectItem>
                        <SelectItem value="none">○ None — Let AI decide per prompt</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Sets the visual tone for all AI-generated content.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-model">Preferred Model</Label>
                    <Select value={preferredVideoModel} onValueChange={setPreferredVideoModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="OpenAI" />OpenAI</SelectLabel>
                          <SelectItem value="fal-ai/sora-2/image-to-video">Sora 2 (I2V) - OpenAI&apos;s latest</SelectItem>
                          <SelectItem value="fal-ai/sora-2/image-to-video/pro">Sora 2 Pro (I2V) - Premium 1080p</SelectItem>
                          <SelectItem value="fal-ai/sora-2/video-to-video/remix">Sora 2 Remix (V2V) - Style changes</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Google" />Google</SelectLabel>
                          <SelectItem value="fal-ai/veo3.1/fast/image-to-video">Veo 3.1 Fast (I2V) - Latest video</SelectItem>
                          <SelectItem value="fal-ai/veo3.1/fast/first-last-frame-to-video">Veo 3.1 First/Last Frame (I2V)</SelectItem>
                          <SelectItem value="fal-ai/imagen4/preview">Imagen 4 (T2I) - Highest quality</SelectItem>
                          <SelectItem value="fal-ai/nano-banana-pro/edit">Nano Banana Pro (I2I Edit) - 1K-4K</SelectItem>
                          <SelectItem value="fal-ai/nano-banana/edit">Nano Banana (I2I Edit) - Multi-image</SelectItem>
                          <SelectItem value="fal-ai/gemini-25-flash-image/edit">Gemini 2.5 Flash (I2I Edit) - Blending</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="xAI (Grok)" />xAI (Grok)</SelectLabel>
                          <SelectItem value="xai/grok-imagine-video/text-to-video">Grok Video (T2V) - Audio, 1-15s</SelectItem>
                          <SelectItem value="xai/grok-imagine-video/image-to-video">Grok Video (I2V) - Audio, 1-15s</SelectItem>
                          <SelectItem value="xai/grok-imagine-image/edit">Grok Image (I2I Edit) - Realism</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Kling" />Kling</SelectLabel>
                          <SelectItem value="fal-ai/kling-video/v3/pro/image-to-video">Kling v3 Pro (I2V) - Cinematic, audio</SelectItem>
                          <SelectItem value="fal-ai/kling-video/v2.6/pro/image-to-video">Kling v2.6 Pro (I2V) - Dialogue/speech</SelectItem>
                          <SelectItem value="fal-ai/kling-video/o3/standard/image-to-video">Kling O3 (I2V) - Start/end frame</SelectItem>
                          <SelectItem value="fal-ai/kling-video/v2.5-turbo/pro/image-to-video">Kling v2.5 Turbo (I2V) - Fast motion</SelectItem>
                          <SelectItem value="fal-ai/kling-video/v2.1/master/image-to-video">Kling v2.1 Master (I2V)</SelectItem>
                          <SelectItem value="fal-ai/kling-video/o1/video-to-video/edit">Kling O1 (V2V Edit) - Replace subjects</SelectItem>
                          <SelectItem value="fal-ai/kling-video/o3/standard/video-to-video/edit">Kling O3 Std (V2V Edit) - Budget</SelectItem>
                          <SelectItem value="fal-ai/kling-video/o3/pro/video-to-video/edit">Kling O3 Pro (V2V Edit) - @refs</SelectItem>
                          <SelectItem value="fal-ai/kling-video/v2.6/standard/motion-control">Kling v2.6 (Motion Ctrl) - Video→Image</SelectItem>
                          <SelectItem value="fal-ai/kling-video/v2.6/pro/motion-control">Kling v2.6 Pro (Motion Ctrl) - HQ</SelectItem>
                          <SelectItem value="fal-ai/kling-video/v1/pro/ai-avatar">Kling Avatar (Lip-sync)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="ByteDance" />ByteDance</SelectLabel>
                          <SelectItem value="fal-ai/bytedance/seedream/v5/lite/text-to-image">Seedream 5.0 Lite (T2I) - 2K quality</SelectItem>
                          <SelectItem value="fal-ai/bytedance/dreamina/v3.1/text-to-image">Dreamina v3.1 (T2I) - Aesthetics</SelectItem>
                          <SelectItem value="fal-ai/bytedance/seedream/v5/lite/edit">Seedream 5.0 Lite (I2I Edit) - Multi-image</SelectItem>
                          <SelectItem value="fal-ai/bytedance/seedream/v4.5/edit">Seedream 4.5 (I2I Edit) - 10 images</SelectItem>
                          <SelectItem value="fal-ai/bytedance/seedream/v4/edit">Seedream 4.0 (I2I Edit)</SelectItem>
                          <SelectItem value="bytedance/seedance-2.0/fast/text-to-video">Seedance 2.0 Fast (T2V) - No image needed</SelectItem>
                          <SelectItem value="bytedance/seedance-2.0/fast/image-to-video">Seedance 2.0 Fast (I2V) - Native audio, cinematic</SelectItem>
                          <SelectItem value="bytedance/seedance-2.0/fast/reference-to-video">Seedance 2.0 Fast (Ref2V) - Character consistency</SelectItem>
                          <SelectItem value="fal-ai/bytedance/seedance/v1.5/pro/image-to-video">Seedance 1.5 Pro (I2V) - Audio, end frame</SelectItem>
                          <SelectItem value="fal-ai/bytedance/dreamactor/v2">DreamActor v2 (Motion Ctrl)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Black Forest Labs" />Black Forest Labs</SelectLabel>
                          <SelectItem value="fal-ai/flux-pro/v1.1-ultra">Flux Pro 1.1 Ultra (T2I) - Pro-grade</SelectItem>
                          <SelectItem value="fal-ai/flux-2-flex">FLUX 2 Flex (T2I) - Typography</SelectItem>
                          <SelectItem value="fal-ai/flux-2-flex/edit">FLUX 2 Flex (I2I Edit) - Multi-ref</SelectItem>
                          <SelectItem value="fal-ai/flux-pro/kontext/max">Flux Kontext Max (I2I Edit) - Consistency</SelectItem>
                          <SelectItem value="fal-ai/flux-krea-lora/image-to-image">FLUX LoRA (I2I) - Style transfer</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Minimax" />Minimax</SelectLabel>
                          <SelectItem value="fal-ai/minimax/hailuo-2.3/standard/image-to-video">Hailuo 2.3 (I2V) - Latest, 768p</SelectItem>
                          <SelectItem value="fal-ai/minimax/hailuo-02/standard/image-to-video">Hailuo 02 (I2V)</SelectItem>
                          <SelectItem value="endframe/minimax-hailuo-02">EndFrame Hailuo (I2V) - Smooth</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Wan AI</SelectLabel>
                          <SelectItem value="fal-ai/wan/v2.7/pro/text-to-image">Wan 2.7 Pro (T2I) - Superior detail</SelectItem>
                          <SelectItem value="fal-ai/wan/v2.7/pro/edit">Wan 2.7 Pro (I2I Edit) - Professional</SelectItem>
                          <SelectItem value="fal-ai/wan/v2.7/edit">Wan 2.7 (I2I Edit) - Text-guided</SelectItem>
                          <SelectItem value="fal-ai/wan-pro/image-to-video">Wan Pro (I2V) - 1080p 30fps</SelectItem>
                          <SelectItem value="fal-ai/wan-25-preview/image-to-video">Wan 2.5 Preview (I2V)</SelectItem>
                          <SelectItem value="fal-ai/wan/v2.2-a14b/image-to-video">Wan v2.2-A14B (I2V)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Pixverse" />Pixverse</SelectLabel>
                          <SelectItem value="fal-ai/pixverse/v6/image-to-video">Pixverse V6 (I2V) - Style presets, 1-15s</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Luma AI" />Luma AI</SelectLabel>
                          <SelectItem value="fal-ai/luma-dream-machine/ray-2/image-to-video">Luma Ray 2 (I2V) - Realistic motion</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Tencent" />Tencent</SelectLabel>
                          <SelectItem value="fal-ai/hunyuan-video">Hunyuan Video (T2V)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Stability AI" />Stability AI</SelectLabel>
                          <SelectItem value="fal-ai/stable-diffusion-v35-large">SD 3.5 Large (T2I)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2"><CompanyIcon name="Alibaba" />Alibaba</SelectLabel>
                          <SelectItem value="fal-ai/qwen-image-edit">Qwen (I2I Edit) - Text editing</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Ovi</SelectLabel>
                          <SelectItem value="fal-ai/ovi/image-to-video">Ovi (I2V + Audio)</SelectItem>
                        </SelectGroup>
                        <SelectItem value="none">None (Ask me each time)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Default video model for image-to-video generation. Set to "None" to be prompted each time.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </form>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={styleFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleStyleImageUpload}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground mt-2">
          Chat Mode can make mistakes. Double check responses.
        </p>
      </div>

      {/* Floating Suggestions Dialog */}
      {showFloatingDialog && floatingSuggestions.length > 0 && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showFloatingDialog ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4 max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-card-foreground">💡 Quick Actions</h3>
              <button
                onClick={() => setShowFloatingDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {floatingSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleFloatingSuggestionClick(suggestion)}
                  className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-blue-200 hover:border-blue-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Click any suggestion to animate your image with video
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
