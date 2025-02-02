"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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

interface MinimaxSubjectRefInterfaceProps {
  onSubmit: (result: any) => void;
  className?: string;
  modelInfo?: ApiInfo;
}

export function MinimaxSubjectRefInterface({ onSubmit, className, modelInfo }: MinimaxSubjectRefInterfaceProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState({
    prompt: "",
    subject_reference_image_url: "",
    prompt_optimizer: true,
  });

  const handleFileSelect = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (PNG, JPG, JPEG, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`[VIDEO] Uploading subject reference image:`, file.name);
      
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
      setInput(prev => ({
        ...prev,
        subject_reference_image_url: url,
      }));
      
      console.log(`[VIDEO] Subject reference image uploaded successfully:`, url);
      toast({
        title: "File uploaded",
        description: "Your subject reference image has been uploaded successfully.",
      });
    } catch (error) {
      console.error(`[VIDEO] Subject reference image upload error:`, error);
      toast({
        title: "Upload failed",
        description: "Failed to upload the image. Please try again.",
        variant: "destructive",
      });
      setInput(prev => ({
        ...prev,
        subject_reference_image_url: "",
      }));
    }
  };

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!input.subject_reference_image_url) {
        throw new Error("Please upload a subject reference image first");
      }

      if (!input.prompt) {
        throw new Error("Please enter a prompt describing the video you want to generate");
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
        description: error instanceof Error ? error.message : "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, modelInfo?.id, onSubmit, toast]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label>Subject Reference Image</Label>
        <div className="flex flex-col gap-4">
          <FileUpload
            label="Upload Subject Image"
            onFileSelect={handleFileSelect}
            accept="image/*"
            description="Upload an image of the subject to maintain consistent appearance"
          />
          {input.subject_reference_image_url && (
            <div className="relative aspect-square w-full max-w-sm mx-auto">
              <Image
                src={input.subject_reference_image_url}
                alt="Subject reference"
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
          placeholder="Describe how you want the subject to appear in the video..."
          value={input.prompt}
          onChange={(e) => setInput((prev) => ({ ...prev, prompt: e.target.value }))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="prompt-optimizer"
          checked={input.prompt_optimizer}
          onCheckedChange={(checked) => setInput((prev) => ({ ...prev, prompt_optimizer: checked }))}
        />
        <Label htmlFor="prompt-optimizer">Use prompt optimizer</Label>
      </div>

      <Button 
        className="w-full" 
        onClick={handleSubmit} 
        disabled={isLoading || !input.subject_reference_image_url || !input.prompt}
      >
        {isLoading ? "Generating..." : "Generate Video"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Powered by Minimax • Generation may take a few minutes
      </p>
    </div>
  );
} 