"use client";

import React, { useState, useEffect } from 'react';
import { button as Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Veo3InterfaceProps {
  onGenerate: (data: any) => void;
  isGenerating?: boolean;
}

export const Veo3Interface: React.FC<Veo3InterfaceProps> = ({
  onGenerate,
  isGenerating = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'5s' | '6s' | '7s' | '8s'>('8s');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [autoFix, setAutoFix] = useState(true);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  
  const { toast } = useToast();

  const handleGenerate = async () => {
    console.log('🎬 [Veo3Interface] Generate button clicked');
    
    if (!prompt.trim()) {
      console.log('❌ [Veo3Interface] Empty prompt');
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate your video.",
        variant: "destructive",
      });
      return;
    }

    const generateData = {
      endpointId: "fal-ai/veo3/image-to-video",
      prompt: prompt.trim(),
      ...(negativePrompt.trim() && { negative_prompt: negativePrompt.trim() }),
      ...(imageUrl && { image_url: imageUrl }),
      aspect_ratio: aspectRatio,
      duration: duration,
      resolution: resolution,
      enhance_prompt: enhancePrompt,
      auto_fix: autoFix,
      generate_audio: generateAudio,
      ...(seed !== undefined && { seed }),
    };

    console.log('🚀 [Veo3Interface] Generating with data:', generateData);

    try {
      // Call the API endpoint
      const response = await fetch('/api/generate/veo3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('✅ [Veo3Interface] Generation successful:', result);
      onGenerate(result);

      toast({
        title: "Video Generated!",
        description: "Your Veo3 video has been generated successfully.",
      });

    } catch (error: any) {
      console.error('❌ [Veo3Interface] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video with Veo3.",
        variant: "destructive",
      });
    }
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
    console.log('🎲 [Veo3Interface] Random seed generated:', randomSeed);
  };

  const clearSeed = () => {
    setSeed(undefined);
    console.log('🧹 [Veo3Interface] Seed cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Google Veo3 Image-to-Video
        </Badge>
        <span className="text-sm text-gray-600">
          Animate images into videos with Google's latest model
        </span>
      </div>

      <Card className="p-6 space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-sm font-medium">
            Image to Animate (Optional)
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {imageUrl ? (
              <div className="space-y-2">
                <img src={imageUrl} alt="Uploaded" className="max-w-full h-32 object-contain mx-auto" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl('')}
                  disabled={isGenerating}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Upload an image to animate</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setImageUrl(url);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                  disabled={isGenerating}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isGenerating}
                >
                  Choose Image
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Upload an image to animate it into a video (JPG, PNG, WEBP, GIF, AVIF)
          </p>
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium">
            Prompt *
          </Label>
          <Textarea
            id="prompt"
            placeholder={imageUrl ? "Describe how to animate the image..." : "Describe the video you want to generate..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500">
            {imageUrl ? "Describe how to animate the uploaded image" : "Describe your video in detail for best results"}
          </p>
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <Label htmlFor="negative-prompt" className="text-sm font-medium">
            Negative Prompt
          </Label>
          <Textarea
            id="negative-prompt"
            placeholder="What you don't want in the video..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500">
            Optional: Specify what to avoid in the generation
          </p>
        </div>

        <Separator />

        {/* Video Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={(value: '16:9' | '9:16') => setAspectRatio(value)} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Duration</Label>
            <Select value={duration} onValueChange={(value: '8s') => setDuration(value)} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5s">5 seconds</SelectItem>
                <SelectItem value="6s">6 seconds</SelectItem>
                <SelectItem value="7s">7 seconds</SelectItem>
                <SelectItem value="8s">8 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Resolution</Label>
            <Select value={resolution} onValueChange={(value: '720p' | '1080p') => setResolution(value)} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Seed (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Random"
                value={seed || ''}
                onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isGenerating}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRandomSeed}
                disabled={isGenerating}
              >
                🎲
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSeed}
                disabled={isGenerating}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Advanced Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Advanced Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Enhance Prompt */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Enhance Prompt</Label>
                <p className="text-xs text-gray-500">
                  AI-enhance your prompt
                </p>
              </div>
              <Switch
                checked={enhancePrompt}
                onCheckedChange={setEnhancePrompt}
                disabled={isGenerating}
              />
            </div>

            {/* Auto Fix */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Auto Fix</Label>
                <p className="text-xs text-gray-500">
                  Fix policy violations
                </p>
              </div>
              <Switch
                checked={autoFix}
                onCheckedChange={setAutoFix}
                disabled={isGenerating}
              />
            </div>

            {/* Generate Audio */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Generate Audio</Label>
                <p className="text-xs text-gray-500">
                  Include audio track
                </p>
              </div>
              <Switch
                checked={generateAudio}
                onCheckedChange={setGenerateAudio}
                disabled={isGenerating}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-12 text-lg font-medium"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Video...
            </>
          ) : (
            <>
              🎬 Generate Video with Veo3
            </>
          )}
        </Button>

        {/* Credit Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {generateAudio ? 'Full credits' : '33% less credits'} • High-quality video generation
          </p>
        </div>
      </Card>
    </div>
  );
};
