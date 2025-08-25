"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { button as Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image, 
  Sparkles, 
  Camera, 
  Lightbulb,
  Film,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { intelligenceCore } from '@/lib/intelligence-core';
import { imageStyleExtractor, type StyleAnalysis } from '@/lib/image-style-extractor';

interface StyleReferenceUploaderProps {
  onStyleExtracted: (styleAnalysis: StyleAnalysis) => void;
  onStyleApplied: (enhancedPrompt: string) => void;
  className?: string;
}

export function StyleReferenceUploader({ 
  onStyleExtracted, 
  onStyleApplied,
  className 
}: StyleReferenceUploaderProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setUploadedImage(imageUrl);
        setError(null);
        setStyleAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const analyzeImageStyle = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Extract style from image
      const analysis = await imageStyleExtractor.extractStyleFromImage(uploadedImage);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setStyleAnalysis(analysis);
      onStyleExtracted(analysis);

      console.log('🎨 [StyleReferenceUploader] Style analysis completed:', analysis);

    } catch (error) {
      console.error('❌ [StyleReferenceUploader] Error analyzing image:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image style');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyStyleToPrompt = async (basePrompt: string = '') => {
    if (!styleAnalysis) return;

    try {
      const result = await intelligenceCore.extractAndApplyImageStyle(
        uploadedImage!, 
        basePrompt
      );

      if (result.success && result.enhancedPrompt) {
        onStyleApplied(result.enhancedPrompt);
        console.log('🎨 [StyleReferenceUploader] Style applied to prompt:', result.enhancedPrompt);
      } else {
        setError(result.error || 'Failed to apply style to prompt');
      }
    } catch (error) {
      console.error('❌ [StyleReferenceUploader] Error applying style:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply style');
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setStyleAnalysis(null);
    setError(null);
    setAnalysisProgress(0);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="w-5 h-5" />
          Style Reference Uploader
        </CardTitle>
        <CardDescription>
          Upload a reference image to extract its cinematic style and apply it to your prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50",
            uploadedImage && "border-green-500 bg-green-50"
          )}
        >
          <input {...getInputProps()} />
          {uploadedImage ? (
            <div className="space-y-2">
              <img 
                src={uploadedImage} 
                alt="Reference" 
                className="max-h-32 mx-auto rounded"
              />
              <p className="text-sm text-muted-foreground">
                Image uploaded successfully
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm">
                {isDragActive 
                  ? "Drop the image here..." 
                  : "Drag & drop an image here, or click to select"
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, WebP
              </p>
            </div>
          )}
        </div>

        {/* Analysis Controls */}
        {uploadedImage && !styleAnalysis && (
          <div className="space-y-2">
            <Button 
              onClick={analyzeImageStyle} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Style...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Extract Cinematic Style
                </>
              )}
            </Button>
            
            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={analysisProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  Analyzing lighting, composition, color palette, and mood...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Style Analysis Results */}
        {styleAnalysis && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h4 className="font-medium">Style Analysis Complete</h4>
            </div>
            
            <div className="space-y-3">
              {/* Director Recommendation */}
              <div>
                <p className="text-sm font-medium">Recommended Director Style:</p>
                <Badge variant="secondary" className="mt-1">
                  {styleAnalysis.directorRecommendation.replace('_', ' ')}
                </Badge>
              </div>

              {/* Extracted Elements */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Lighting:</p>
                  <p>{styleAnalysis.extractedStyle.lighting.slice(0, 2).join(', ')}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Composition:</p>
                  <p>{styleAnalysis.extractedStyle.composition.slice(0, 2).join(', ')}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Color Palette:</p>
                  <p>{styleAnalysis.extractedStyle.colorPalette.slice(0, 2).join(', ')}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Mood:</p>
                  <p>{styleAnalysis.extractedStyle.mood.slice(0, 2).join(', ')}</p>
                </div>
              </div>

              {/* Confidence */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analysis Confidence:</p>
                <Progress 
                  value={styleAnalysis.extractedStyle.confidence * 100} 
                  className="w-full mt-1" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(styleAnalysis.extractedStyle.confidence * 100)}% confident
                </p>
              </div>

              {/* Enhanced Prompt Preview */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enhanced Prompt:</p>
                <p className="text-sm bg-background p-2 rounded border mt-1">
                  {styleAnalysis.enhancedPrompt}
                </p>
              </div>

              {/* Apply Style Button */}
              <Button 
                onClick={() => applyStyleToPrompt()}
                className="w-full"
                variant="default"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Apply Style to Current Prompt
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
