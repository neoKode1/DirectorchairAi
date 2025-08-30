"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { button as Button } from "@/components/ui/button";
import { AVAILABLE_ENDPOINTS } from "@/lib/fal";
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music as MusicIcon, 
  Mic as MicIcon,
  Sparkles,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function ModelsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Group models by category
  const groupedModels = AVAILABLE_ENDPOINTS.reduce(
    (acc, model) => {
      if (!acc[model.category]) {
        acc[model.category] = [];
      }
      acc[model.category].push(model);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_ENDPOINTS>,
  );

  // Category display order and labels
  const categoryOrder = ["image", "video", "music", "voiceover"] as const;
  const categoryLabels: Record<(typeof categoryOrder)[number], string> = {
    image: "Image Models",
    video: "Video Models", 
    music: "Music Models",
    voiceover: "Voice Models",
  };

  // Category icons
  const categoryIcons = {
    image: ImageIcon,
    video: VideoIcon,
    music: MusicIcon,
    voiceover: MicIcon,
  };

  // Model-specific icon mapping to actual files in public folder
  const getModelIcon = (modelId: string) => {
    // Image models
    if (modelId.includes('imagen')) return '/gemini-color.png'; // Google Imagen
    if (modelId.includes('stable-diffusion')) return '/gemini-color.png'; // Stable Diffusion
    if (modelId.includes('dreamina')) return '/bytedance-color.webp'; // Dreamina
    if (modelId.includes('flux')) return '/flux.png'; // Flux models
    if (modelId.includes('nano-banana')) return '/flux.png'; // Nano Banana (Advanced Controls)
    if (modelId.includes('gemini')) return '/gemini-color.png'; // Gemini 2.5 Flash (Multi-Image)
    if (modelId.includes('ideogram')) return '/ideogram.png'; // Ideogram
    
    // Video models
    if (modelId.includes('veo')) return '/gemini-color.png'; // Google Veo
    if (modelId.includes('kling')) return '/kling-color.png'; // Kling
    if (modelId.includes('luma')) return '/dreammachine.png'; // Luma
    if (modelId.includes('minimax')) return '/minimax-color.png'; // Minimax
    if (modelId.includes('seedance')) return '/bytedance-color.webp'; // Seedance
    
    // Voice models
    if (modelId.includes('elevenlabs')) return '/elevenlabs.png'; // ElevenLabs
    
    return '/gemini-color.png'; // default fallback
  };

  // Category colors for subtle accents
  const categoryColors = {
    image: "hover:bg-blue-500/20 border-blue-500/30",
    video: "hover:bg-red-500/20 border-red-500/30", 
    music: "hover:bg-green-500/20 border-green-500/30",
    voiceover: "hover:bg-pink-500/20 border-pink-500/30",
  };

  // Function to set model as preferred and redirect to chat
  const handleUseInChat = (model: typeof AVAILABLE_ENDPOINTS[0]) => {
    try {
      // Load current preferences
      const saved = localStorage.getItem('narrative-model-preferences');
      let preferences = saved ? JSON.parse(saved) : {
        image: null,
        video: null,
        music: null,
        voiceover: null,
      };

      // Set the current model as preferred for its category
      const categoryMap: Record<string, keyof typeof preferences> = {
        'image': 'image',
        'video': 'video',
        'music': 'music',
        'voiceover': 'voiceover',
      };

      const preferenceKey = categoryMap[model.category];
      if (preferenceKey) {
        preferences[preferenceKey] = model.endpointId;
        localStorage.setItem('narrative-model-preferences', JSON.stringify(preferences));
        
        // Dispatch event to notify chat interface
        window.dispatchEvent(new CustomEvent('model-preferences-changed', {
          detail: preferences
        }));

        toast({
          title: "Model Set as Preferred",
          description: `${model.label} is now your preferred ${model.category} model.`,
        });

        // Redirect to chat interface
        router.push('/');
      }
    } catch (error) {
      console.error('Error setting model preference:', error);
      toast({
        title: "Error",
        description: "Failed to set model preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/Gen4.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        filter: 'brightness(0.8) contrast(1.2)', // Improve background clarity
      }}
    >
      {/* Reduced overlay for better background visibility */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      
      {/* Content */}
      <div className="relative z-10 mobile-container-sm mobile-py space-y-8 sm:space-y-12 min-h-screen">
        <div className="space-y-2 text-center">
          <h1 className="mobile-text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
            DirectorchairAI Models
          </h1>
          <p className="mobile-text-sm sm:text-base text-white/90 drop-shadow-md">
            Click any model card to access its interface, or use "Use in Chat" to set as preferred
          </p>
        </div>

        {categoryOrder.map((category) => {
          if (!groupedModels[category]) return null;
          
          const CategoryIcon = categoryIcons[category];
          
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <CategoryIcon className="w-6 h-6 text-white/80" />
                <h2 className="mobile-text-lg sm:text-xl font-semibold text-white drop-shadow-lg">
                  {categoryLabels[category]}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {groupedModels[category].map((model) => {
                  const iconSrc = getModelIcon(model.endpointId);
                  
                  return (
                    <Card 
                      key={model.endpointId} 
                      className={`relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-white/10 ${categoryColors[category]} cursor-pointer`}
                      style={{
                        backgroundImage: `url('${iconSrc}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '140px'
                      }}
                      onClick={() => router.push(`/models/${model.category}/${encodeURIComponent(model.endpointId)}`)}
                    >
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                      
                      <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                        {/* Model Name */}
                        <div className="flex-1 flex items-start">
                          <h3 className="mobile-text-xs sm:text-sm font-semibold text-white group-hover:text-white/90 transition-colors leading-tight line-clamp-2">
                            {model.label}
                          </h3>
                        </div>
                        
                        {/* Use in Chat Button */}
                        <div className="flex-shrink-0 mt-2">
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUseInChat(model);
                            }}
                            size="sm"
                            variant="outline"
                            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 text-xs"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            <span>Use in Chat</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
