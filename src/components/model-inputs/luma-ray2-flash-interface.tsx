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

interface LumaRay2FlashInterfaceProps {
  onGenerate: (result: any) => void;
}

export const LumaRay2FlashInterface: React.FC<LumaRay2FlashInterfaceProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [endImageFile, setEndImageFile] = useState<File | null>(null);
  const [endImagePreview, setEndImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [resolution, setResolution] = useState('540p');
  const [loop, setLoop] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const endImageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (file: File, isEndImage: boolean = false) => {
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
      if (isEndImage) {
        setEndImageFile(file);
        setEndImagePreview(preview);
      } else {
        setImageFile(file);
        setImagePreview(preview);
      }
    };
    reader.readAsDataURL(file);
    
    console.log(`📁 [LumaRay2Flash] ${isEndImage ? 'End image' : 'Image'} uploaded:`, file.name, `(${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isEndImage: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, isEndImage);
    }
  };

  const handleRemoveImage = (isEndImage: boolean = false) => {
    if (isEndImage) {
      setEndImageFile(null);
      setEndImagePreview(null);
      if (endImageInputRef.current) {
        endImageInputRef.current.value = '';
      }
    } else {
      setImageFile(null);
      setImagePreview(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
    console.log(`🗑️ [LumaRay2Flash] ${isEndImage ? 'End image' : 'Image'} removed`);
  };

  const handleGenerate = async () => {
    console.log('🎬 [LumaRay2Flash] Generate button clicked');
    
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
      console.log('📤 [LumaRay2Flash] Uploading image file...');
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
      console.log('✅ [LumaRay2Flash] Image uploaded:', imageUploadResult.url);

      let endImageUrl = undefined;
      if (endImageFile) {
        console.log('📤 [LumaRay2Flash] Uploading end image file...');
        const endImageFormData = new FormData();
        endImageFormData.append('file', endImageFile);
        
        const endImageUploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: endImageFormData,
        });

        if (!endImageUploadResponse.ok) {
          throw new Error('Failed to upload end image');
        }

        const endImageUploadResult = await endImageUploadResponse.json();
        endImageUrl = endImageUploadResult.url;
        console.log('✅ [LumaRay2Flash] End image uploaded:', endImageUrl);
      }

      const generateData = {
        endpointId: "fal-ai/luma-dream-machine/ray-2-flash/image-to-video",
        prompt: prompt.trim(),
        image_url: imageUploadResult.url,
        ...(endImageUrl && { end_image_url: endImageUrl }),
        aspect_ratio: aspectRatio,
        duration: duration,
        resolution: resolution,
        loop: loop,
      };

      console.log('🎯 [LumaRay2Flash] Generation data:', generateData);

      const response = await fetch('/api/generate/luma/ray2-flash', {
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
      console.log('📦 [LumaRay2Flash] API response:', result);

      onGenerate(result);

      toast({
        title: "Video Generated!",
        description: "Your Luma Ray 2 Flash video has been generated successfully.",
      });

      // Reset form
      setPrompt('');
      handleRemoveImage(false);
      handleRemoveImage(true);

    } catch (error: any) {
      console.error('❌ [LumaRay2Flash] Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video with Luma Ray 2 Flash.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCostInfo = () => {
    const baseCost = 1; // Base cost for 540p, 5s
    let multiplier = 1;
    
    if (resolution === '720p') multiplier *= 2;
    if (resolution === '1080p') multiplier *= 4;
    if (duration === '9s') multiplier *= 2;
    
    return baseCost * multiplier;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Luma Ray 2 Flash - Image to Video
          </CardTitle>
          <CardDescription>
            Transform your images into dynamic videos with Luma's fastest image-to-video model
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
              placeholder="Describe how you want to animate your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              Be specific about the motion, style, and atmosphere you want
            </p>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starting Image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Starting Image *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Starting image"
                      className="max-w-full max-h-32 mx-auto rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(false)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">{imageFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to upload starting image</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isGenerating}
                />
              </div>
            </div>

            {/* End Image (Optional) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                End Image <Badge variant="secondary" className="text-xs">Optional</Badge>
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                {endImagePreview ? (
                  <div className="relative">
                    <img
                      src={endImagePreview}
                      alt="End image"
                      className="max-w-full max-h-32 mx-auto rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(true)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">{endImageFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to upload end image</p>
                    <p className="text-xs text-gray-400">Video will blend to this image</p>
                  </div>
                )}
                <input
                  ref={endImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>

          {/* Video Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem value="9:21">9:21 (Tall)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration</Label>
              <Select value={duration} onValueChange={setDuration} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5s">5 seconds</SelectItem>
                  <SelectItem value="9s">9 seconds (2x cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Resolution</Label>
              <Select value={resolution} onValueChange={setResolution} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="540p">540p (Standard)</SelectItem>
                  <SelectItem value="720p">720p (2x cost)</SelectItem>
                  <SelectItem value="1080p">1080p (4x cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Loop Video</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="loop"
                  checked={loop}
                  onCheckedChange={setLoop}
                  disabled={isGenerating}
                />
                <Label htmlFor="loop" className="text-sm">
                  {loop ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Estimated Cost</h4>
                <p className="text-sm text-blue-700">
                  {getCostInfo()}x base cost • {resolution} • {duration}
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
                Generate Video with Ray 2 Flash
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
