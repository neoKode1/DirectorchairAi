"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface MinimaxSubjectRefInput {
  prompt: string;
  subject_image_url: string;
  negative_prompt?: string;
  num_frames?: number;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  fps?: number;
  seed?: number;
  subject_strength?: number;
  motion_bucket_id?: number;
}

interface MinimaxSubjectRefInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (input: MinimaxSubjectRefInput) => Promise<void>;
}

const DEFAULT_VALUES = {
  num_frames: 16,
  width: 1024,
  height: 576,
  num_inference_steps: 30,
  guidance_scale: 7.5,
  fps: 8,
  subject_strength: 0.8,
  motion_bucket_id: 127,
};

export function MinimaxSubjectRefInterface({ modelInfo, onSubmit }: MinimaxSubjectRefInterfaceProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MinimaxSubjectRefInput>({
    prompt: "",
    subject_image_url: "",
    ...DEFAULT_VALUES,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt || !formData.subject_image_url) {
      toast({
        title: "Error",
        description: "Prompt and subject image URL are required",
        variant: "destructive",
      });
      return;
    }

    // Validate image URL format
    const validImageFormat = /\.(jpg|jpeg|png|webp)$/i.test(formData.subject_image_url);
    const validUrlFormat = /^https?:\/\/.+/.test(formData.subject_image_url);
    
    if (!validUrlFormat || !validImageFormat) {
      toast({
        title: "Error",
        description: "Invalid image URL format. Must be a valid URL with jpg, jpeg, png, or webp extension",
        variant: "destructive",
      });
      return;
    }

    // Validate number ranges
    if (formData.num_frames && (formData.num_frames < 14 || formData.num_frames > 120)) {
      toast({
        title: "Error",
        description: "Number of frames must be between 14 and 120",
        variant: "destructive",
      });
      return;
    }

    if (formData.width && (formData.width < 256 || formData.width > 1024 || formData.width % 8 !== 0)) {
      toast({
        title: "Error",
        description: "Width must be between 256 and 1024 and a multiple of 8",
        variant: "destructive",
      });
      return;
    }

    if (formData.height && (formData.height < 256 || formData.height > 576 || formData.height % 8 !== 0)) {
      toast({
        title: "Error",
        description: "Height must be between 256 and 576 and a multiple of 8",
        variant: "destructive",
      });
      return;
    }

    if (formData.subject_strength && (formData.subject_strength < 0 || formData.subject_strength > 1)) {
      toast({
        title: "Error",
        description: "Subject strength must be between 0 and 1",
        variant: "destructive",
      });
      return;
    }

    if (formData.motion_bucket_id && (formData.motion_bucket_id < 1 || formData.motion_bucket_id > 255)) {
      toast({
        title: "Error",
        description: "Motion bucket ID must be between 1 and 255",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Enter your prompt here..."
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject_image_url">Subject Image URL</Label>
        <Input
          id="subject_image_url"
          type="url"
          placeholder="Enter subject image URL (jpg, jpeg, png, or webp)"
          value={formData.subject_image_url}
          onChange={(e) => setFormData({ ...formData, subject_image_url: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="negative_prompt">Negative Prompt (Optional)</Label>
        <Textarea
          id="negative_prompt"
          placeholder="Enter negative prompt here..."
          value={formData.negative_prompt || ""}
          onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Number of Frames ({formData.num_frames})</Label>
          <Slider
            value={[formData.num_frames || DEFAULT_VALUES.num_frames]}
            onValueChange={([value]) => setFormData({ ...formData, num_frames: value })}
            min={14}
            max={120}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Width ({formData.width}px)</Label>
          <Slider
            value={[formData.width || DEFAULT_VALUES.width]}
            onValueChange={([value]) => setFormData({ ...formData, width: value - (value % 8) })}
            min={256}
            max={1024}
            step={8}
          />
        </div>

        <div className="space-y-2">
          <Label>Height ({formData.height}px)</Label>
          <Slider
            value={[formData.height || DEFAULT_VALUES.height]}
            onValueChange={([value]) => setFormData({ ...formData, height: value - (value % 8) })}
            min={256}
            max={576}
            step={8}
          />
        </div>

        <div className="space-y-2">
          <Label>FPS ({formData.fps})</Label>
          <Slider
            value={[formData.fps || DEFAULT_VALUES.fps]}
            onValueChange={([value]) => setFormData({ ...formData, fps: value })}
            min={1}
            max={30}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Guidance Scale ({formData.guidance_scale})</Label>
          <Slider
            value={[formData.guidance_scale || DEFAULT_VALUES.guidance_scale]}
            onValueChange={([value]) => setFormData({ ...formData, guidance_scale: value })}
            min={1}
            max={20}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <Label>Subject Strength ({formData.subject_strength})</Label>
          <Slider
            value={[formData.subject_strength || DEFAULT_VALUES.subject_strength]}
            onValueChange={([value]) => setFormData({ ...formData, subject_strength: value })}
            min={0}
            max={1}
            step={0.1}
          />
        </div>

        <div className="space-y-2">
          <Label>Motion Bucket ID ({formData.motion_bucket_id})</Label>
          <Slider
            value={[formData.motion_bucket_id || DEFAULT_VALUES.motion_bucket_id]}
            onValueChange={([value]) => setFormData({ ...formData, motion_bucket_id: Math.round(value) })}
            min={1}
            max={255}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seed">Seed (Optional)</Label>
          <Input
            id="seed"
            type="number"
            value={formData.seed || ""}
            onChange={(e) => setFormData({ ...formData, seed: parseInt(e.target.value) || undefined })}
            placeholder="Enter seed number"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Video"}
      </Button>
    </form>
  );
} 