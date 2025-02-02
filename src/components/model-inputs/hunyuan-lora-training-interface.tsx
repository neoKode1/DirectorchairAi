import React from 'react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Result } from "@fal-ai/client";
import { XCircleIcon, AlertCircleIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface HunyuanLoraTrainingInput {
  instance_data: {
    instance_prompt: string;
    class_prompt?: string;
    instance_images: string[];
  };
  training_params?: {
    num_training_steps?: number;
    learning_rate?: number;
    train_text_encoder?: boolean;
    resolution?: number;
  };
}

interface HunyuanLoraTrainingOutput {
  lora_id: string;
  status: string;
  progress: number;
}

interface HunyuanLoraTrainingInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: Result<HunyuanLoraTrainingOutput>) => void;
}

interface ImagePreview {
  url: string;
  status: 'loading' | 'valid' | 'error';
  error?: string;
}

export const HunyuanLoraTrainingInterface: React.FC<HunyuanLoraTrainingInterfaceProps> = ({ modelInfo, onSubmit }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [instancePrompt, setInstancePrompt] = useState("");
  const [classPrompt, setClassPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [numTrainingSteps, setNumTrainingSteps] = useState(100);
  const [learningRate, setLearningRate] = useState(1e-4);
  const [trainTextEncoder, setTrainTextEncoder] = useState(true);
  const [resolution, setResolution] = useState(512);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Validate and load image previews when URLs change
  useEffect(() => {
    const validateImages = async () => {
      const newPreviews: ImagePreview[] = await Promise.all(
        imageUrls.map(async (url) => {
          if (!url) return { url, status: 'error', error: 'Empty URL' };
          
          try {
            // Validate URL format
            new URL(url);
            
            // Check if URL points to an image
            const preview: ImagePreview = { url, status: 'loading' };
            
            // Create a promise that resolves on image load or rejects on error
            await new Promise((resolve, reject) => {
              const img = new window.Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = url;
            });

            preview.status = 'valid';
            return preview;
          } catch (error) {
            return {
              url,
              status: 'error',
              error: error instanceof Error ? error.message : 'Invalid image URL'
            };
          }
        })
      );

      setImagePreviews(newPreviews);
    };

    validateImages();
  }, [imageUrls]);

  // Handle URL input change with validation
  const handleUrlsChange = (input: string) => {
    const urls = input.split(",").map(url => url.trim()).filter(url => url);
    setImageUrls(urls);
  };

  // Remove an image from the list
  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all images are loaded successfully
    const invalidImages = imagePreviews.filter(preview => preview.status !== 'valid');
    if (invalidImages.length > 0) {
      toast({
        title: "Invalid Images",
        description: "Please ensure all image URLs are valid before starting training.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTrainingProgress(0);

    try {
      const response = await fetch("/api/train/hunyuan-lora", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instance_data: {
            instance_prompt: instancePrompt,
            class_prompt: classPrompt || undefined,
            instance_images: imageUrls,
          },
          training_params: {
            num_training_steps: numTrainingSteps,
            learning_rate: learningRate,
            train_text_encoder: trainTextEncoder,
            resolution,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Start progress polling
      const pollProgress = setInterval(async () => {
        try {
          const progressResponse = await fetch(`/api/train/hunyuan-lora/status/${result.lora_id}`);
          const progressData = await progressResponse.json();
          
          setTrainingProgress(progressData.progress);
          
          if (progressData.status === 'completed' || progressData.status === 'failed') {
            clearInterval(pollProgress);
            if (progressData.status === 'completed') {
              onSubmit(result);
            } else {
              throw new Error('Training failed');
            }
          }
        } catch (error) {
          clearInterval(pollProgress);
          throw error;
        }
      }, 5000);

    } catch (error) {
      console.error("Error starting training:", error);
      toast({
        title: "Training Error",
        description: error instanceof Error ? error.message : "Failed to start training",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Hunyuan LoRA Training Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="instance_prompt">Instance Prompt</Label>
          <Input
            id="instance_prompt"
            placeholder="Enter the instance prompt (e.g., 'a photo of sks dog')"
            value={instancePrompt}
            onChange={(e) => setInstancePrompt(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="class_prompt">Class Prompt (Optional)</Label>
          <Input
            id="class_prompt"
            placeholder="Enter the class prompt (e.g., 'a photo of a dog')"
            value={classPrompt}
            onChange={(e) => setClassPrompt(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_urls">Training Images</Label>
          <Input
            id="image_urls"
            placeholder="Enter image URLs (comma-separated)"
            value={imageUrls.join(", ")}
            onChange={(e) => handleUrlsChange(e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground">
            Enter URLs of training images, separated by commas
          </p>

          {/* Image Previews */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative border rounded-lg overflow-hidden">
                  {preview.status === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  {preview.status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-2">
                      <AlertCircleIcon className="h-8 w-8 text-destructive" />
                      <p className="text-xs text-center text-destructive mt-2">{preview.error}</p>
                    </div>
                  )}
                  {preview.status === 'valid' && (
                    <Image
                      src={preview.url}
                      alt={`Training image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-background rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircleIcon className="h-6 w-6 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="training_steps">Training Steps: {numTrainingSteps}</Label>
            </div>
            <Slider
              id="training_steps"
              min={50}
              max={1000}
              step={50}
              value={[numTrainingSteps]}
              onValueChange={([value]) => setNumTrainingSteps(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="learning_rate">Learning Rate: {learningRate}</Label>
            </div>
            <Slider
              id="learning_rate"
              min={0.00001}
              max={0.001}
              step={0.00001}
              value={[learningRate]}
              onValueChange={([value]) => setLearningRate(value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select value={resolution.toString()} onValueChange={(value) => setResolution(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512">512 x 512</SelectItem>
                <SelectItem value="768">768 x 768</SelectItem>
                <SelectItem value="1024">1024 x 1024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="text_encoder">Train Text Encoder</Label>
              <p className="text-sm text-muted-foreground">
                Enable to train the text encoder alongside the model
              </p>
            </div>
            <Switch
              id="text_encoder"
              checked={trainTextEncoder}
              onCheckedChange={setTrainTextEncoder}
            />
          </div>
        </div>

        {/* Training Progress */}
        {trainingProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Training Progress</span>
              <span>{Math.round(trainingProgress)}%</span>
            </div>
            <Progress value={trainingProgress} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || imagePreviews.some(p => p.status !== 'valid')}>
          {isLoading ? "Starting Training..." : "Start Training"}
        </Button>
      </form>
    </div>
  );
};

export default HunyuanLoraTrainingInterface; 