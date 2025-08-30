"use client";

import React, { useState, useEffect } from 'react';
import { button as Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Heart, 
  Zap, 
  Sparkles, 
  Film,
  Lightbulb,
  Clock,
  Eye,
  Play,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  filmDirectorData, 
  analyzePromptForSuggestions, 
  getRandomSuggestions,
  generateDirectorEnhancedSuggestions,
  analyzePromptForDirectorStyle,
  type ShotSuggestion 
} from '@/lib/film-director-data';
import { intelligenceCore, type CinematicSuggestion } from '@/lib/intelligence-core';

interface FilmDirectorSuggestionsProps {
  currentPrompt: string;
  onSuggestionClick: (suggestion: string) => void;
  contentType?: 'image' | 'video' | 'audio' | 'lipsync';
  className?: string;
  lastGeneratedPrompt?: string; // Add this prop to pass the last generated prompt
  onStyleCommand?: (command: string) => void; // Add callback for style commands
  onStyleAnalysis?: (analysis: any) => void; // Add callback for style analysis results
  onStyleImageUpload?: (imageFile: File, imageUrl: string) => void; // Add callback for style image upload
}

export function FilmDirectorSuggestions({ 
  currentPrompt, 
  onSuggestionClick, 
  contentType = 'image',
  className,
  lastGeneratedPrompt,
  onStyleCommand,
  onStyleAnalysis,
  onStyleImageUpload
}: FilmDirectorSuggestionsProps) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState<ShotSuggestion[]>([]);
  const [randomSuggestions, setRandomSuggestions] = useState<ShotSuggestion[]>([]);
  const [interactiveSuggestions, setInteractiveSuggestions] = useState<CinematicSuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedStyleImage, setUploadedStyleImage] = useState<File | null>(null);
  const [styleAnalysisResult, setStyleAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎯 [FilmDirectorSuggestions] useEffect triggered');
    console.log('🎯 [FilmDirectorSuggestions] Current prompt:', currentPrompt);
    console.log('🎯 [FilmDirectorSuggestions] Content type:', contentType);
    
    // Analyze current prompt for director-enhanced suggestions
    const promptSuggestions = generateDirectorEnhancedSuggestions(currentPrompt, 6);
    console.log('🎯 [FilmDirectorSuggestions] Director-enhanced suggestions:', promptSuggestions);
    setSuggestions(promptSuggestions);

    // Get random director-enhanced suggestions for inspiration
    const randomSuggestions = generateDirectorEnhancedSuggestions("", 8);
    console.log('🎯 [FilmDirectorSuggestions] Random director suggestions:', randomSuggestions);
    setRandomSuggestions(randomSuggestions);

    // Get interactive suggestions from intelligence core
    const availableSuggestions = intelligenceCore.getAvailableSuggestions(contentType);
    console.log('🎯 [FilmDirectorSuggestions] Interactive suggestions:', availableSuggestions);
    setInteractiveSuggestions(availableSuggestions);
    
    // Log director style analysis
    if (currentPrompt) {
      const directorStyle = analyzePromptForDirectorStyle(currentPrompt);
      console.log('🎯 [FilmDirectorSuggestions] Director style analysis:', directorStyle);
    }
  }, [currentPrompt, contentType]);

  const handleSuggestionClick = (suggestion: ShotSuggestion | string) => {
    if (typeof suggestion === 'string') {
      onSuggestionClick(suggestion);
    } else {
      onSuggestionClick(suggestion.name);
    }
  };

  const handleInteractiveSuggestionClick = async (suggestion: CinematicSuggestion) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    console.log(`🎯 [FilmDirectorSuggestions] Interactive suggestion clicked: ${suggestion.name}`);

    try {
      // Use the last generated prompt if available, otherwise use current prompt
      const basePrompt = lastGeneratedPrompt || currentPrompt;
      console.log(`🎯 [FilmDirectorSuggestions] Using base prompt: ${basePrompt}`);
      
      // Create context for the intelligence core
      const context = {
        currentPrompt: basePrompt,
        contentType: contentType,
        userContext: [],
        lastGeneratedContent: null
      };

      // Process the suggestion through the intelligence core
      const result = await intelligenceCore.handleInteractiveSuggestion(suggestion.name, context);
      
      if (result.success) {
        console.log(`✅ [FilmDirectorSuggestions] Suggestion processed successfully:`, result);
        
        // Handle different action types
        switch (result.action) {
          case 'prompt-modification':
            if (result.modifiedPrompt) {
              // Update the input with the modified prompt
              onSuggestionClick(result.modifiedPrompt);
            }
            break;
            
          case 'workflow-trigger':
            if (result.triggeredWorkflow) {
              // Trigger the workflow execution
              console.log(`🚀 [FilmDirectorSuggestions] Triggering workflow:`, result.triggeredWorkflow);
              // This would integrate with the workflow execution system
              // For now, we'll just show the user message
              onSuggestionClick(result.userMessage);
            }
            break;
            
          case 'direct-generation':
            // Handle direct generation
            onSuggestionClick(result.userMessage);
            break;
        }
      } else {
        console.error(`❌ [FilmDirectorSuggestions] Suggestion processing failed:`, result.error);
        // Show error message to user
        onSuggestionClick(`❌ Error: ${result.userMessage}`);
      }
    } catch (error) {
      console.error(`❌ [FilmDirectorSuggestions] Error processing interactive suggestion:`, error);
      onSuggestionClick(`❌ Error: Failed to process suggestion. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'genre':
        return <Film className="w-3 h-3" />;
      case 'emotion':
        return <Heart className="w-3 h-3" />;
      case 'keyword':
        return <Eye className="w-3 h-3" />;
      case 'shot-type':
        return <Camera className="w-3 h-3" />;
      case 'lighting':
        return <Sparkles className="w-3 h-3" />;
      case 'movement':
        return <Play className="w-3 h-3" />;
      case 'workflow':
        return <Settings className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'genre':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'emotion':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'keyword':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'shot-type':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'lighting':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'movement':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'workflow':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getInteractiveCategoryColor = (category: CinematicSuggestion['category']) => {
    switch (category) {
      case 'shot-type':
        return 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30';
      case 'lighting':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30';
      case 'movement':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30';
      case 'workflow':
        return 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30';
      case 'genre':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30';
      case 'emotion':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30';
      case 'keyword':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30';
    }
  };

  console.log('🎯 [FilmDirectorSuggestions] Rendering component');
  console.log('🎯 [FilmDirectorSuggestions] Suggestions count:', suggestions.length);
  console.log('🎯 [FilmDirectorSuggestions] Random suggestions count:', randomSuggestions.length);
  console.log('🎯 [FilmDirectorSuggestions] Interactive suggestions count:', interactiveSuggestions.length);
  
  return (
    <div className={cn("w-full bg-gray-900/20 backdrop-blur-md rounded-lg border border-white/10", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-md border border-white/10">
          <TabsTrigger 
            value="suggestions" 
            className="text-xs text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Smart
          </TabsTrigger>
          <TabsTrigger 
            value="interactive" 
            className="text-xs text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Zap className="w-3 h-3 mr-1" />
            Actions
          </TabsTrigger>
          <TabsTrigger 
            value="genres" 
            className="text-xs text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Film className="w-3 h-3 mr-1" />
            Genres
          </TabsTrigger>
          <TabsTrigger 
            value="inspiration" 
            className="text-xs text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Inspiration
          </TabsTrigger>
          <TabsTrigger 
            value="style" 
            className="text-xs text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            <ImageIcon className="w-3 h-3 mr-1" />
            Style
          </TabsTrigger>
        </TabsList>

                 {/* Smart Suggestions Tab */}
         <TabsContent value="suggestions" className="p-4 space-y-3">
           <div className="flex items-center gap-2 mb-3">
             <Lightbulb className="w-4 h-4 text-yellow-400" />
             <span className="text-sm font-medium text-yellow-400">Smart Analysis</span>
           </div>
           
           {suggestions.length > 0 ? (
             <div className="flex flex-wrap gap-2">
               {suggestions.map((suggestion, index) => (
                 <Button
                   key={index}
                   variant="outline"
                   size="sm"
                   onClick={() => handleSuggestionClick(suggestion)}
                   disabled={isProcessing}
                   className={cn(
                     "h-auto p-2 text-xs transition-all duration-200",
                     getCategoryColor(suggestion.category),
                     "hover:scale-105 hover:shadow-lg"
                   )}
                 >
                   <div className="flex items-center gap-1">
                     {getCategoryIcon(suggestion.category)}
                     <span>{suggestion.name}</span>
                   </div>
                 </Button>
               ))}
             </div>
           ) : (
             <div className="space-y-3">
               <p className="text-sm text-gray-400">Try these popular techniques:</p>
               <div className="flex flex-wrap gap-2">
                 {getRandomSuggestions(6).map((suggestion, index) => (
                   <Button
                     key={index}
                     variant="outline"
                     size="sm"
                     onClick={() => handleSuggestionClick(suggestion)}
                     disabled={isProcessing}
                     className={cn(
                       "h-auto p-2 text-xs transition-all duration-200",
                       getCategoryColor(suggestion.category),
                       "hover:scale-105 hover:shadow-lg"
                     )}
                   >
                     <div className="flex items-center gap-1">
                       {getCategoryIcon(suggestion.category)}
                       <span>{suggestion.name}</span>
                     </div>
                   </Button>
                 ))}
               </div>
             </div>
           )}
         </TabsContent>

        {/* Interactive Actions Tab */}
        <TabsContent value="interactive" className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Interactive Actions</span>
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
              Click to Execute
            </Badge>
          </div>
          
          {interactiveSuggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interactiveSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInteractiveSuggestionClick(suggestion)}
                  disabled={isProcessing}
                  className={cn(
                    "h-auto p-2 text-xs transition-all duration-200 cursor-pointer",
                    getInteractiveCategoryColor(suggestion.category),
                    "hover:scale-105 hover:shadow-lg",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(suggestion.category)}
                    <span>{suggestion.name}</span>
                    {suggestion.workflowTrigger && (
                      <Badge variant="outline" className="ml-1 text-xs bg-red-500/20 text-red-300 border-red-500/30">
                        Workflow
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No interactive actions available for {contentType} mode...</p>
          )}
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Processing suggestion...</span>
            </div>
          )}
        </TabsContent>

        {/* Genres Tab */}
        <TabsContent value="genres" className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Genre Techniques</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(filmDirectorData.genres).map(([genre, genreData]) => (
              <div key={genre} className="space-y-2">
                <h4 className="text-sm font-medium text-purple-300 capitalize">{genre}</h4>
                <div className="flex flex-wrap gap-1">
                  {(genreData as any).techniques.slice(0, 3).map((technique: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(technique)}
                      disabled={isProcessing}
                      className="h-6 px-2 text-xs bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20"
                    >
                      {technique}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Inspiration Tab */}
        <TabsContent value="inspiration" className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-400">Random Inspiration</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {randomSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion.name)}
                disabled={isProcessing}
                className={cn(
                  "h-auto p-2 text-xs transition-all duration-200",
                  getCategoryColor(suggestion.category),
                  "hover:scale-105 hover:shadow-lg"
                )}
              >
                <div className="flex items-center gap-1">
                  {getCategoryIcon(suggestion.category)}
                  <span>{suggestion.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>

        {/* Style Reference Tab */}
        <TabsContent value="style" className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Style Reference</span>
          </div>
          
          <div className="space-y-3">
            {/* Style Reference Upload */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/90">Upload Reference Image:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedStyleImage(file);
                      
                      try {
                        setIsProcessing(true);
                        
                        // Upload the image to get a public URL
                        const formData = new FormData();
                        formData.append('image', file);
                        
                        const uploadResponse = await fetch('/api/upload-image', {
                          method: 'POST',
                          body: formData
                        });
                        
                        if (!uploadResponse.ok) {
                          throw new Error('Failed to upload image');
                        }
                        
                        const uploadResult = await uploadResponse.json();
                        const publicImageUrl = uploadResult.url;
                        const dataUrl = uploadResult.dataUrl; // Base64 data URL for FAL.ai
                        
                        console.log('📤 [FilmDirectorSuggestions] Image uploaded successfully:', publicImageUrl);
                        console.log('📤 [FilmDirectorSuggestions] Base64 data URL available for FAL.ai');
                        
                        // Notify parent component of the style image upload with data URL for FAL.ai
                        if (onStyleImageUpload) {
                          onStyleImageUpload(file, dataUrl);
                        }
                        
                        // Analyze the image style using the public URL
                        const analysisResponse = await fetch('/api/extract-prompt', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            imageUrl: publicImageUrl,
                            prompt: 'Analyze this image for cinematic style elements including lighting, composition, color palette, mood, and visual techniques.'
                          })
                        });
                        
                        if (analysisResponse.ok) {
                          const analysis = await analysisResponse.json();
                          const enhancedPrompt = analysis.prompt || analysis.enhancedPrompt || 'cinematic style analysis';
                          setStyleAnalysisResult(enhancedPrompt);
                          
                          // Notify parent component of the analysis
                          if (onStyleAnalysis) {
                            onStyleAnalysis({
                              imageUrl: publicImageUrl,
                              analysis: enhancedPrompt,
                              extractedStyle: analysis.extractedStyle
                            });
                          }
                          
                          // Add the style analysis to the current prompt
                          if (onStyleCommand) {
                            onStyleCommand(`Style reference applied: ${enhancedPrompt}`);
                          }
                        }
                      } catch (error) {
                        console.error('Error processing style image:', error);
                      } finally {
                        setIsProcessing(false);
                      }
                    }
                  }}
                  className="text-xs text-white/90 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyan-500/20 file:text-cyan-300 file:border-cyan-500/30 hover:file:bg-cyan-500/30"
                />
              </div>
              
              {/* Show uploaded image preview */}
              {uploadedStyleImage && (
                <div className="mt-2">
                  <span className="text-xs text-white/90">Uploaded: {uploadedStyleImage.name}</span>
                </div>
              )}
            </div>

            {/* Quick Style Commands */}
            <div className="space-y-2">
              <span className="text-xs text-gray-300">Quick Style Commands:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (uploadedStyleImage) {
                      try {
                        setIsProcessing(true);
                        const imageUrl = URL.createObjectURL(uploadedStyleImage);
                        
                        const response = await fetch('/api/extract-prompt', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            imageUrl: imageUrl,
                            prompt: 'Analyze this image for cinematic style elements including lighting, composition, color palette, mood, and visual techniques.'
                          })
                        });
                        
                        if (response.ok) {
                          const analysis = await response.json();
                          setStyleAnalysisResult(analysis.enhancedPrompt);
                          
                          // Notify parent component of the analysis
                          if (onStyleAnalysis) {
                            onStyleAnalysis({
                              imageUrl: imageUrl,
                              analysis: analysis.enhancedPrompt,
                              extractedStyle: analysis.extractedStyle
                            });
                          }
                          
                          // Add the style analysis to the current prompt
                          if (onStyleCommand) {
                            onStyleCommand(`Style reference applied: ${analysis.enhancedPrompt}`);
                          }
                        }
                      } catch (error) {
                        console.error('Error analyzing style:', error);
                      } finally {
                        setIsProcessing(false);
                      }
                    } else {
                      onStyleCommand?.('/extract-style-from-current');
                    }
                  }}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  {isProcessing ? 'Analyzing...' : 'Extract Current Style'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-villeneuve-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Villeneuve Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-nolan-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Nolan Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-fincher-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Fincher Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-kurosawa-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Kurosawa Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-hitchcock-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Hitchcock Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-kubrick-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Kubrick Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-tarantino-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Tarantino Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-anderson-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Wes Anderson Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-coen-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  Coen Brothers Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStyleCommand?.('/apply-pta-style')}
                  disabled={isProcessing}
                  className="h-6 px-2 text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
                >
                  PTA Style
                </Button>
              </div>
            </div>

            {/* Style Analysis Results */}
            <div className="space-y-2">
              <span className="text-xs text-white/90">Style Analysis:</span>
              <div className="text-xs text-white/90 bg-black/20 p-2 rounded border border-gray-700/50">
                {styleAnalysisResult ? (
                  <div>
                    <div className="font-medium text-cyan-300 mb-1">Extracted Style Elements:</div>
                    <div className="text-white/80">{styleAnalysisResult}</div>
                  </div>
                ) : (
                  <div>
                    {uploadedStyleImage ? 
                      "Click 'Extract Current Style' to analyze the uploaded image and apply its cinematic style to your next prompt." :
                      "Upload a reference image to extract its cinematic style elements."
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
