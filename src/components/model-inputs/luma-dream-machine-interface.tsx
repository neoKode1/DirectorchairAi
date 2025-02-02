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
import { InfoIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LUMA_MODELS, getDefaultLumaParams, type LumaModelParams } from "@/lib/lumaai";

interface LumaDreamMachineProps {
  modelInfo: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  onSubmit: (result: any) => void;
}

export const LumaDreamMachineInterface: React.FC<LumaDreamMachineProps> = ({ modelInfo, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ray2");
  const modelConfig = selectedModel === "ray2" ? LUMA_MODELS.RAY2 : LUMA_MODELS.RAY1_6;
  const [input, setInput] = useState<LumaModelParams>(getDefaultLumaParams(modelConfig));

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    const newModelConfig = value === "ray2" ? LUMA_MODELS.RAY2 : LUMA_MODELS.RAY1_6;
    setInput(getDefaultLumaParams(newModelConfig));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/luma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          model: selectedModel,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSubmit(result);
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Luma Dream Machine Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use Luma Dream Machine</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Prompt</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe the video scene you want to generate in detail.
                      Example: "A magical forest with glowing fireflies, mystical atmosphere, dreamy lighting"
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Motion Scale</h3>
                    <p className="text-sm text-muted-foreground">
                      Controls the intensity of motion in the generated video. Higher values create more dramatic movement.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Optional Image</h3>
                    <p className="text-sm text-muted-foreground">
                      You can optionally provide an image URL to influence the style and content of the generated video.
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
          <Label htmlFor="model">Model Version</Label>
          <Select
            value={selectedModel}
            onValueChange={handleModelChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ray2">{LUMA_MODELS.RAY2.name} - Latest Version</SelectItem>
              <SelectItem value="ray1.6">{LUMA_MODELS.RAY1_6.name} - Stable Version</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {modelConfig.description}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe the video scene you want to generate..."
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

        <div className="space-y-2">
          <Label htmlFor="image_url">Reference Image URL (Optional)</Label>
          <Input
            id="image_url"
            type="url"
            placeholder="Enter a URL for a reference image..."
            value={input.image_url || ""}
            onChange={(e) => setInput({ ...input, image_url: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num_frames">Number of Frames</Label>
            <Input
              id="num_frames"
              type="number"
              value={input.num_frames}
              onChange={(e) => setInput({ ...input, num_frames: parseInt(e.target.value) })}
              min={modelConfig.limits.num_frames.min}
              max={modelConfig.limits.num_frames.max}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fps">FPS</Label>
            <Input
              id="fps"
              type="number"
              value={input.fps}
              onChange={(e) => setInput({ ...input, fps: parseInt(e.target.value) })}
              min={modelConfig.limits.fps.min}
              max={modelConfig.limits.fps.max}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={input.width}
              onChange={(e) => setInput({ ...input, width: parseInt(e.target.value) })}
              min={modelConfig.limits.width.min}
              max={modelConfig.limits.width.max}
              step={modelConfig.limits.width.step}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={input.height}
              onChange={(e) => setInput({ ...input, height: parseInt(e.target.value) })}
              min={modelConfig.limits.height.min}
              max={modelConfig.limits.height.max}
              step={modelConfig.limits.height.step}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="motion_scale">Motion Scale</Label>
            <Input
              id="motion_scale"
              type="number"
              value={input.motion_scale}
              onChange={(e) => setInput({ ...input, motion_scale: parseFloat(e.target.value) })}
              min={modelConfig.limits.motion_scale.min}
              max={modelConfig.limits.motion_scale.max}
              step={modelConfig.limits.motion_scale.step}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guidance_scale">Guidance Scale</Label>
            <Input
              id="guidance_scale"
              type="number"
              value={input.guidance_scale}
              onChange={(e) => setInput({ ...input, guidance_scale: parseFloat(e.target.value) })}
              min={modelConfig.limits.guidance_scale.min}
              max={modelConfig.limits.guidance_scale.max}
              step={modelConfig.limits.guidance_scale.step}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num_inference_steps">Inference Steps</Label>
            <Input
              id="num_inference_steps"
              type="number"
              value={input.num_inference_steps}
              onChange={(e) => setInput({ ...input, num_inference_steps: parseInt(e.target.value) })}
              min={modelConfig.limits.num_inference_steps.min}
              max={modelConfig.limits.num_inference_steps.max}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (Optional)</Label>
            <Input
              id="seed"
              type="number"
              value={input.seed}
              onChange={(e) => setInput({ ...input, seed: parseInt(e.target.value) })}
              min={0}
              max={999999999}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Video"}
        </Button>
      </form>
    </div>
  );
};

export default LumaDreamMachineInterface; 