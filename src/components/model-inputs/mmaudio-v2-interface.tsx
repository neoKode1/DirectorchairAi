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
import { InfoIcon, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { fal } from "@fal-ai/client";

interface MMAudioV2InterfaceProps {
  modelInfo: {
    id: string;
    name: string;
    description: string;
  };
  onSubmit: (result: any) => void;
}

export function MMAudioV2Interface({ modelInfo, onSubmit }: MMAudioV2InterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [numSteps, setNumSteps] = useState(25);
  const [duration, setDuration] = useState(8);
  const [cfgStrength, setCfgStrength] = useState(4.5);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isVideoToVideo = modelInfo.id === "fal-ai/mmaudio-v2/video-to-video";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const url = await fal.storage.upload(file);
      setVideoUrl(url);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/fal/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          video_url: videoUrl,
          num_steps: numSteps,
          duration,
          cfg_strength: cfgStrength,
          model: modelInfo.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSubmit(result);
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">MMAudio V2 Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use MMAudio V2</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  {isVideoToVideo && (
                    <div>
                      <h3 className="font-medium">Video Upload</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a video file or provide a URL. The model will generate audio based on this video.
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">Prompt</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe the type of audio you want to generate. Example: "Indian holy music"
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust steps (quality), duration, and CFG strength (creativity vs. prompt adherence) to fine-tune the generation.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isVideoToVideo && (
          <div className="space-y-2">
            <Label>Video Input</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="col-span-1"
              />
              <Input
                type="url"
                placeholder="Or enter video URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="col-span-1"
              />
            </div>
            {uploadProgress > 0 && (
              <div className="w-full bg-secondary h-2 rounded-full mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            placeholder="Describe the audio you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="num_steps">Steps: {numSteps}</Label>
            </div>
            <Slider
              id="num_steps"
              min={1}
              max={50}
              step={1}
              value={[numSteps]}
              onValueChange={([value]) => setNumSteps(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="duration">Duration: {duration}s</Label>
            </div>
            <Slider
              id="duration"
              min={1}
              max={30}
              step={1}
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="cfg_strength">CFG Strength: {cfgStrength}</Label>
            </div>
            <Slider
              id="cfg_strength"
              min={1}
              max={10}
              step={0.1}
              value={[cfgStrength]}
              onValueChange={([value]) => setCfgStrength(value)}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || (isVideoToVideo && !videoUrl)}
        >
          {isLoading ? "Generating..." : "Generate Audio"}
        </Button>
      </form>
    </div>
  );
} 