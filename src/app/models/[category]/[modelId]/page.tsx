"use client";

import { useState } from "react";
import { VideoModelInterface } from "@/components/model-inputs/video-model-interface";
import { AudioModelInterface } from "@/components/model-inputs/audio-model-interface";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { button as Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
// Placeholder type for Luma response
type LumaResponse = any;

import { PhotonModelInterface } from "@/components/model-inputs/photon-model-interface";
import { LumaDreamMachineInterface } from "@/components/model-inputs/luma-dream-machine-interface";
import { PhotonInstantModelInterface } from "@/components/model-inputs/photon-instant-model-interface";
import { RecraftModelInterface } from "@/components/model-inputs/recraft-model-interface";

import { StableDiffusion35LargeModelInterface } from "@/components/model-inputs/stable-diffusion-3.5-large-model-interface";
import { StableDiffusionInterface } from "@/components/model-inputs/stable-diffusion-interface";
import FluxProInterface from "@/components/model-inputs/flux-pro-interface";
import { Veo3Interface } from "@/components/model-inputs/veo3-interface";
import { LumaRay2FlashInterface } from "@/components/model-inputs/luma-ray2-flash-interface";
import { KlingV21MasterInterface } from "@/components/model-inputs/kling-v21-master-interface";
import { MinimaxHailuo02Interface } from "@/components/model-inputs/minimax-hailuo02-interface";
import { ElevenLabsTTSInterface } from "@/components/model-inputs/elevenlabs-tts-interface";
import { MiniMaxTTSInterface } from "@/components/model-inputs/minimax-tts-interface";
import { MiniMaxVoiceCloneInterface } from "@/components/model-inputs/minimax-voice-clone-interface";
import { SyncLipSyncInterface } from "@/components/model-inputs/sync-lipsync-interface";
import { MessageSquare } from "lucide-react";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

type GenerationResult = {
  id: string;
  generation_type: string;
  state: string;
  created_at: string;
  images?: Array<{
    url: string;
    content_type: string;
  }>;
  assets?: {
    video?: string;
    image?: string;
  };
  audio?: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt: string;
  model: string;
};

interface PageProps {
  params: Promise<{
    category: string;
    modelId: string;
  }>;
}

export default async function ModelPage({ params }: PageProps) {
  const { category, modelId } = await params;
  const { toast } = useToast();
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Decode the URL parameter and clean it up
  const decodedModelId = decodeURIComponent(modelId).replace("%2F", "/");

  // Get the model name from the ID
  const getModelName = (id: string) => {
    const decodedId = decodeURIComponent(id).replace("%2F", "/");

    // Special cases for model names
    if (decodedId === "Photon") {
      return "DirectorchairAI • Photon";
    }
    if (decodedId === "Photon-Instant") {
      return "DirectorchairAI • Photon Instant";
    }

    // For Luma models, keep the full name
    if (decodedId === "luma-dream-machine/ray-2") {
      return "DirectorchairAI • Luma Ray 2";
    }
    if (decodedId === "fal-ai/luma-dream-machine/ray-2-flash/image-to-video") {
      return "DirectorchairAI • Luma Ray 2 Flash (Image to Video)";
    }

    // For fal.ai models, clean up the prefix
    const parts =
      decodedId.replace("fal-ai/", "").split("/").pop()?.split("-") || [];

    // Video model mappings
    if (
      decodedId.includes("minimax-video") ||
      decodedId.includes("minimax/video") ||
      decodedId.includes("minimax/hailuo")
    ) {
      if (decodedId.includes("hailuo-02")) {
        return "DirectorchairAI • Minimax Hailuo 02 Standard (Image to Video)";
      }
      if (decodedId.includes("image-to-video")) {
        return "DirectorchairAI • Minimax/Hailuo Video 01 (Image to Video)";
      }
      if (decodedId.includes("live")) {
        return "DirectorchairAI • Minimax/Hailuo Video 01 Live";
      }
      if (decodedId.includes("subject-reference")) {
        return "DirectorchairAI • Minimax/Hailuo Video 01 (Subject Reference)";
      }
      return "DirectorchairAI • Minimax/Hailuo Video 01";
    }

    if (decodedId === "fal-ai/hunyuan-video") {
      return "DirectorchairAI • Hunyuan Video";
    }
    if (decodedId === "fal-ai/hunyuan-video-lora-training") {
      return "DirectorchairAI • Hunyuan Video LoRA Training";
    }

    if (parts.join("-").includes("flux-pro")) {
      return "DirectorchairAI • Flux Pro 1.1 Ultra";
    }
    
    if (parts.join("-").includes("stable-diffusion")) {
      return "DirectorchairAI • Stable Diffusion 3.5 Large";
    }
    if (parts.join("-").includes("hunyuan")) {
      return "DirectorchairAI • Hunyuan";
    }
    if (parts.join("-").includes("kling")) {
      if (decodedId.includes("v2.1/master")) {
        return "DirectorchairAI • Kling v2.1 Master (Image to Video)";
      }
      return "DirectorchairAI • Kling 1.5";
    }
    if (decodedId === "fal-ai/mmaudio-v2/video-to-video") {
      return "DirectorchairAI • MMAudio V2 (Video to Video)";
    }
    if (decodedId === "fal-ai/mmaudio-v2/text-to-video") {
      return "DirectorchairAI • MMAudio V2 (Text to Video)";
    }
    if (parts.join("-").includes("lipsync")) {
      return "DirectorchairAI • Lipsync 1.8.0";
    }
    if (parts.join("-").includes("minimax-music")) {
      return "DirectorchairAI • Minimax/Hailuo Music";
    }
    if (parts.join("-").includes("stable-audio")) {
      return "DirectorchairAI • Stable Audio";
    }
    if (decodedId === "fal-ai/pixverse/v3.5/text-to-video/fast") {
      return "DirectorchairAI • Pixverse V3.5";
    }
    if (decodedId === "fal-ai/recraft-20b") {
      return "DirectorchairAI • Recraft 20B";
    }
    if (decodedId === "fal-ai/elevenlabs/tts/multilingual-v2") {
      return "DirectorchairAI • ElevenLabs TTS";
    }

    // Default formatting for unknown models
    return (
      "DirectorchairAI • " +
      parts
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  // This would normally come from your API or database
  const modelInfo: ApiInfo = {
    id: decodedModelId,
    name: getModelName(modelId),
    description: `${category.charAt(0).toUpperCase() + category.slice(1)} generation model`,
    category,
  };

  const handleResult = async (response: any) => {
    // Convert response to GenerationResult format
    const result: GenerationResult = {
      id: response.id,
      generation_type: response.generation_type || "image",
      state: response.state || "completed",
      created_at: response.created_at || new Date().toISOString(),
      images: Array.isArray(response.images)
        ? response.images.map((image: any) => ({
            url: typeof image === "string" ? image : image.url,
            content_type: "image/jpeg",
          }))
        : undefined,
      prompt: response.request?.prompt || response.prompt || "",
      model: response.model || modelInfo.id,
      seed: response.request?.seed || response.seed,
      has_nsfw_concepts: response.has_nsfw_concepts || [],
      assets: {
        video: response.video || response.assets?.video,
        image: response.image || response.assets?.image,
      },
      audio: response.audio || undefined,
    };
    console.log("Processed result:", result);
    setResult(result);
    toast({
      title: "Generation Complete",
      description: "Your content has been generated successfully.",
    });
    return { images: result.images || [] };
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to set model as preferred and redirect to chat
  const handleUseInChat = () => {
    try {
      // Load current preferences
      const saved = localStorage.getItem('directorchair-model-preferences');
      let preferences = saved ? JSON.parse(saved) : {
        image: null,
        video: null,
        music: null,
        voiceover: null,
        lipsync: null,
      };

      // Set the current model as preferred for its category
      const categoryMap: Record<string, keyof typeof preferences> = {
        'image': 'image',
        'video': 'video',
        'music': 'music',
        'voiceover': 'voiceover',
        'lipsync': 'lipsync',
      };

      const preferenceKey = categoryMap[category];
      if (preferenceKey) {
        preferences[preferenceKey] = decodedModelId;
        localStorage.setItem('directorchair-model-preferences', JSON.stringify(preferences));
        
        // Dispatch event to notify chat interface
        window.dispatchEvent(new CustomEvent('model-preferences-changed', {
          detail: preferences
        }));

        toast({
          title: "Model Set as Preferred",
          description: `${decodedModelId} is now your preferred ${category} model.`,
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

  // Helper function to determine which interface to show
  const renderModelInterface = () => {
    // Handle Luma Labs models
    if (modelInfo.id === "photon-1" || modelInfo.id === "photon-flash-1") {
      return (
        <PhotonModelInterface modelInfo={modelInfo} onSubmit={handleResult} />
      );
    }
    if (modelInfo.id === "ray2" || modelInfo.id === "ray1.6") {
      return (
        <LumaDreamMachineInterface
          modelInfo={modelInfo}
          onSubmit={handleResult}
        />
      );
    }

    // Handle FAL models by category
    switch (category) {
      case "image":
        if (modelInfo.id === "Photon-Instant") {
          return (
            <PhotonInstantModelInterface
              modelInfo={modelInfo}
              onSubmit={handleResult}
            />
          );
        }
        if (modelInfo.id === "fal-ai/recraft-20b") {
          return (
            <RecraftModelInterface
              modelInfo={modelInfo}
              onSubmit={handleResult}
            />
          );
        }
        if (modelInfo.id === "fal-ai/flux-pro/v1.1-ultra") {
          return (
            <FluxProInterface
              onGenerate={handleResult}
            />
          );
        }

        if (modelInfo.id.includes("stable-diffusion-3.5")) {
          return (
            <StableDiffusion35LargeModelInterface
              modelInfo={modelInfo}
              onSubmit={handleResult}
            />
          );
        }
        if (modelInfo.id.includes("stable-diffusion")) {
          return (
            <StableDiffusionInterface
              modelInfo={modelInfo}
              onSubmit={handleResult}
            />
          );
        }
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Interface not available for this model
            </p>
          </div>
        );
      case "video":
        if (modelInfo.id === "fal-ai/veo3/fast") {
          return (
            <Veo3Interface
              onGenerate={handleResult}
            />
          );
        }
        if (modelInfo.id === "fal-ai/luma-dream-machine/ray-2-flash/image-to-video") {
          return (
            <LumaRay2FlashInterface
              onGenerate={handleResult}
            />
          );
        }
        if (modelInfo.id === "fal-ai/kling-video/v2.1/master/image-to-video") {
          return (
            <KlingV21MasterInterface
              onGenerate={handleResult}
            />
          );
        }
        if (modelInfo.id === "fal-ai/minimax/hailuo-02/standard/image-to-video") {
          return (
            <MinimaxHailuo02Interface
              onGenerate={handleResult}
            />
          );
        }
        return (
          <VideoModelInterface modelInfo={modelInfo} onSubmit={handleResult} />
        );
      case "audio":

        return (
          <AudioModelInterface modelInfo={modelInfo} onSubmit={handleResult} />
        );
      case "music":
        return (
          <AudioModelInterface modelInfo={modelInfo} onSubmit={handleResult} />
        );
      case "voiceover":
        if (modelInfo.id === "fal-ai/elevenlabs/tts/multilingual-v2") {
          return (
            <ElevenLabsTTSInterface
              onGenerate={handleResult}
            />
          );
        }
          if (modelInfo.id === "fal-ai/minimax/preview/speech-2.5-hd") {
    return (
      <MiniMaxTTSInterface
        onGenerate={handleResult}
      />
    );
  }
  if (modelInfo.id === "fal-ai/minimax/voice-clone") {
    return (
      <MiniMaxVoiceCloneInterface
        onGenerate={handleResult}
      />
    );
  }
        if (modelInfo.id === "fal-ai/playai/tts/dialog") {
          return (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>PlayAI Text-to-Speech Dialog</CardTitle>
                  <CardDescription>
                    Generate natural-sounding multi-speaker dialogues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This model is designed for generating multi-speaker dialogues with different voices.
                    Use the chat interface to generate dialogues.
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        }
        return (
          <AudioModelInterface modelInfo={modelInfo} onSubmit={handleResult} />
        );
      case "lipsync":
        if (modelInfo.id === "fal-ai/sync-lipsync") {
          return (
            <SyncLipSyncInterface
              onGenerate={handleResult}
            />
          );
        }
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Lip sync interface not available for this model.</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Interface not available for this model
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{modelInfo.name}</h1>
              <p className="text-muted-foreground">{modelInfo.description}</p>
            </div>
            <Button 
              onClick={handleUseInChat}
              className="flex items-center gap-2"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4" />
              Use in Chat
            </Button>
          </div>
          {renderModelInterface()}
        </div>
        <div className="space-y-4">
          {result && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generated Content</h2>
              {result.images?.map((image, index) => (
                <div key={index} className="relative">
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleDownload(image.url)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {result.assets?.video && (
                <div className="relative aspect-video">
                  <video
                    src={result.assets.video}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}
              {result.audio && (
                <div className="space-y-2">
                  <audio src={result.audio.url} controls className="w-full" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(result.audio!.url)}
                  >
                    Download Audio
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
