"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ImageVariantGrid, ImageVariant } from "@/components/image-variant-grid";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface StableDiffusionInput {
  prompt: string;
  negative_prompt?: string;
  num_images?: number;
  scheduler?: "ddim" | "dpm-solver" | "euler-ancestral" | "euler" | "lms";
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
  seed?: number;
  enable_safety_checker?: boolean;
  clip_skip?: number;
  image_format?: "jpeg" | "png";
  quality?: number;
}

interface StableDiffusionInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: StableDiffusionInput) => void;
}

const validSchedulers = ["ddim", "dpm-solver", "euler-ancestral", "euler", "lms"];
const validImageFormats = ["jpeg", "png"];
const validDimensions = [256, 512, 768, 1024];

export const StableDiffusionInterface: React.FC<StableDiffusionInterfaceProps> = ({ modelInfo, onSubmit }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<StableDiffusionInput>({
    prompt: "",
    negative_prompt: "",
    num_images: 1,
    scheduler: "dpm-solver",
    num_inference_steps: 30,
    guidance_scale: 7.5,
    width: 512,
    height: 512,
    seed: undefined,
    enable_safety_checker: true,
    clip_skip: 1,
    image_format: "png",
    quality: 95,
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

    if (formData.num_images && (formData.num_images < 1 || formData.num_images > 4)) {
      toast({
        title: "Error",
        description: "Number of images must be between 1 and 4",
        variant: "destructive",
      });
      return false;
    }

    if (formData.scheduler && !validSchedulers.includes(formData.scheduler)) {
      toast({
        title: "Error",
        description: "Invalid scheduler selected",
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

    if (formData.clip_skip && (formData.clip_skip < 1 || formData.clip_skip > 4)) {
      toast({
        title: "Error",
        description: "CLIP skip must be between 1 and 4",
        variant: "destructive",
      });
      return false;
    }

    if (formData.quality && (formData.quality < 1 || formData.quality > 100)) {
      toast({
        title: "Error",
        description: "Quality must be between 1 and 100",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          placeholder="Enter your prompt here..."
          required
        />
      </div>

      <div>
        <Label htmlFor="negative_prompt">Negative Prompt</Label>
        <Textarea
          id="negative_prompt"
          value={formData.negative_prompt}
          onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
          placeholder="Enter negative prompt (optional)..."
        />
      </div>

      <div>
        <Label htmlFor="num_images">Number of Images</Label>
        <Input
          id="num_images"
          type="number"
          min={1}
          max={4}
          value={formData.num_images}
          onChange={(e) => setFormData({ ...formData, num_images: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <Label htmlFor="scheduler">Scheduler</Label>
        <Select
          value={formData.scheduler}
          onValueChange={(value: "ddim" | "dpm-solver" | "euler-ancestral" | "euler" | "lms") => 
            setFormData({ ...formData, scheduler: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select scheduler" />
          </SelectTrigger>
          <SelectContent>
            {validSchedulers.map((scheduler) => (
              <SelectItem key={scheduler} value={scheduler}>
                {scheduler}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="num_inference_steps">Number of Inference Steps</Label>
        <Slider
          id="num_inference_steps"
          min={1}
          max={100}
          step={1}
          value={[formData.num_inference_steps || 30]}
          onValueChange={([value]) => setFormData({ ...formData, num_inference_steps: value })}
        />
      </div>

      <div>
        <Label htmlFor="guidance_scale">Guidance Scale</Label>
        <Slider
          id="guidance_scale"
          min={1}
          max={20}
          step={0.5}
          value={[formData.guidance_scale || 7.5]}
          onValueChange={([value]) => setFormData({ ...formData, guidance_scale: value })}
        />
      </div>

      <div>
        <Label htmlFor="width">Width</Label>
        <Select
          value={formData.width?.toString()}
          onValueChange={(value) => setFormData({ ...formData, width: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select width" />
          </SelectTrigger>
          <SelectContent>
            {validDimensions.map((dim) => (
              <SelectItem key={dim} value={dim.toString()}>
                {dim}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="height">Height</Label>
        <Select
          value={formData.height?.toString()}
          onValueChange={(value) => setFormData({ ...formData, height: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select height" />
          </SelectTrigger>
          <SelectContent>
            {validDimensions.map((dim) => (
              <SelectItem key={dim} value={dim.toString()}>
                {dim}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="seed">Seed (Optional)</Label>
        <Input
          id="seed"
          type="number"
          value={formData.seed}
          onChange={(e) => setFormData({ ...formData, seed: parseInt(e.target.value) })}
          placeholder="Enter seed number..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enable_safety_checker"
          checked={formData.enable_safety_checker}
          onCheckedChange={(checked) => setFormData({ ...formData, enable_safety_checker: checked })}
        />
        <Label htmlFor="enable_safety_checker">Enable Safety Checker</Label>
      </div>

      <div>
        <Label htmlFor="clip_skip">CLIP Skip</Label>
        <Slider
          id="clip_skip"
          min={1}
          max={4}
          step={1}
          value={[formData.clip_skip || 1]}
          onValueChange={([value]) => setFormData({ ...formData, clip_skip: value })}
        />
      </div>

      <div>
        <Label htmlFor="image_format">Image Format</Label>
        <Select
          value={formData.image_format}
          onValueChange={(value: "jpeg" | "png") => setFormData({ ...formData, image_format: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select image format" />
          </SelectTrigger>
          <SelectContent>
            {validImageFormats.map((format) => (
              <SelectItem key={format} value={format}>
                {format.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quality">Quality</Label>
        <Slider
          id="quality"
          min={1}
          max={100}
          step={1}
          value={[formData.quality || 95]}
          onValueChange={([value]) => setFormData({ ...formData, quality: value })}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate"}
      </Button>
    </form>
  );
};

export default StableDiffusionInterface; 