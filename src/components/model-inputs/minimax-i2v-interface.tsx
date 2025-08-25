"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { button as Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FileUpload } from "./common-inputs";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface MinimaxI2VInterfaceProps {
  onSubmit: (result: any) => void;
  className?: string;
  modelInfo?: ApiInfo;
}

export function MinimaxI2VInterface({
  onSubmit,
  className,
  modelInfo,
}: MinimaxI2VInterfaceProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState({
    prompt: "",
    image_url: "",
    prompt_optimizer: true,
  });

  const handleFileSelect = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (PNG, JPG, JPEG, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`[VIDEO] Uploading image:`, file.name);

      // First upload to uploadthing to get a URL
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { url } = await uploadResponse.json();

      // Store the URL in state
      setInput((prev) => ({
        ...prev,
        image_url: url,
      }));

      console.log(`[VIDEO] Image uploaded successfully:`, url);
      toast({
        title: "File uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error(`[VIDEO] Image upload error:`, error);
      toast({
        title: "Upload failed",
        description: "Failed to upload the image. Please try again.",
        variant: "destructive",
      });
      setInput((prev) => ({
        ...prev,
        image_url: "",
      }));
    }
  };

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!input.image_url) {
        throw new Error("Please upload an image first");
      }

      const response = await fetch("/api/generate/fal/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          model: modelInfo?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate video");
      }

      const result = await response.json();
      onSubmit(result);
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, modelInfo?.id, onSubmit, toast]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label>Source Image</Label>
        <div className="flex flex-col gap-4">
          <FileUpload
            label="Upload Image"
            onFileSelect={handleFileSelect}
            accept="image/*"
            description="Upload an image to animate"
          />
          {input.image_url && (
            <div className="relative aspect-video w-full">
              <Image
                src={input.image_url}
                alt="Source image"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea
          placeholder="Describe how you want the image to be animated..."
          value={input.prompt}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, prompt: e.target.value }))
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="prompt-optimizer"
          checked={input.prompt_optimizer}
          onCheckedChange={(checked) =>
            setInput((prev) => ({ ...prev, prompt_optimizer: checked }))
          }
        />
        <Label htmlFor="prompt-optimizer">Use prompt optimizer</Label>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || !input.image_url}
      >
        {isLoading ? "Generating..." : "Generate Video"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Powered by Minimax • Generation may take a few minutes
      </p>
    </div>
  );
}
