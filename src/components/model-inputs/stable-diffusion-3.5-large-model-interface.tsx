"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { button as Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface StableDiffusion35LargeModelInput {
  prompt: string;
  negative_prompt?: string;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: string;
  output_format?: string;
  aspect_ratio?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
  use_seed?: boolean;
}

interface StableDiffusion35LargeModelInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (
    input: StableDiffusion35LargeModelInput,
  ) => Promise<{ images: { url: string }[] }>;
}

const validSafetyTolerances = ["low", "medium", "high"];
const validOutputFormats = ["png", "jpg"];
const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const StableDiffusion35LargeModelInterface: React.FC<
  StableDiffusion35LargeModelInterfaceProps
> = ({ modelInfo, onSubmit }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<StableDiffusion35LargeModelInput>({
    prompt: "",
    negative_prompt: "",
    num_images: 1,
    enable_safety_checker: true,
    safety_tolerance: "medium",
    output_format: "jpeg",
    aspect_ratio: "1:1",
    guidance_scale: 7.5,
    num_inference_steps: 50,
    seed: 0,
    use_seed: false,
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

    if (
      formData.num_images &&
      (formData.num_images < 1 || formData.num_images > 4)
    ) {
      toast({
        title: "Error",
        description: "Number of images must be between 1 and 4",
        variant: "destructive",
      });
      return false;
    }

    if (
      formData.guidance_scale &&
      (formData.guidance_scale < 1 || formData.guidance_scale > 20)
    ) {
      toast({
        title: "Error",
        description: "Guidance scale must be between 1 and 20",
        variant: "destructive",
      });
      return false;
    }

    if (
      formData.num_inference_steps &&
      (formData.num_inference_steps < 20 || formData.num_inference_steps > 100)
    ) {
      toast({
        title: "Error",
        description: "Number of inference steps must be between 20 and 100",
        variant: "destructive",
      });
      return false;
    }

    if (
      formData.use_seed &&
      ((formData.seed ?? 0) < 0 || (formData.seed ?? 0) > 2147483647)
    ) {
      toast({
        title: "Error",
        description: "Seed must be between 0 and 2147483647",
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
      await onSubmit(formData);
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
          onChange={(e) =>
            setFormData({ ...formData, negative_prompt: e.target.value })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, num_images: parseInt(e.target.value) })
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enable_safety_checker"
          checked={formData.enable_safety_checker}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, enable_safety_checker: checked })
          }
        />
        <Label htmlFor="enable_safety_checker">Enable Safety Checker</Label>
      </div>

      <div>
        <Label htmlFor="safety_tolerance">Safety Tolerance</Label>
        <Select
          value={formData.safety_tolerance}
          onValueChange={(value) =>
            setFormData({ ...formData, safety_tolerance: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select safety tolerance" />
          </SelectTrigger>
          <SelectContent>
            {validSafetyTolerances.map((tolerance) => (
              <SelectItem key={tolerance} value={tolerance}>
                {tolerance.charAt(0).toUpperCase() + tolerance.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="output_format">Output Format</Label>
        <Select
          value={formData.output_format}
          onValueChange={(value) =>
            setFormData({ ...formData, output_format: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            {validOutputFormats.map((format) => (
              <SelectItem key={format} value={format}>
                {format.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="aspect_ratio">Aspect Ratio</Label>
        <Select
          value={formData.aspect_ratio}
          onValueChange={(value) =>
            setFormData({ ...formData, aspect_ratio: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            {validAspectRatios.map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="guidance_scale">Guidance Scale</Label>
        <Slider
          id="guidance_scale"
          min={1}
          max={20}
          step={0.5}
          value={[formData.guidance_scale || 7.5]}
          onValueChange={([value]) =>
            setFormData({ ...formData, guidance_scale: value })
          }
        />
      </div>

      <div>
        <Label htmlFor="num_inference_steps">Number of Inference Steps</Label>
        <Slider
          id="num_inference_steps"
          min={20}
          max={100}
          step={1}
          value={[formData.num_inference_steps || 50]}
          onValueChange={([value]) =>
            setFormData({ ...formData, num_inference_steps: value })
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="use_seed"
          checked={formData.use_seed}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, use_seed: checked })
          }
        />
        <Label htmlFor="use_seed">Use Custom Seed</Label>
      </div>

      {formData.use_seed && (
        <div>
          <Label htmlFor="seed">Seed</Label>
          <Input
            id="seed"
            type="number"
            min={0}
            max={2147483647}
            value={formData.seed}
            onChange={(e) =>
              setFormData({ ...formData, seed: parseInt(e.target.value) })
            }
          />
        </div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate"}
      </Button>
    </form>
  );
};

export default StableDiffusion35LargeModelInterface;
