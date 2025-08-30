"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { button as Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Settings, 
  Image, 
  Video, 
  Music, 
  Mic,
  Check,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { AVAILABLE_ENDPOINTS, type ApiInfo } from '@/lib/fal';
import { cn } from '@/lib/utils';
import { ModelIcon } from '@/components/model-icons';

interface ModelPreferences {
  image: string | null;
  video: string | null;
  music: string | null;
  voiceover: string | null;
}

interface ModelPreferenceSelectorProps {
  onPreferencesChange?: (preferences: ModelPreferences) => void;
  className?: string;
}

export function ModelPreferenceSelector({ 
  onPreferencesChange, 
  className 
}: ModelPreferenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ModelPreferences>({
    image: null,
    video: null,
    music: null,
    voiceover: null,
  });

  // Group models by category
  const modelsByCategory = AVAILABLE_ENDPOINTS.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, ApiInfo[]>);

  // Load preferences from localStorage
  useEffect(() => {
    console.log('🔄 [ModelPreferenceSelector] Loading preferences from localStorage...');
    const saved = localStorage.getItem('narrative-model-preferences');
    if (saved) {
      try {
        const parsedPreferences = JSON.parse(saved);
        console.log('📋 [ModelPreferenceSelector] Loaded preferences:', parsedPreferences);
        
        // Clean up preferences - convert "none" to null
        const cleanedPreferences = {
          image: parsedPreferences.image === 'none' ? null : parsedPreferences.image,
          video: parsedPreferences.video === 'none' ? null : parsedPreferences.video,
          music: parsedPreferences.music === 'none' ? null : parsedPreferences.music,
          voiceover: parsedPreferences.voiceover === 'none' ? null : parsedPreferences.voiceover,
        };
        
        console.log('📋 [ModelPreferenceSelector] Cleaned preferences:', cleanedPreferences);
        setPreferences(cleanedPreferences);
        
        // Use setTimeout to avoid calling onPreferencesChange during render
        setTimeout(() => {
          console.log('📋 [ModelPreferenceSelector] Calling onPreferencesChange with cleaned preferences');
          onPreferencesChange?.(cleanedPreferences);
        }, 0);
      } catch (error) {
        console.error('❌ [ModelPreferenceSelector] Failed to load model preferences:', error);
      }
    } else {
      console.log('📋 [ModelPreferenceSelector] No saved preferences found, setting defaults');
      
      // Set default preferences
      const defaultPreferences = {
        image: 'fal-ai/flux-pro/v1.1-ultra', // Default to Flux v1.1
        video: 'fal-ai/kling-video/v2.1/master/image-to-video', // Default to Kling Master v2.1 I2V
        music: null,
        voiceover: null,
      };
      
      setPreferences(defaultPreferences);
      
      // Save default preferences to localStorage
      localStorage.setItem('narrative-model-preferences', JSON.stringify(defaultPreferences));
      console.log('💾 [ModelPreferenceSelector] Saved default preferences to localStorage');
      
      // Call onPreferencesChange with defaults
      setTimeout(() => {
        console.log('📋 [ModelPreferenceSelector] Calling onPreferencesChange with default preferences');
        onPreferencesChange?.(defaultPreferences);
      }, 0);
    }
  }, []); // Remove onPreferencesChange dependency to prevent infinite loop

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: ModelPreferences) => {
    console.log('💾 [ModelPreferenceSelector] Saving new preferences:', newPreferences);
    setPreferences(newPreferences);
    localStorage.setItem('narrative-model-preferences', JSON.stringify(newPreferences));
    console.log('💾 [ModelPreferenceSelector] Preferences saved to localStorage');
    onPreferencesChange?.(newPreferences);
    console.log('💾 [ModelPreferenceSelector] onPreferencesChange callback called');
    
    // Dispatch custom event to notify other components of preference changes
    const preferenceChangeEvent = new CustomEvent('model-preferences-changed', {
      detail: {
        preferences: newPreferences,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(preferenceChangeEvent);
    console.log('📡 [ModelPreferenceSelector] Dispatched model-preferences-changed event');
  }, [onPreferencesChange]);

  const handleModelSelect = (category: keyof ModelPreferences, modelId: string) => {
    console.log('🎯 [ModelPreferenceSelector] Model selected:', { category, modelId });
    
    // Convert "none" to null for internal storage
    const valueToStore = modelId === 'none' ? null : modelId;
    
    const newPreferences = {
      ...preferences,
      [category]: valueToStore,
    };
    console.log('🎯 [ModelPreferenceSelector] New preferences object:', newPreferences);
    savePreferences(newPreferences);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'voiceover':
        return <Mic className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image':
        return 'text-blue-400';
      case 'video':
        return 'text-purple-400';
      case 'music':
        return 'text-green-400';
      case 'voiceover':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSelectedModel = (category: keyof ModelPreferences) => {
    const modelId = preferences[category];
    if (!modelId || modelId === 'none' || modelId === null) return null;
    return AVAILABLE_ENDPOINTS.find(model => model.endpointId === modelId);
  };

  const getCompletionStatus = () => {
    const totalCategories = Object.keys(modelsByCategory).length;
    const selectedCategories = Object.values(preferences).filter(value => 
      value && value !== '' && value !== 'none' && value !== null
    ).length;
    return { selected: selectedCategories, total: totalCategories };
  };

  const status = getCompletionStatus();
  const isComplete = status.selected === status.total;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative glass border-border/50 text-foreground hover:bg-secondary/50",
            className
          )}
        >
          <Settings className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Model Preferences</span>
          {isComplete ? (
            <Check className="w-4 h-4 sm:ml-2 text-success" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:ml-2 text-warning" />
          )}
          <Badge 
            variant="secondary" 
            className="ml-2 badge-enhanced hidden sm:inline-flex"
          >
            {status.selected}/{status.total}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-heading font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Model Preferences
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select your preferred AI models for content generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(modelsByCategory).map(([category, models]) => (
            <Card key={category} className="glass-light border-border/30">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("flex items-center gap-2", getCategoryColor(category))}>
                    {getCategoryIcon(category)}
                    <h3 className="text-subheading font-medium capitalize">
                      {category}
                    </h3>
                  </div>
                  {preferences[category as keyof ModelPreferences] !== null && (
                    <Badge 
                      variant="outline" 
                      className={
                        preferences[category as keyof ModelPreferences] === null
                          ? "badge-secondary"
                          : "badge-success"
                      }
                    >
                      {preferences[category as keyof ModelPreferences] === null ? (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          None
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Selected
                        </>
                      )}
                    </Badge>
                  )}
                </div>

                <Select
                  value={preferences[category as keyof ModelPreferences] || "none"}
                  onValueChange={(value) => handleModelSelect(category as keyof ModelPreferences, value)}
                >
                  <SelectTrigger className="w-full input-enhanced">
                    <SelectValue placeholder={`Select ${category} model...`} />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem 
                      value="none"
                      className="text-foreground hover:bg-secondary/50 focus:bg-secondary/50"
                    >
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-muted-foreground" />
                        <span>None</span>
                      </div>
                    </SelectItem>
                    {models.map((model) => (
                      <SelectItem 
                        key={model.endpointId} 
                        value={model.endpointId}
                        className="text-foreground hover:bg-secondary/50 focus:bg-secondary/50"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 flex-1">
                            <ModelIcon model={model.endpointId} size="sm" />
                            <div className="flex-1">
                              <div className="font-medium">{model.label}</div>
                              {model.inputAsset && (
                                <Badge variant="outline" className="mt-1 text-xs badge-secondary">
                                  Requires {model.inputAsset.join(', ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {preferences[category as keyof ModelPreferences] !== null && (
                  <div className="mt-3 p-3 glass-light rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-muted-foreground">
                        {preferences[category as keyof ModelPreferences] === null ? (
                          <span>Generation will be skipped for this category</span>
                        ) : (
                          <span>{getSelectedModel(category as keyof ModelPreferences)?.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}

          <Separator className="bg-border/30" />

          <div className="glass-light rounded-lg p-4">
            <h4 className="text-subheading font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-info" />
              How It Works
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Select your preferred model for each content type</li>
              <li>• The AI will automatically use these models for your requests</li>
              <li>• Settings are saved locally in your browser</li>
            </ul>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isComplete ? (
                <span className="text-success flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  All preferences set
                </span>
              ) : (
                <span className="text-warning flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {status.total - status.selected} categories need selection
                </span>
              )}
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              className="btn-primary"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ModelPreferences };
