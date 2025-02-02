import React from 'react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { InfoIcon, HomeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Result } from "@fal-ai/client";
import Link from "next/link";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface HunyuanVideoInput {
  prompt: string;
  num_inference_steps?: number;
  seed?: number;
  pro_mode?: boolean;
  aspect_ratio?: "16:9" | "9:16";
  resolution?: "480p" | "580p" | "720p";
  num_frames?: 85 | 129;
  enable_safety_checker?: boolean;
}

interface HunyuanVideoOutput {
  video: {
    url: string;
  };
}

interface HunyuanVideoInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: Result<HunyuanVideoOutput>) => void;
}

export const HunyuanVideoInterface: React.FC<HunyuanVideoInterfaceProps> = ({ modelInfo, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(30);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [numFrames, setNumFrames] = useState("129");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [proMode, setProMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/fal/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          inference_steps: numInferenceSteps,
          num_inference_steps: numInferenceSteps,
          aspect_ratio: aspectRatio,
          resolution,
          frames: parseInt(numFrames),
          num_frames: parseInt(numFrames),
          enable_safety_checker: enableSafetyChecker,
          pro_mode: proMode,
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
        <h2 className="text-lg font-semibold">Hunyuan Video Settings</h2>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <HomeIcon className="h-4 w-4" />
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <InfoIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to Use Hunyuan Video Generation</DialogTitle>
                <DialogDescription>
                  <div className="space-y-4 pt-4">
                    <div>
                      <h3 className="font-medium">Prompt</h3>
                      <p className="text-sm text-muted-foreground">
                        Describe the video scene in detail. Include information about characters, actions, environment, and style.
                        Example: "A stylish woman walks down a Tokyo street filled with warm glowing neon and animated city signage."
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Inference Steps</h3>
                      <p className="text-sm text-muted-foreground">
                        Controls the quality of generation. Higher values (max 50) produce better quality but take longer.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Pro Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Uses 55 steps instead of 35 for higher quality videos. Takes longer and costs 2x more.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Resolution & Frames</h3>
                      <p className="text-sm text-muted-foreground">
                        Higher resolutions and more frames produce longer, higher quality videos but take more time to generate.
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            placeholder="Describe the video scene you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="480p">480p</SelectItem>
                <SelectItem value="580p">580p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Number of Frames</Label>
            <Select value={numFrames} onValueChange={setNumFrames}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="85">85 frames</SelectItem>
                <SelectItem value="129">129 frames</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="num_steps">Inference Steps: {numInferenceSteps}</Label>
            </div>
            <Slider
              id="num_steps"
              min={1}
              max={50}
              step={1}
              value={[numInferenceSteps]}
              onValueChange={([value]) => setNumInferenceSteps(value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="safety">Safety Checker</Label>
            <p className="text-sm text-muted-foreground">
              Filter inappropriate content
            </p>
          </div>
          <Switch
            id="safety"
            checked={enableSafetyChecker}
            onCheckedChange={setEnableSafetyChecker}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pro">Pro Mode</Label>
            <p className="text-sm text-muted-foreground">
              Higher quality (55 steps)
            </p>
          </div>
          <Switch
            id="pro"
            checked={proMode}
            onCheckedChange={setProMode}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Video"}
        </Button>
      </form>
    </div>
  );
}; 