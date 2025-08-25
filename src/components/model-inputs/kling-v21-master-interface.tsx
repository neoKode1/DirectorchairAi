"use client";

import React, { useState, useRef } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Play, Sparkles } from 'lucide-react';

interface KlingV21MasterInterfaceProps {
  onGenerate: (result: any) => void;
}

export const KlingV21MasterInterface: React.FC<KlingV21MasterInterfaceProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [duration, setDuration] = useState('5');
  const [negativePrompt, setNegativePrompt] = useState('blur, distort, and low quality');
  const [cfgScale, setCfgScale] = useState([0.5]);
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
    
    console.log(`📁 [KlingV21Master] Image uploaded:`, file.name, `(${(file.size / 1024 / 1024).toFixed(1)} MB)`);
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
    console.log(`🗑️ [KlingV21Master] Image removed`);
  };

  const handleGenerate = async () => {
    console.log('🎬 [KlingV21Master] Generate button clicked');
    
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
      console.log('📤 [KlingV21Master] Uploading image file...');
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
      console.log('✅ [KlingV21Master] Image uploaded:', imageUploadResult.url);

      const generateData = {
        endpointId: "fal-ai/kling-video/v2.1/master/image-to-video",
        prompt: prompt.trim(),
        image_url: imageUploadResult.url,
        duration: duration,
        negative_prompt: negativePrompt.trim(),
        cfg_scale: cfgScale[0],
      };

      console.log('🎯 [KlingV21Master] Generation data:', generateData);

      const response = await fetch('/api/generate/kling/v21-master', {
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
      console.log('📦 [KlingV21Master] API response:', result);

      onGenerate(result);

      toast({
        title: "Video Generated!",
        description: "Your Kling v2.1 Master video has been generated successfully.",
      });

      // Reset form
      setPrompt('');
      handleRemoveImage();

    } catch (error: any) {
      console.error('❌ [KlingV21Master] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video with Kling v2.1 Master.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCostInfo = () => {
    const baseCost = 1; // Base cost for 5s
    let multiplier = 1;
    
    if (duration === '10') multiplier *= 2;
    
    return baseCost * multiplier;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Kling v2.1 Master - Image to Video
          </CardTitle>
          <CardDescription>
            Latest Kling video generation with enhanced quality, motion realism, and advanced AI capabilities
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
                  <SelectItem value="5">5 seconds (Standard)</SelectItem>
                  <SelectItem value="10">10 seconds (2x cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* CFG Scale */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                CFG Scale: {cfgScale[0]}
              </Label>
              <Slider
                value={cfgScale}
                onValueChange={setCfgScale}
                max={1.0}
                min={0.1}
                step={0.1}
                className="w-full"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500">
                Higher values stick closer to your prompt
              </p>
            </div>
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
              Describe unwanted elements, artifacts, or styles
            </p>
          </div>

          {/* Features Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">✨ Kling v2.1 Master Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Enhanced motion realism
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Improved temporal consistency
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Better prompt adherence
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Advanced AI processing
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Estimated Cost</h4>
                <p className="text-sm text-blue-700">
                  {getCostInfo()}x base cost • {duration}s duration
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
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Video...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Generate Video with Kling v2.1 Master
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
