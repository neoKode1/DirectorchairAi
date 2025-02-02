"use client";

import { useState } from "react";
import { VideoModelInterface } from "@/components/model-inputs/video-model-interface";
import { AudioModelInterface } from "@/components/model-inputs/audio-model-interface";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import type { LumaResponse } from "@/lib/luma";
import { HunyuanVideoInterface } from "@/components/model-inputs/hunyuan-video-interface";
import { PixverseVideoInterface } from "@/components/model-inputs/pixverse-video-interface";
import { MMAudioV2Interface } from "@/components/model-inputs/mmaudio-v2-interface";
import { HunyuanLoraTrainingInterface } from "@/components/model-inputs/hunyuan-lora-training-interface";
import { MinimaxI2VInterface } from "@/components/model-inputs/minimax-i2v-interface";
import { MinimaxSubjectRefInterface } from "@/components/model-inputs/minimax-subject-ref-interface";
import { PhotonModelInterface } from "@/components/model-inputs/photon-model-interface";
import { LumaDreamMachineInterface } from "@/components/model-inputs/luma-dream-machine-interface";
import { PhotonInstantModelInterface } from "@/components/model-inputs/photon-instant-model-interface";
import { RecraftModelInterface } from "@/components/model-inputs/recraft-model-interface";
import { FluxDevModelInterface } from "@/components/model-inputs/flux-dev-model-interface";
import { StableDiffusion35LargeModelInterface } from "@/components/model-inputs/stable-diffusion-3.5-large-model-interface";
import { StableDiffusionInterface } from "@/components/model-inputs/stable-diffusion-interface";
import { FluxProUltraModelInterface } from "@/components/model-inputs/flux-pro-ultra-model-interface";
import { FluxSchnellModelInterface } from "@/components/model-inputs/flux-schnell-model-interface";

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

export default function ModelPage({
  params,
}: {
  params: { category: string; modelId: string };
}) {
  const { toast } = useToast();
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Decode the URL parameter and clean it up
  const decodedModelId = decodeURIComponent(params.modelId).replace('%2F', '/');
  
  // Get the model name from the ID
  const getModelName = (id: string) => {
    const decodedId = decodeURIComponent(id).replace('%2F', '/');
    
    // Special cases for model names
    if (decodedId === "Photon") {
      return "Nano • Photon";
    }
    if (decodedId === "Photon-Instant") {
      return "Nano • Photon Instant";
    }
    
    // For Luma models, keep the full name
    if (decodedId === "luma-dream-machine") {
      return 'Nano • Dream Machine 1.6';
    }
    
    // For fal.ai models, clean up the prefix
    const parts = decodedId.replace('fal-ai/', '').split('/').pop()?.split('-') || [];
    
    // Video model mappings
    if (decodedId.includes('minimax-video') || decodedId.includes('minimax/video')) {
      if (decodedId.includes('image-to-video')) {
        return 'Nano • Minimax/Hailuo Video 01 (Image to Video)';
      }
      if (decodedId.includes('live')) {
        return 'Nano • Minimax/Hailuo Video 01 Live';
      }
      if (decodedId.includes('subject-reference')) {
        return 'Nano • Minimax/Hailuo Video 01 (Subject Reference)';
      }
      return 'Nano • Minimax/Hailuo Video 01';
    }
    
    if (decodedId === 'fal-ai/hunyuan-video') {
      return 'Nano • Hunyuan Video';
    }
    if (decodedId === 'fal-ai/hunyuan-video-lora-training') {
      return 'Nano • Hunyuan Video LoRA Training';
    }
    
    if (parts.join('-').includes('flux-pro')) {
      return 'Nano • Flux Pro 1.1 Ultra';
    }
    if (parts.join('-').includes('flux-schnell')) {
      return 'Nano • Flux Schnell';
    }
    if (parts.join('-').includes('flux-dev')) {
      return 'Nano • Flux Dev';
    }
    if (parts.join('-').includes('stable-diffusion')) {
      return 'Nano • Stable Diffusion 3.5 Large';
    }
    if (parts.join('-').includes('hunyuan')) {
      return 'Nano • Hunyuan';
    }
    if (parts.join('-').includes('kling')) {
      return 'Nano • Kling 1.5';
    }
    if (decodedId === 'fal-ai/mmaudio-v2/video-to-video') {
      return 'Nano • MMAudio V2 (Video to Video)';
    }
    if (decodedId === 'fal-ai/mmaudio-v2/text-to-video') {
      return 'Nano • MMAudio V2 (Text to Video)';
    }
    if (parts.join('-').includes('lipsync')) {
      return 'Nano • Lipsync 1.8.0';
    }
    if (parts.join('-').includes('minimax-music')) {
      return 'Nano • Minimax/Hailuo Music';
    }
    if (parts.join('-').includes('stable-audio')) {
      return 'Nano • Stable Audio';
    }
    if (decodedId === "fal-ai/pixverse/v3.5/text-to-video/fast") {
      return "Nano • Pixverse V3.5";
    }
    if (decodedId === 'fal-ai/recraft-20b') {
      return 'Nano • Recraft 20B';
    }

    // Default formatting for unknown models
    return 'Nano • ' + parts
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // This would normally come from your API or database
  const modelInfo: ApiInfo = {
    id: decodedModelId,
    name: getModelName(params.modelId),
    description: `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} generation model`,
    category: params.category,
  };

  const handleResult = async (response: any) => {
    // Convert response to GenerationResult format
    const result: GenerationResult = {
      id: response.id,
      generation_type: response.generation_type || 'image',
      state: response.state || 'completed',
      created_at: response.created_at || new Date().toISOString(),
      images: Array.isArray(response.images) ? 
        response.images.map((image: any) => ({
          url: typeof image === 'string' ? image : image.url,
          content_type: "image/jpeg"
        })) : undefined,
      prompt: response.request?.prompt || response.prompt || "",
      model: response.model || modelInfo.id,
      seed: response.request?.seed || response.seed,
      has_nsfw_concepts: response.has_nsfw_concepts || [],
      assets: {
        video: response.video || response.assets?.video,
        image: response.image || response.assets?.image
      },
      audio: response.audio || undefined
    };
    console.log('Processed result:', result);
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
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to determine which interface to show
  const renderModelInterface = () => {
    // Handle Luma Labs models
    if (modelInfo.id === "photon-1" || modelInfo.id === "photon-flash-1") {
      return <PhotonModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
    }
    if (modelInfo.id === "ray2" || modelInfo.id === "ray1.6") {
      return <LumaDreamMachineInterface modelInfo={modelInfo} onSubmit={handleResult} />;
    }

    // Handle FAL models by category
    switch (params.category) {
      case "image":
        if (modelInfo.id === "Photon-Instant") {
          return <PhotonInstantModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id === "fal-ai/recraft-20b") {
          return <RecraftModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id.includes("flux-dev")) {
          return <FluxDevModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id.includes("stable-diffusion-3.5")) {
          return <StableDiffusion35LargeModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id.includes("stable-diffusion")) {
          return <StableDiffusionInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        return <div className="text-center py-12">
          <p className="text-muted-foreground">Interface not available for this model</p>
        </div>;
      case "video":
        if (modelInfo.id === "fal-ai/pixverse/v3.5/text-to-video/fast") {
          return <PixverseVideoInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id === "fal-ai/hunyuan-video") {
          return <HunyuanVideoInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id === "fal-ai/hunyuan-video-lora-training") {
          return <HunyuanLoraTrainingInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id === "fal-ai/minimax/video-01-live/image-to-video") {
          return <MinimaxI2VInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        if (modelInfo.id === "fal-ai/minimax/video-01-subject-reference") {
          return <MinimaxSubjectRefInterface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        return <VideoModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
      case "audio":
        if (modelInfo.id === "fal-ai/mmaudio-v2/video-to-video" || modelInfo.id === "fal-ai/mmaudio-v2/text-to-video") {
          return <MMAudioV2Interface modelInfo={modelInfo} onSubmit={handleResult} />;
        }
        return <AudioModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
      case "music":
        return <AudioModelInterface modelInfo={modelInfo} onSubmit={handleResult} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Unknown model type: {decodedModelId}</p>
            <p className="text-sm text-muted-foreground mt-2">Raw model ID: {params.modelId}</p>
          </div>
        );
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{modelInfo.name}</h1>
        <p className="text-muted-foreground">{modelInfo.description}</p>
      </div>

      {renderModelInterface()}

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Content</h2>
          <div className="relative w-full max-w-2xl mx-auto">
            {result.assets?.video ? (
              // Video result
              <div className="relative aspect-video">
                <video
                  src={result.assets.video}
                  controls
                  loop
                  className="w-full h-full rounded-lg"
                  poster={result.assets.image}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => result.assets?.video && handleDownload(result.assets.video)}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : result.images?.[0] ? (
              // Image result
              <div className="relative aspect-square">
                <Image
                  src={result.images[0].url}
                  alt={result.prompt || "Generated image"}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => result.images?.[0] && handleDownload(result.images[0].url)}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : result.audio ? (
              // Audio result
              <div className="space-y-4 p-4 border rounded-lg">
                <audio
                  src={result.audio.url}
                  controls
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {(result.audio.file_size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(result.audio!.url)}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download Audio
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground text-center">{result.prompt}</p>
        </div>
      )}
    </div>
  );
} 