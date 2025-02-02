"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { RecraftModelInterface, RecraftModelInput } from "@/components/model-inputs/recraft-model-interface";
import { ImageVariantGrid } from "@/components/image-variant-grid";
import { Loader2 } from "lucide-react";

const modelInfo = {
  id: "recraft",
  name: "Nano • Recraft",
  description: "Image generation model",
  category: "image",
};

export default function RecraftPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{ url: string }[]>([]);

  const handleSubmit = async (input: RecraftModelInput): Promise<{ images: { url: string }[] }> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate/recraft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Failed to generate images");
      }

      const data = await response.json();
      setImages(data.images);
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate images",
        variant: "destructive",
      });
      return { images: [] };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{modelInfo.name}</h1>
        <p className="text-muted-foreground">{modelInfo.description}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Image Generation Settings</h2>
          <RecraftModelInterface modelInfo={modelInfo} onSubmit={handleSubmit} />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Generated Images</h2>
          <ImageVariantGrid 
            variants={images} 
            onSelect={() => {}} 
            onUpscale={() => {}} 
            onRegenerate={() => {}}
          />
        </div>
      )}
    </div>
  );
} 