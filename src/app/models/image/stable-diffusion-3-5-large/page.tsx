"use client";

import { useState } from "react";
import { StableDiffusion35LargeModelInterface, StableDiffusion35LargeModelInput } from "@/components/model-inputs/stable-diffusion-3.5-large-model-interface";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ImageResult } from "@/lib/types";
import Image from "next/image";

const modelInfo = {
  id: "fal-ai/stable-diffusion-3-5-large",
  name: "Nano • Stable Diffusion 3.5 Large",
  description: "Image generation model",
  category: "image",
};

export default function StableDiffusion35LargePage() {
  const { toast } = useToast();
  const [results, setResults] = useState<ImageResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/generate/stable-diffusion-3-5-large", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate image");
      }

      const result = await response.json();
      if (result.data?.images) {
        setResults(result.data.images);
        return { images: result.data.images };
      }
      return { images: [] };
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
      return { images: [] };
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{modelInfo.name}</h1>
        <p className="text-muted-foreground">{modelInfo.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Image Generation Settings</h2>
            <StableDiffusion35LargeModelInterface
              modelInfo={modelInfo}
              onSubmit={handleSubmit}
            />
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Generated Images</h2>
          {isGenerating && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            {results.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 