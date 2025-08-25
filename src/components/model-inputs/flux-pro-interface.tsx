"use client";

import { useState } from 'react';
import { button as Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FluxProInterfaceProps {
  onGenerate: (data: any) => void;
  isGenerating?: boolean;
}

export default function FluxProInterface({ onGenerate, isGenerating = false }: FluxProInterfaceProps) {
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState<number | undefined>();
  const [syncMode, setSyncMode] = useState(false);
  const [numImages, setNumImages] = useState(1);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [safetyTolerance, setSafetyTolerance] = useState<'1' | '2' | '3' | '4' | '5' | '6'>('2');
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'21:9' | '16:9' | '4:3' | '3:2' | '1:1' | '2:3' | '3:4' | '9:16' | '9:21'>('16:9');
  const [raw, setRaw] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const generateData = {
      endpointId: 'fal-ai/flux-pro/v1.1-ultra',
      prompt: prompt.trim(),
      seed,
      sync_mode: syncMode,
      num_images: numImages,
      enable_safety_checker: enableSafetyChecker,
      output_format: outputFormat,
      safety_tolerance: safetyTolerance,
      enhance_prompt: enhancePrompt,
      aspect_ratio: aspectRatio,
      raw,
    };

    onGenerate(generateData);
  };

  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    setSeed(randomSeed);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Flux Pro v1.1 Ultra
          </CardTitle>
          <CardDescription>
            Generate high-quality images with advanced text-to-image model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your image description..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seed */}
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="seed"
                  type="number"
                  placeholder="Random"
                  value={seed || ''}
                  onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  max="2147483647"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRandomSeed}
                  size="sm"
                >
                  Random
                </Button>
              </div>
            </div>

            {/* Number of Images */}
            <div className="space-y-2">
              <Label htmlFor="numImages">Number of Images</Label>
              <Select value={numImages.toString()} onValueChange={(value) => setNumImages(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="2:3">2:3 (Portrait Photo)</SelectItem>
                  <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                  <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
                  <SelectItem value="9:21">9:21 (Mobile Ultrawide)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <Select value={outputFormat} onValueChange={(value: 'jpeg' | 'png') => setOutputFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Safety Settings */}
          <div className="space-y-2">
            <Label htmlFor="safetyTolerance">Safety Tolerance</Label>
            <Select value={safetyTolerance} onValueChange={(value: any) => setSafetyTolerance(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Most Strict</SelectItem>
                <SelectItem value="2">2 - Strict</SelectItem>
                <SelectItem value="3">3 - Moderate</SelectItem>
                <SelectItem value="4">4 - Permissive</SelectItem>
                <SelectItem value="5">5 - Very Permissive</SelectItem>
                <SelectItem value="6">6 - Most Permissive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="syncMode">Sync Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Wait for image to be generated before returning response
                </p>
              </div>
              <Switch
                id="syncMode"
                checked={syncMode}
                onCheckedChange={setSyncMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableSafetyChecker">Safety Checker</Label>
                <p className="text-sm text-muted-foreground">
                  Enable content safety filtering
                </p>
              </div>
              <Switch
                id="enableSafetyChecker"
                checked={enableSafetyChecker}
                onCheckedChange={setEnableSafetyChecker}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enhancePrompt">Enhance Prompt</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically improve your prompt for better results
                </p>
              </div>
              <Switch
                id="enhancePrompt"
                checked={enhancePrompt}
                onCheckedChange={setEnhancePrompt}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="raw">Raw Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Generate less processed, more natural-looking images
                </p>
              </div>
              <Switch
                id="raw"
                checked={raw}
                onCheckedChange={setRaw}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>

          {/* Model Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">High Quality</Badge>
            <Badge variant="secondary">Advanced AI</Badge>
            <Badge variant="secondary">Multiple Formats</Badge>
            <Badge variant="secondary">Safety Controls</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
