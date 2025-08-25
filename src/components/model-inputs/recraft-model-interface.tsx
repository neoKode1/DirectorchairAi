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

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RecraftModelInput {
  prompt: string;
  negative_prompt?: string;
  num_images?: number;
  enable_safety_checker?: boolean;
  safety_tolerance?: string;
  output_format?: string;
  aspect_ratio?: string;
  seed?: number;
  use_seed?: boolean;
}

interface RecraftModelInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (
    input: RecraftModelInput,
  ) => Promise<{ images: { url: string }[] }>;
}

const validSafetyTolerances = ["low", "medium", "high"];
const validOutputFormats = ["png", "jpg"];
const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const RecraftModelInterface: React.FC<RecraftModelInterfaceProps> = ({
  modelInfo,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<RecraftModelInput>({
    prompt: "",
    negative_prompt: "",
    num_images: 1,
    enable_safety_checker: true,
    safety_tolerance: "medium",
    output_format: "png",
    aspect_ratio: "1:1",
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

    const seedValue = formData.seed ?? 0;
    if (formData.use_seed && (seedValue < 0 || seedValue > 2147483647)) {
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

export default RecraftModelInterface;
