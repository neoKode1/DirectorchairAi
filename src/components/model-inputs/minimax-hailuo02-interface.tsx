"use client";

import React, { useState, useRef } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Play, Zap } from 'lucide-react';

interface MinimaxHailuo02InterfaceProps {
  onGenerate: (result: any) => void;
}

export const MinimaxHailuo02Interface: React.FC<MinimaxHailuo02InterfaceProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [duration, setDuration] = useState('6');
  const [promptOptimizer, setPromptOptimizer] = useState(true);
  const [resolution, setResolution] = useState('768P');
  const [isGenerating, setIsGenerating] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImageFile(file);
      setImagePreview(preview);
    };
    reader.readAsDataURL(file);
    
    console.log(`📁 [MinimaxHailuo02] Image uploaded:`, file.name, `(${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    console.log(`🗑️ [MinimaxHailuo02] Image removed`);
  };

  const handleGenerate = async () => {
    console.log('🎬 [MinimaxHailuo02] Generate button clicked');
    
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt describing your video.",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Image Required",
        description: "Please upload a starting image for image-to-video generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Upload the image file first
      console.log('📤 [MinimaxHailuo02] Uploading image file...');
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);
      
      const imageUploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: imageFormData,
      });

      if (!imageUploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const imageUploadResult = await imageUploadResponse.json();
      console.log('✅ [MinimaxHailuo02] Image uploaded:', imageUploadResult.url);

      const generateData = {
        endpointId: "fal-ai/minimax/hailuo-02/standard/image-to-video",
        text: prompt.trim(), // API expects 'text' parameter
        image_url: imageUploadResult.url,
        duration: duration,
        prompt_optimizer: promptOptimizer,
        resolution: resolution,
      };

      console.log('🎯 [MinimaxHailuo02] Generation data:', generateData);

      const response = await fetch('/api/generate/minimax/hailuo02', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API call failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 [MinimaxHailuo02] API response:', result);

      onGenerate(result);

      toast({
        title: "Video Generated!",
        description: "Your Minimax Hailuo 02 video has been generated successfully.",
      });

      // Reset form
      setPrompt('');
      handleRemoveImage();

    } catch (error: any) {
      console.error('❌ [MinimaxHailuo02] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video with Minimax Hailuo 02.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCostInfo = () => {
    const baseCost = 1; // Base cost for 6s, 768P
    let multiplier = 1;
    
    if (duration === '10') multiplier *= 1.5; // 10s costs more
    if (resolution === '512P') multiplier *= 0.8; // Lower resolution costs less
    
    return baseCost * multiplier;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Minimax Hailuo 02 Standard - Image to Video
          </CardTitle>
          <CardDescription>
            Latest Minimax Hailuo 02 model with enhanced quality and optimized performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Video Description *
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe the motion and scene you want to create from your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              Be detailed about the motion, camera movement, and atmosphere for best results
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Starting Image *
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Starting image"
                    className="max-w-full max-h-48 mx-auto rounded border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">{imageFile?.name}</p>
                  <Badge variant="secondary" className="mt-2">
                    Ready for Animation
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Upload Starting Image</p>
                    <p className="text-sm text-gray-500">Click to select or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Video Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration</Label>
              <Select value={duration} onValueChange={setDuration} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 seconds (Standard)</SelectItem>
                  <SelectItem value="10">10 seconds (1.5x cost)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Note: 10s videos not supported for 1080p resolution
              </p>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Resolution</Label>
              <Select value={resolution} onValueChange={setResolution} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="768P">768P (Standard)</SelectItem>
                  <SelectItem value="512P">512P (0.8x cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prompt Optimizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Prompt Optimizer</Label>
              <Switch
                checked={promptOptimizer}
                onCheckedChange={setPromptOptimizer}
                disabled={isGenerating}
              />
            </div>
            <p className="text-xs text-gray-500">
              Automatically optimizes your prompt for better results
            </p>
          </div>

          {/* Features Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">✨ Minimax Hailuo 02 Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Enhanced image-to-video quality
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Optimized prompt processing
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Improved motion consistency
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Latest Minimax technology
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Estimated Cost</h4>
                <p className="text-sm text-blue-700">
                  {getCostInfo()}x base cost • {duration}s • {resolution}
                </p>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {getCostInfo()}x Credits
              </Badge>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || !imageFile || isGenerating}
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Video...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Generate Video with Hailuo 02
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
