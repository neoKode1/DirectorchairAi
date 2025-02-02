"use client";

import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface VideoModelInput {
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  fps?: number;
  seed?: number;
  motion_bucket_id?: number;
  noise_aug_strength?: number;
}

interface VideoModelInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: VideoModelInput) => void;
}

const defaultValues = {
  num_frames: 16,
  width: 1024,
  height: 576,
  num_inference_steps: 30,
  guidance_scale: 7.5,
  fps: 8,
  motion_bucket_id: 127,
  noise_aug_strength: 0.02,
};

const validAspectRatios = [
  { width: 1024, height: 576, label: "16:9 Landscape (1024x576)" },
  { width: 768, height: 432, label: "16:9 Landscape (768x432)" },
  { width: 512, height: 512, label: "1:1 Square (512x512)" },
  { width: 576, height: 1024, label: "9:16 Portrait (576x1024)" },
];

export const VideoModelInterface: React.FC<VideoModelInterfaceProps> = ({ modelInfo, onSubmit }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<VideoModelInput>({
    prompt: "",
    negative_prompt: "",
    ...defaultValues,
  });

  const validateForm = (): boolean => {
    if (!formData.prompt) {
      toast({
        title: "Error",
        description: "Prompt is required",
        variant: "destructive",
      });
      return false;
    }

    if (formData.num_frames && (formData.num_frames < 14 || formData.num_frames > 120)) {
      toast({
        title: "Error",
        description: "Number of frames must be between 14 and 120",
        variant: "destructive",
      });
      return false;
    }

    if (formData.width && (formData.width < 256 || formData.width > 1024 || formData.width % 8 !== 0)) {
      toast({
        title: "Error",
        description: "Width must be between 256 and 1024 and be a multiple of 8",
        variant: "destructive",
      });
      return false;
    }

    if (formData.height && (formData.height < 256 || formData.height > 1024 || formData.height % 8 !== 0)) {
      toast({
        title: "Error",
        description: "Height must be between 256 and 1024 and be a multiple of 8",
        variant: "destructive",
      });
      return false;
    }

    if (formData.num_inference_steps && (formData.num_inference_steps < 1 || formData.num_inference_steps > 100)) {
      toast({
        title: "Error",
        description: "Number of inference steps must be between 1 and 100",
        variant: "destructive",
      });
      return false;
    }

    if (formData.guidance_scale && (formData.guidance_scale < 1 || formData.guidance_scale > 20)) {
      toast({
        title: "Error",
        description: "Guidance scale must be between 1 and 20",
        variant: "destructive",
      });
      return false;
    }

    if (formData.fps && (formData.fps < 1 || formData.fps > 30)) {
      toast({
        title: "Error",
        description: "FPS must be between 1 and 30",
        variant: "destructive",
      });
      return false;
    }

    if (formData.motion_bucket_id && (formData.motion_bucket_id < 1 || formData.motion_bucket_id > 255)) {
      toast({
        title: "Error",
        description: "Motion bucket ID must be between 1 and 255",
        variant: "destructive",
      });
      return false;
    }

    if (formData.noise_aug_strength && (formData.noise_aug_strength < 0 || formData.noise_aug_strength > 1)) {
      toast({
        title: "Error",
        description: "Noise augmentation strength must be between 0 and 1",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      onSubmit(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAspectRatioChange = (value: string) => {
    const [width, height] = value.split("x").map(Number);
    setFormData({ ...formData, width, height });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Video Generation Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use Video Generation</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Prompt</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe what you want to generate. Be specific about motion, style, and details.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Video Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust frames, dimensions, and FPS to control video length and quality.
                      Higher values may increase generation time.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Motion Controls</h3>
                    <p className="text-sm text-muted-foreground">
                      Use motion bucket ID and noise strength to control movement intensity.
                      Higher motion values create more dynamic videos.
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
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            placeholder="Enter your prompt here..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="negative_prompt">Negative Prompt (Optional)</Label>
          <Textarea
            id="negative_prompt"
            value={formData.negative_prompt}
            onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
            placeholder="Enter things to avoid in the generation..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Select
            value={`${formData.width}x${formData.height}`}
            onValueChange={handleAspectRatioChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {validAspectRatios.map(({ width, height, label }) => (
                <SelectItem key={`${width}x${height}`} value={`${width}x${height}`}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_frames">Number of Frames</Label>
          <Slider
            id="num_frames"
            min={14}
            max={120}
            step={1}
            value={[formData.num_frames || defaultValues.num_frames]}
            onValueChange={([value]) => setFormData({ ...formData, num_frames: value })}
          />
          <div className="text-sm text-muted-foreground">
            Current: {formData.num_frames} frames
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fps">Frames Per Second</Label>
          <Slider
            id="fps"
            min={1}
            max={30}
            step={1}
            value={[formData.fps || defaultValues.fps]}
            onValueChange={([value]) => setFormData({ ...formData, fps: value })}
          />
          <div className="text-sm text-muted-foreground">
            Current: {formData.fps} FPS
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_inference_steps">Number of Inference Steps</Label>
          <Slider
            id="num_inference_steps"
            min={1}
            max={100}
            step={1}
            value={[formData.num_inference_steps || defaultValues.num_inference_steps]}
            onValueChange={([value]) => setFormData({ ...formData, num_inference_steps: value })}
          />
          <div className="text-sm text-muted-foreground">
            Current: {formData.num_inference_steps} steps
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guidance_scale">Guidance Scale</Label>
          <Slider
            id="guidance_scale"
            min={1}
            max={20}
            step={0.5}
            value={[formData.guidance_scale || defaultValues.guidance_scale]}
            onValueChange={([value]) => setFormData({ ...formData, guidance_scale: value })}
          />
          <div className="text-sm text-muted-foreground">
            Current: {formData.guidance_scale}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motion_bucket_id">Motion Intensity</Label>
          <Slider
            id="motion_bucket_id"
            min={1}
            max={255}
            step={1}
            value={[formData.motion_bucket_id || defaultValues.motion_bucket_id]}
            onValueChange={([value]) => setFormData({ ...formData, motion_bucket_id: value })}
          />
          <div className="text-sm text-muted-foreground">
            Current: {formData.motion_bucket_id}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="noise_aug_strength">Noise Strength</Label>
          <Slider
            id="noise_aug_strength"
            min={0}
            max={1}
            step={0.01}
            value={[formData.noise_aug_strength || defaultValues.noise_aug_strength]}
            onValueChange={([value]) => setFormData({ ...formData, noise_aug_strength: value })}
          />
          <div className="text-sm text-muted-foreground">
            Current: {formData.noise_aug_strength}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seed">Seed (Optional)</Label>
          <Input
            id="seed"
            type="number"
            value={formData.seed || ""}
            onChange={(e) => setFormData({ ...formData, seed: parseInt(e.target.value) })}
            placeholder="Enter seed number..."
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Video"}
        </Button>
      </form>
    </div>
  );
};

export default VideoModelInterface; 