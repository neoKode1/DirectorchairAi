import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fal } from "@fal-ai/client";

interface LipsyncInterfaceProps {
  modelInfo: {
    id: string;
    name: string;
    description: string;
  };
  onSubmit: (result: any) => void;
}

export function LipsyncInterface({ modelInfo, onSubmit }: LipsyncInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [syncMode, setSyncMode] = useState("cut_off");
  const [model, setModel] = useState("lipsync-1.9.0-beta");
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const url = await fal.storage.upload(file);
      setVideoUrl(url);
      setVideoUploadProgress(0);
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const url = await fal.storage.upload(file);
      setAudioUrl(url);
      setAudioUploadProgress(0);
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/fal/lipsync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          audio_url: audioUrl,
          sync_mode: syncMode,
          model,
          model_id: modelInfo.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSubmit(result);
    } catch (error) {
      console.error("Error in lipsync:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lipsync Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use Lipsync</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Upload Files</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a video file and an audio file. The model will sync the video's lip movements to match the audio.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Sync Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose how to handle duration mismatches:
                      - Cut Off: Trim the longer media to match
                      - Loop: Repeat the shorter media
                      - Bounce: Play shorter media forward then backward
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Model Version</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the model version to use. The latest beta version typically offers the best results.
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
          <Label>Video File</Label>
          <Input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            required
          />
          {videoUploadProgress > 0 && (
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${videoUploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Audio File</Label>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            required
          />
          {audioUploadProgress > 0 && (
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${audioUploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Sync Mode</Label>
          <Select value={syncMode} onValueChange={setSyncMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cut_off">Cut Off</SelectItem>
              <SelectItem value="loop">Loop</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Model Version</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lipsync-1.9.0-beta">1.9.0 Beta (Latest)</SelectItem>
              <SelectItem value="lipsync-1.8.0">1.8.0</SelectItem>
              <SelectItem value="lipsync-1.7.1">1.7.1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !videoUrl || !audioUrl}>
          {isLoading ? "Processing..." : "Generate Lipsync Video"}
        </Button>
      </form>
    </div>
  );
} 