"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon, UploadCloud, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PixverseVideoInterfaceProps {
  modelInfo: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  onSubmit: (result: any) => void;
  className?: string;
}

interface PixverseVideoInput {
  prompt: string;
  image_url: string;
  negative_prompt: string;
  aspect_ratio: string;
  resolution: string;
  style?: string;
}

export const PixverseVideoInterface: React.FC<PixverseVideoInterfaceProps> = ({ modelInfo, onSubmit, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [input, setInput] = useState<PixverseVideoInput>({
    prompt: "",
    image_url: "",
    negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded",
    aspect_ratio: "16:9",
    resolution: "720p",
    style: undefined
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
      console.log(`[VIDEO] Uploading image:`, file.name);
      
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
      
      setSelectedFile(file);
      setInput(prev => ({
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
      setSelectedFile(null);
      setInput(prev => ({
        ...prev,
        image_url: "",
      }));
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setInput(prev => ({
      ...prev,
      image_url: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!input.image_url) {
        throw new Error("Please provide an image");
      }
      if (!input.prompt) {
        throw new Error("Please provide a prompt");
      }

      const response = await fetch("/api/generate/fal/image-to-video/fast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "fal-ai/pixverse/v3.5/image-to-video/fast",
          ...input,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to generate video");
      onSubmit(result);
      toast({
        title: "Generation started",
        description: "Your video is being generated. This may take a few minutes.",
      });
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
  };

  return (
    <div className={cn("space-y-4 py-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Image to Video Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use Image to Video Generation</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Source Image</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload an image or provide a URL. This will be the starting point for your video.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Prompt</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe how you want the image to be animated.
                      Example: "A serene lake with mountains in the background, gentle ripples in the water, cinematic"
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust resolution and aspect ratio to customize your video output.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Source Image</Label>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="pixverse-image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <label
                htmlFor="pixverse-image-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  "hover:bg-muted/50 transition-colors",
                  selectedFile ? "border-primary" : "border-muted-foreground/25"
                )}
              >
                {selectedFile ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt="Upload preview"
                      className="object-contain rounded-lg"
                      fill
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        clearImage();
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs">PNG, JPG, JPEG (max. 5MB)</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Or enter an image URL..."
                value={input.image_url}
                onChange={(e) => setInput({ ...input, image_url: e.target.value })}
              />
              {input.image_url && !selectedFile && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe how you want the image to be animated..."
            value={input.prompt}
            onChange={(e) => setInput({ ...input, prompt: e.target.value })}
            required
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="negative_prompt">Negative Prompt</Label>
          <Textarea
            id="negative_prompt"
            placeholder="Describe what you don't want to see in the video..."
            value={input.negative_prompt}
            onChange={(e) => setInput({ ...input, negative_prompt: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <select
              id="resolution"
              className="w-full px-3 py-2 border rounded-md"
              value={input.resolution}
              onChange={(e) => setInput({ ...input, resolution: e.target.value })}
            >
              <option value="360p">360p</option>
              <option value="540p">540p</option>
              <option value="720p">720p</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aspect_ratio">Aspect Ratio</Label>
            <select
              id="aspect_ratio"
              className="w-full px-3 py-2 border rounded-md"
              value={input.aspect_ratio}
              onChange={(e) => setInput({ ...input, aspect_ratio: e.target.value })}
            >
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
              <option value="3:4">3:4</option>
              <option value="9:16">9:16</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Video"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Powered by FAL • Generation may take a few minutes
        </p>
      </form>
    </div>
  );
}; 