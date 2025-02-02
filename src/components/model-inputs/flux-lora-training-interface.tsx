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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { fal } from "@fal-ai/client";

interface FluxLoraTrainingInterfaceProps {
  modelInfo: {
    id: string;
    name: string;
    description: string;
  };
  onSubmit: (result: any) => void;
}

export function FluxLoraTrainingInterface({ modelInfo, onSubmit }: FluxLoraTrainingInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState(1000);
  const [triggerWord, setTriggerWord] = useState("");
  const [createMasks, setCreateMasks] = useState(true);
  const [isStyle, setIsStyle] = useState(false);
  const [isPreprocessed, setIsPreprocessed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagesDataUrl, setImagesDataUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const url = await fal.storage.upload(file);
      setImagesDataUrl(url);
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
      const response = await fetch("/api/generate/fal/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images_data_url: imagesDataUrl,
          steps,
          trigger_word: triggerWord,
          create_masks: createMasks,
          is_style: isStyle,
          is_input_format_already_preprocessed: isPreprocessed,
          model: modelInfo.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSubmit(result);
    } catch (error) {
      console.error("Error in LoRA training:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">FLUX LoRA Training</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Use FLUX LoRA Training</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="font-medium">Training Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a ZIP file containing your training images. For best results, include at least 4 images.
                      You can include text files with captions (same name as image files) and mask files (image_name_mask.jpg).
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Training Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose between subject training (default) or style training. Subject training includes auto-captioning and segmentation.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Parameters</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust steps for training duration and use trigger word to identify your subject/style in prompts.
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
          <Label>Training Data (ZIP file)</Label>
          <Input
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            required
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="trigger_word">Trigger Word</Label>
          <Input
            id="trigger_word"
            placeholder="Enter a trigger word..."
            value={triggerWord}
            onChange={(e) => setTriggerWord(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            {isStyle ? 
              "Required for style training. Use this to reference your style in prompts." :
              "Optional for subject training. Will be used if no captions are provided."}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="steps">Training Steps: {steps}</Label>
          </div>
          <Slider
            id="steps"
            min={100}
            max={5000}
            step={100}
            value={[steps]}
            onValueChange={([value]) => setSteps(value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_style">Style Training</Label>
            <p className="text-sm text-muted-foreground">
              Train a style LoRA instead of a subject
            </p>
          </div>
          <Switch
            id="is_style"
            checked={isStyle}
            onCheckedChange={(checked) => {
              setIsStyle(checked);
              if (checked) {
                setCreateMasks(false);
              }
            }}
          />
        </div>

        {!isStyle && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="create_masks">Create Masks</Label>
              <p className="text-sm text-muted-foreground">
                Generate segmentation masks for training
              </p>
            </div>
            <Switch
              id="create_masks"
              checked={createMasks}
              onCheckedChange={setCreateMasks}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_preprocessed">Pre-processed Input</Label>
            <p className="text-sm text-muted-foreground">
              Input data is already in processed format
            </p>
          </div>
          <Switch
            id="is_preprocessed"
            checked={isPreprocessed}
            onCheckedChange={setIsPreprocessed}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || !imagesDataUrl}>
          {isLoading ? "Training..." : "Start Training"}
        </Button>
      </form>
    </div>
  );
} 