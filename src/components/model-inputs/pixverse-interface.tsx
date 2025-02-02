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

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface PixverseInput {
  prompt: string;
  negative_prompt: string;
  num_frames: number;
  width: number;
  height: number;
  num_inference_steps: number;
  guidance_scale: number;
  fps: number;
}

interface PixverseInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: any) => void;
}

export const PixverseInterface: React.FC<PixverseInterfaceProps> = ({ modelInfo, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState<PixverseInput>({
    prompt: "",
    negative_prompt: "blurry, low quality, low resolution, pixelated, noisy, grainy, out of focus, poorly lit, poorly exposed, poorly composed, poorly framed, poorly cropped, poorly color corrected, poorly color graded",
    num_frames: 16,
    width: 576,
    height: 320,
    num_inference_steps: 30,
    guidance_scale: 12.5,
    fps: 8
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/fal/text-to-video/fast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          model: modelInfo.id,
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
        <h2 className="text-lg font-semibold">Text to Video Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use Text to Video Generation</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Prompt</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe the video scene you want to generate in detail.
                      Example: "A butterfly landing on a flower in slow motion, cinematic lighting, high quality, detailed"
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust frames, dimensions, and quality settings to customize your video output.
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num_frames">Number of Frames</Label>
            <Input
              id="num_frames"
              type="number"
              value={input.num_frames}
              onChange={(e) => setInput({ ...input, num_frames: parseInt(e.target.value) })}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fps">FPS</Label>
            <Input
              id="fps"
              type="number"
              value={input.fps}
              onChange={(e) => setInput({ ...input, fps: parseInt(e.target.value) })}
              min={1}
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
              min={64}
              step={64}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={input.height}
              onChange={(e) => setInput({ ...input, height: parseInt(e.target.value) })}
              min={64}
              step={64}
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
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guidance_scale">Guidance Scale</Label>
            <Input
              id="guidance_scale"
              type="number"
              value={input.guidance_scale}
              onChange={(e) => setInput({ ...input, guidance_scale: parseFloat(e.target.value) })}
              min={1}
              step={0.1}
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

export default PixverseInterface; 